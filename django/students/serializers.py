from django.forms import ValidationError
from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()
# class UsersSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Users
#         fields = ['id','email', 'password', 'role_id']
#         extra_kwargs={
#             'password':{'write_only':True}
#         }

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'is_staff', 'is_teacher', 'is_student']

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id']
     
class ProjectSerializerId(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id']

class SkillsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'skill']     

class SkillsWeightSerializer(serializers.ModelSerializer):
    skill = SkillsSerializer() 
    class Meta:
        model = Skills_weight
        fields = ['skill', 'weight_skill'] 

class SelectedProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelectedProject
        fields = ['project']
        


class StudentSerializer(serializers.ModelSerializer):
    projects = serializers.SerializerMethodField()
    selected_projects = serializers.SerializerMethodField()

    class Meta:
        model = Student
        depth = 1
        fields = ['id', 'name', 'direction', 'course', 'is_study', 'projects', 'skills', 'selected_projects']

    def get_projects(self, obj):
        projects = Project.objects.filter(student=obj, status=False)
        project_serializer = ProjectSerializer(projects, many=True)
        return project_serializer.data
    
    def get_selected_projects(self, obj):
        selected_projects = SelectedProject.objects.filter(student=obj)
        
        selected_projects_data = []
        for selected_project in selected_projects:
            project_id = selected_project.project_id
            project = Project.objects.get(id=project_id)
            project_data = {
                'id': project.id,
                'name': project.title,
            }
            selected_project_data = SelectedProjectSerializer(selected_project).data
            selected_project_data['project'] = project_data
            selected_projects_data.append(selected_project_data)
        
        return selected_projects_data

class ProjectSerializer(serializers.ModelSerializer):
    selected_students = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Project
        depth = 1
        fields = ['id', 'title', 'photo', 'description', 'teachers', 'count', 'status', 'created_at', 'updated_at', 'tags', 'students', 'skills', 'selected_students']

    def create(self, validated_data):
        return Project.objects.create(**validated_data) 
    
    def get_skills(self, obj):
        skills_weight = Skills_weight.objects.filter(project=obj)
        skills_data = []
        for skill_weight in skills_weight:
            skills_data.append({
                'id': skill_weight.skill.id,
                'skill': skill_weight.skill.skill,
                'weight_skill': skill_weight.weight_skill
            })
        return skills_data
    
    def get_selected_students(self, obj):
        selected_students = SelectedProject.objects.filter(project=obj)
        
        selected_students_data = []
        for selected_student in selected_students:
            student_id = selected_student.student_id
            student = Student.objects.get(id=student_id)
            
            # Получаем все оценки студента
            grades = Skills_students.objects.filter(student=student)
            total_grades = sum([grade.score for grade in grades])
            average_grade = total_grades / len(grades) if len(grades) > 0 else 0
            
            student_data = {
                'id': student.id,
                'name': student.name,
                'average': average_grade,  # Добавляем средний балл студента
            }
            
            selected_student_data = SelectedProjectSerializer(selected_student).data
            selected_student_data['student'] = student_data
            selected_students_data.append(selected_student_data)
        
        return selected_students_data
    
class TagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'tag']      
        
class ProjectDetailsSerializer(serializers.ModelSerializer):
    # customer = CustomerSerializer()
    class Meta:
        model = Project
        depth = 1
        fields = ['id', 'title', 'subtitle', 'description', 'requirements', 'count', 'status']

class TagsProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag_project
        fields = ['id', 'project_id', 'tag_id']                      


class TeacherSerializer(serializers.ModelSerializer):
    user = UsersSerializer()
    class Meta:
        model = Teacher
        fields =  ['id', 'name', 'user']


class TeacherSerializerId(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields =  ['id']


# class ProjectTeacherSerializer(serializers.ModelSerializer):
#     project = ProjectSerializer()
#     teacher = TeacherSerializer()
#     class Meta:
#         model = Project_details
#         fields = ['project', 'teacher']

class DisciplineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discipline
        fields = '__all__'

         
class ProfileSerializer(serializers.Serializer):
    user = UserSerializer(many=False, read_only=True)

    def get(self, instance):
        if instance.user.is_student:
            serializer = StudentSerializer()
        elif instance.user.is_teacher:
            serializer = TeacherSerializer()
        else:
            raise ValueError("Unknown user type")
        
        return serializer.data


