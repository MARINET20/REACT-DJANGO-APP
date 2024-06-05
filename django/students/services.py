from .models import *
from django.contrib.auth.models import User
from typing import List
from django.contrib.auth import get_user_model, authenticate
from django.core.exceptions import ObjectDoesNotExist

User = get_user_model()


# def get_student(user: User) -> Student: # получаем студента
#     return Student.objects.get(user_id=user.id)

def get_project(project: Project) -> Project: # получаем проект по id-ку
    return Project.objects.get(id=project.id)

def create_tags_for_project(project: Project, tag_ids: List[int]): # создаем теги к проекту
    for tag_id in tag_ids:
        tag_project = Tag_project.objects.create(project=project, tag_id=tag_id)
        tag_project.save()

def create_discipline(name: str): # создаем дисциплину
    discipline = Discipline.objects.create(name=name)
    discipline.save()

def create_skills_for_project(project: Project, skill: Skill, weight_value: float):
    try:
        skill_project = Skills_weight.objects.get(project=project, skill=skill)
        skill_project.weight_skill = weight_value  # Обновляем вес, если навык уже существует для проекта
        skill_project.save()
    except Skills_weight.DoesNotExist:  # Если навык не существует, то создаем новую запись
        skill_project = Skills_weight.objects.create(project=project, skill=skill, weight_skill=weight_value)
        skill_project.save()                                                  
    # if not created:
    #     # Если запись уже существует, обновляем вес
    #     skill_project.weight_skill = weight_value
    #     skill_project.save()        

def create_teacher_for_project(project: Project, teacher: Teacher): # создаем преподов к проекту
    teacher_project = Project_details.objects.create(project=project, teacher=teacher)
    teacher_project.save()

def create_students_for_project(project: Project, student: Student):
    try:
        history_project = History_project.objects.get(project=project, student=student)
        history_project.save()
    except History_project.DoesNotExist:  # Если связи с проектом нет у студента, то создаем новую запись
        history_project = History_project.objects.create(project=project, student=student)
        history_project.save()   

# ДОБАВЛЕНИЕ ОЦЕНКИ ЗА НАВЫК СТУДЕНТУ(-АМ)
def create_skills_for_students(discipline_id: Discipline, skills:List, students:List[int], score:int):
    discipline = Discipline.objects.get(id=discipline_id)

    for studentId in students:
        student = Student.objects.get(id=studentId)
        for skillObj in skills:
            if skillObj['id'] is not None:
                try:
                    skill = Skill.objects.get(id=skillObj['id'])
                except Skill.DoesNotExist: 
                    skill = Skill.objects.create(skill=skillObj['skill'])  
            else:
                skill = Skill.objects.get_or_create(skill=skillObj['skill'])[0]
            try:
                studentSkill = Skills_students.objects.get(student=student, skill=skill, discipline=discipline)
                studentSkill.score = score  # Обновляем оценку
                studentSkill.save()
            except Skills_students.DoesNotExist:  # Если записи такой нет, то создаем 
                studentSkill = Skills_students.objects.create(student=student, skill=skill, discipline=discipline, score=score)
                studentSkill.save()


def edit_user_student(student: Student, course: int, direction:str, isStudy:bool, name:str):
    student.name = name
    student.course = course
    student.direction = direction
    student.is_study = isStudy
    student.save()


    user = User.objects.get(id=student.id)  # Обновлено: использовать teacher.id для получения пользователя

    if not isStudy:  # Обновлено: сравниваем с логическим значением, а не строкой 'false'
        user.is_active = False
    else:
        user.is_active = True  # Обновлено: на случай, если isWork истина (True), активируем пользователя
    user.save()


def edit_user_teacher(teacher: Teacher, isWork:bool, name:str):
    teacher.name = name
    teacher.save()

    user = User.objects.get(id=teacher.id)  # Обновлено: использовать teacher.id для получения пользователя

    if not isWork:  # Обновлено: сравниваем с логическим значением, а не строкой 'false'
        user.is_active = False
    else:
        user.is_active = True  # Обновлено: на случай, если isWork истина (True), активируем пользователя
    user.save()


# добавление оценок и навыков студентов через файл
def add_scores_students_for_file(discipline: Discipline, emailStudents:List[str], skillIds:List[int], score:List[int]):
    for emailName, scoreValue in zip(emailStudents, score):
        user = User.objects.filter(email=emailName).first()
        if user:
            try: 
                student = Student.objects.get(user = user)
                for skillId in skillIds:
                    try:
                        skill = Skill.objects.get(id=skillId)
                        try:
                            studentSkill = Skills_students.objects.get(student=student, skill=skill, discipline=discipline)
                            studentSkill.score = scoreValue  # Обновляем оценку
                            studentSkill.save()
                        except Skills_students.DoesNotExist:  # Если записи такой нет, то создаем 
                            studentSkill = Skills_students.objects.create(student=student, skill=skill, discipline=discipline, score=scoreValue)
                            studentSkill.save() 
                    except Skill.DoesNotExist:  # Если навыка нет, то создаем  
                        skill = Skill.objects.create(skill=skillId)  # Создаем навык
                        skill = Skill.objects.get(id=skill.id)
                        studentSkill = Skills_students.objects.create(student=student, skill=skill, discipline=discipline, score=score)
                        studentSkill.save()
            except Student.DoesNotExist:  
                continue

def add_selected_project(student: Student, project: Project):
    try:
        selected_project = SelectedProject.objects.get(student=student, project=project)
        selected_project.project = project
        selected_project.save()
    except ObjectDoesNotExist:
        SelectedProject.objects.create(student=student, project=project)

def delete_selected_project(student: Student, project: Project):
    selected_project = SelectedProject.objects.get(student=student, project=project)
    selected_project.delete()           

def add_users_for_file(direction:str, emails:List[str], names:List[str], course:int, is_student:bool):
    for email, name in zip(emails, names):
        user, created = User.objects.get_or_create(email=email, defaults={'password': ''})
        if user:
            if is_student:
                user.is_student = True
                user.is_teacher = False
                user.save()
                student, student_created = Student.objects.get_or_create(user=user, defaults={'name': name, 'direction': direction, 'course': course, 'is_study': True})
                if student:
                    student.name = name
                    student.direction = direction
                    student.course = course
                    student.is_study = True
                    student.save()
            else:
                user.is_student = False
                user.is_teacher = True
                user.save()
                teacher, teacher_created = Teacher.objects.get_or_create(user=user, defaults={'name': name})
                if teacher:
                    teacher.name = name
                    teacher.save()    