import random
import re
from .serializers import *
from .models import *
from .policies import *
from rest_framework.response import Response
from rest_framework import generics, status, permissions, viewsets
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .services import *
from django.http import JsonResponse
import json
import numpy as np
import pandas as pd
from itertools import combinations
import networkx as nx #Рисунок графа
from sklearn.cluster import SpectralClustering #Кластеризация
from scipy.spatial import distance
from .model import find_the_best_team
from django.http import HttpResponse
from django.db.models import F, Count , Sum, Avg, OuterRef, Subquery
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.contrib.auth import get_user_model

#новое
import os
from dotenv import load_dotenv
import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
from nltk.corpus import stopwords
stopwords = set(stopwords.words('english'))
from docx import Document
import requests
from googletrans import Translator
import spacy
nlp = spacy.load("en_core_web_sm")


User = get_user_model()


# Декоратор для проверки роли пользователя
def teacher_required(function):
    def wrap(request, *args, **kwargs):
        if request.user.is_teacher == True:
            return function(request, *args, **kwargs)
        else:
            return HttpResponse("Unauthorized", status=401)
    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap
    
def admin_required(function):
    def wrap(request, *args, **kwargs):
        if request.user.is_staff == True:
            return function(request, *args, **kwargs)
        else:
            return HttpResponse("Unauthorized", status=401)
    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap

# отправка сообщения на почту
@api_view(['POST'])
def send_email_with_token(request):
    email = request.data.get('email')
    user = User.objects.get(email=email)    
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    message = render_to_string('/', {
        'uid': uid,
    })
    send_mail('Ссылка для входа в систему', message, settings.EMAIL_HOST_USER, [email])
    
    return Response(status=status.HTTP_200_OK)

# добавления комнады к проекту
@api_view(['POST'])
def add_history_project(request):
    project_id = request.data.get('project_id')
    students_ids = request.data.get('students_ids')

    if project_id and students_ids:
        try:
            project = Project.objects.get(id=project_id)
            for student_id in students_ids:
                student = Student.objects.get(id=student_id)
                create_students_for_project(project,student)
            response = Response({'message': 'Команда успешно добавлена к проекту'}, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            response = Response({'error': 'Проект c указанным id не найден'}, status=status.HTTP_404_NOT_FOUND)
    else:
        response = Response({'error': 'Нехватает данных для добавления команды к проекту'}, status=status.HTTP_400_BAD_REQUEST)
    return response


#получение проектов, в которых не набрано нужное кол-во участников
def get_projects(request):
    projects = Project.objects.filter(status=False).annotate(participants_count=Count('student')).filter(count__gt=F('participants_count'))
    # data = list(projects.values('id', 'title' ,'count', 'participants_count'))
    data = []
    for project in projects:
        project_data = {
            'id': project.id,
            'title': project.title,
            'description': project.description,
            'skills': [skill.skill for skill in project.skills.all()],
            'count': project.count,
            'participants_count': project.participants_count,
            
        }
        data.append(project_data)

    return JsonResponse(data, safe=False)

#получение проектов, в которых не набрано нужное кол-во участников
def get_project_id(request, pk):
    try:
        project = Project.objects.filter(id=pk).annotate(participants_count=Count('student')).get()
        project_data = {
            'title': project.title,
            'description': project.description,
            'count': project.count,
            'skills': [skill.skill for skill in project.skills.all()],
            'participants_count': project.participants_count,
        }
        return JsonResponse(project_data)
    except Project.DoesNotExist:
        return JsonResponse({'error': 'Проект не найден'}, status=status.HTTP_404_NOT_FOUND)


#получение проектов, в которых набрано нужное кол-во участников
def get_projects_a_team_formed(request):
    projects = Project.objects.annotate(participants_count=Count('student')).filter(count__lte=F('participants_count'))
    
    data = []
    for project in projects:
        project_data = {
            'id': project.id,
            'title': project.title,
            'count': project.count,
            'participants_count': project.participants_count,
            'teachers': [{'id': teacher.id, 'name': teacher.name} for teacher in project.teachers.all()],
            'tags': [tag.tag for tag in project.tags.all()]
        }
        data.append(project_data)

    return JsonResponse(data, safe=False)    

# Получение всех уникальных значений направлений обучения
def get_directions_from_db(request):
    students = Student.objects.all()

    directions = students.values_list('direction', flat=True).distinct()

    directions_list = list(directions)

    json_data = [{'direction': direction} for direction in directions_list]

    return JsonResponse(json_data, safe=False)

# Получение всех уникальных значений курсов обучения
def get_courses_from_db(request):
    students = Student.objects.all()

    courses = students.values_list('course', flat=True).distinct()

    courses_list = list(courses)

    json_data = [{'course': course} for course in courses_list]

    return JsonResponse(json_data, safe=False)

# Получение всех уникальных значений кол-во участников
def get_count_from_db(request):
    projects = Project.objects.all()

    counts = projects.values_list('count', flat=True).distinct()

    counts_list = list(counts)

    json_data = [{'count': count} for count in counts_list]

    return JsonResponse(json_data, safe=False)


# Получение проектов по запросу пользователя
@api_view(['POST'])
def get_info_from_db(request):
    teacher = request.data.get('teacher')
    count = request.data.get('count')
    status = request.data.get('status')

    projects = Project.objects.all()

    if teacher is not None:
        projects = projects.filter(teacher=teacher)
    if status:
        projects = projects.filter(status=status)
    if count is not None:
        projects = projects.filter(count=int(count))

    serializer = ProjectSerializer(projects, many=True)
    return Response(serializer.data)



@csrf_exempt
@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        user = None

    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        login_url = f'http://127.0.0.1/login/{uid}/{token}'
        send_mail(
            'Вход в систему',
            f'Перейдите по ссылке, чтобы войти в систему: {login_url}',
            'from@example.com',
            [email],
            fail_silently=False,
        )
        return Response({'message': 'Ссылка для входа отпрвлена на почту!'}, status=status.HTTP_200_OK)
    return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

#получение студентов, которые участвуют в проектах
def get_students_is_project(request):
    students = Student.objects.filter(is_study=True, history_project__project__status=False)
    if students:
        data = list(students.values('id', 'name', 'direction', 'course'))
        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({'error': 'No students found'}, status=404)


# В этом примере мы создаем модель UserProfile, которая связана с моделью User. 
# Мы определяем две роли: администратор и редактор. Затем мы используем permission_classes, 
# чтобы определить, что доступ к просмотру и изменению профилей UserProfile имеют только аутентифицированные пользователи
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
# профиль пользователей
@api_view(['GET'])
def user_profile(request, pk):
    try:
        user = User.objects.get(id=pk)
        if user.is_student:
            student = Student.objects.get(user=user)
            data = {
                'is_staff' : user.is_staff,
                'is_student' : user.is_student,
                'is_teacher' : user.is_teacher,
                'email': user.email,
                'user_info': {
                    'id': student.id,
                    'name': student.name,
                    'direction': student.direction,
                    'course': student.course,
                    'is_study': student.is_study,
                    'projects': [
                        {
                            'id': project.id,
                            'title': project.title,
                            'status': project.status,
                        }
                        for project in student.projects.all()
                    ],
                    'skills': [
                        {
                            'id': skill.id,
                            'skill': skill.skill,
                        }
                        for skill in student.skills.all()
                    ],
                    'selected_projects': [
                        {
                            'id': selected_project.project_id,
                            'title': Project.objects.get(id=selected_project.project_id).title,
                            'status': Project.objects.get(id=selected_project.project_id).status,
                        }
                        for selected_project in SelectedProject.objects.filter(student=student)
                    ]
                }
            }
        elif user.is_teacher:
            teacher = Teacher.objects.get(user=user)
            data = {
                'is_staff' : user.is_staff,
                'is_student' : user.is_student,
                'is_teacher' : user.is_teacher,
                'email': user.email,
                'user_info': {
                    'id': teacher.id,
                    'name': teacher.name,
                    'projects': [
                        {
                            'id': project.id,
                            'title': project.title,
                            'status': project.status,
                        }
                        for project in teacher.projects.all()
                    ],
                }
            }
        elif user.is_staff:
            data = {
                'is_staff' : user.is_staff,
                'is_student' : user.is_student,
                'is_teacher' : user.is_teacher,
                'email': user.email,
            }
        return Response(data)
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def add_team_db(request):
    project_id = request.data.get('project_id')
    studentIds = request.data.get('studentIds')

    # Проверяем, что были переданы идентификаторы студентов
    if not studentIds:
        return Response({'error': 'Не переданы идентификаторы студентов.'}, status=status.HTTP_400_BAD_REQUEST)

    # Получаем объект проекта по переданному id
    project = Project.objects.get(id=project_id)

    # Перебираем идентификаторы студентов
    for student_id in studentIds:
        # Получаем объект студента по переданному id
        student = Student.objects.get(id=student_id)
        # Создаем запись в таблице History_project
        create_students_for_project(project, student)

    # Возвращаем успешный ответ
    return Response({'message': 'Студенты добавлены в проект!'}, status=200)


def get_student(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
        data = {
            'id': student.id,
            'name': student.name,
            'direction': student.direction
        }
        return JsonResponse(data, safe=False)
    except Student.DoesNotExist:
        return JsonResponse({'error': 'no student data'}, status=404)

# отправка 6-ти значного пароля на почту при смене пароля или первого входа
@api_view(['POST'])
def reset_password(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        reset_code = '{:06d}'.format(random.randint(0, 999999))

        # сохранение кода для пользователя
        if PasswordResetCode.objects.filter(user=user).exists():
            reset_code_db = PasswordResetCode.objects.get(user=user)
            reset_code_db.code = reset_code
            reset_code_db.save()  # Обновляем код
        else:
            reset_code_db = PasswordResetCode.objects.create(user=user, code=reset_code)
            reset_code_db.save()  # Создаем новую запись
        # reset_code_db = PasswordResetCode.objects.create(user=user, code=reset_code)
        # reset_code_db.save()  # Обновляем  код

        message = f'Ваш код подтверждения: {reset_code}'
        send_mail('Подтвердите свой электронный адрес', message, settings.EMAIL_HOST_USER, [email])
        
        return Response({'message': 'Код отправлен на почту'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
def change_password(request):
    email = request.data.get('email')
    user_code = request.data.get('verificationCode')
    new_password = request.data.get('password')
    
    # Проверка, что email и код подтверждения предоставлены
    if not email or not user_code:
        return Response({'error': 'Необходимо предоставить email и код подтверждения'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        reset_code = PasswordResetCode.objects.get(user=user)
        code_value = reset_code.code
        
        print(user_code, ' ', code_value)

        if user_code == code_value:
            
            user.set_password(new_password)
            user.save()
            reset_code.delete()  # Удаляем объект из базы данных
            return Response({'message': 'Пароль успешно обновлен'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Код подтверждения не совпадает'}, status=status.HTTP_400_BAD_REQUEST)
        
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def delete_applications_view(request):
    project_id = request.data.get('project_id')
    user_id = request.data.get('user_id')

    try:
        user = User.objects.get(id=user_id)

        student = Student.objects.get(user=user)
        project = Project.objects.get(id=project_id)

        delete_selected_project(student, project)

        return Response({'message': 'Проект удален из избранных!'}, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def application_view(request):
    project_id = request.data.get('project_id')
    user_id = request.data.get('user_id')

    user = User.objects.get(id=user_id)
    try:

        student = Student.objects.get(user=user)
        project = Project.objects.get(id=project_id)

        add_selected_project(student, project)

        return Response({'message': 'Запрос успешно отправлен!'}, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

class SelectedProjectView(generics.ListAPIView):
    queryset = SelectedProject.objects.all()
    serializer_class = SelectedProjectSerializer


## МОДЕЛЬ ФОРМИРОВАНИЯ СТУДЕНЧЕСКИХ КОМАНД ##
    
# Получение разного состава участников команд из проектов
def get_projects_and_participants(request):
    projects = Project.objects.filter(status=True).prefetch_related('history_project_set')  
    project_participants = {}

    for project in projects:
        participants_list = [participant.student_id for participant in project.history_project_set.all()]
        project_participants[project.id] = participants_list

    data = {
        'Source': [], 
        'Target': []
    }

    for team in project_participants.values():
        for student1, student2 in combinations(team, 2):
            data['Source'].append(student1)
            data['Target'].append(student2)     

    df = pd.DataFrame(data)
    return df

# Формируем класстеры для команд
def search_team_clustering(request, difference):
    df_edges = get_projects_and_participants(request)
    df_nodes = get_students(request)

    G = nx.Graph()
    G.add_nodes_from([node['id'] for node in df_nodes])
    G.add_edges_from([(row['Source'], row['Target']) for index, row in df_edges.iterrows()])

    adj_matrix = nx.to_numpy_array(G)
    num_nodes_per_cluster = difference
    n_clusters = len(G) // num_nodes_per_cluster

    spectral_clustering = SpectralClustering(n_clusters=n_clusters, affinity='precomputed', n_init=700)
    labels = spectral_clustering.fit_predict(adj_matrix)

    cluster_sizes = np.bincount(labels)
    for cluster_idx in np.where(cluster_sizes < num_nodes_per_cluster)[0]:
        centroid_current = np.mean(adj_matrix[labels == cluster_idx], axis=0)
        distances = []
        for i in range(len(cluster_sizes)):
            if i != cluster_idx:
                centroid_other = np.mean(adj_matrix[labels == i], axis=0)
                centroid_current = np.nan_to_num(centroid_current)
                centroid_other = np.nan_to_num(centroid_other)
                distances.append((distance.euclidean(centroid_current, centroid_other), i))
        closest_cluster = min(distances)[1]
        labels[labels == cluster_idx] = closest_cluster

    # Преобразуем данные в формат JSON
    nodes_clusters = [{'node': node, 'cluster': int(cluster)} for node, cluster in enumerate(labels)]

    return nodes_clusters

             
def get_students(request):
    df_students = list(Student.objects.filter(is_study=True).values
                       (('id'), ('name'), ('is_study')))
    
    # Преобразуем данные в формат JSON
    df_nodes = []
    for entry in df_students:
        df_nodes.append({
            'id': entry['id'],
            'name': entry['name'],
            'is_study': entry['is_study']
        })

    return df_nodes    

# получаем список студентов с их тегами и весами
def create_edges_json_file(request, direction, course):
    # Получаем список открытых проектов (status=False)
    open_projects = Project.objects.filter(status=False)
    # Получаем список студентов, которые не участвуют в других проектах с учетом курса и направления обучения
    students_in_course_and_direction = Student.objects.filter(
        is_study=True,
        course=course,
        direction=direction
    ).exclude(
        id__in=History_project.objects.filter(
            project_id__in=open_projects.values('id')
        ).values('student_id')
    ).values('id')

    df_test_stud_skills = Skills_students.objects.filter(student_id__in=students_in_course_and_direction).values('student_id', 'skill_id').annotate(score=Avg('score'))

    # Преобразуем данные в формат JSON
    edges_data = []
    for entry in df_test_stud_skills:
        edges_data.append({
            'Source': entry['student_id'],
            'Target': entry['skill_id'],
            'Weight': entry['score']
        })
    return edges_data

# получение данных о студентах
def create_students_json_file(request, direction, course):
    # Получаем список открытых проектов (status=False)
    open_projects = Project.objects.filter(status=False)
    # Получаем список студентов, которые не участвуют в других проектах с учетом курса и направления обучения
    students = Student.objects.filter(
        is_study=True,
        course=course,
        direction=direction
    ).exclude(
        id__in=History_project.objects.filter(
            project_id__in=open_projects.values('id')
        ).values('student_id')
    ).values('id', 'name')


    # Преобразуем данные в формат JSON
    students_data = []
    for entry in students:
        students_data.append({
            'student_id': entry['id'],
            'name': entry['name'],
        })
    return students_data

def search_team_view(request):
    with open('json_test_proj_skills.json', encoding='utf-8') as f:
        df_test_proj_skills = json.load(f)
    with open('json_clusters.json', encoding='utf-8') as f:
        df_clusters = json.load(f)
    with open('json_edges.json', encoding='utf-8') as f:
        df_edges = json.load(f)
    with open('json_students.json', encoding='utf-8') as f:
        df_students = json.load(f)
      

    result = find_the_best_team(df_test_proj_skills, df_students, df_clusters, df_edges)

    return JsonResponse(result, safe=False)



@api_view(['POST'])
def search_team(request):
    direction = request.data.get('direction')
    course = request.data.get('course')
    project_id = request.data.get('project_id')
    team_size = request.data.get('count')

    
    # связь между студентами
    df_edges = get_projects_and_participants(request)
    json_data = df_edges.to_json(orient='records')  # Преобразование DataFrame в JSON

    G = nx.Graph()
    for index, row in df_edges.iterrows():
        G.add_edge(row['Source'], row['Target'])

    # Функция для поиска команды с участниками, которые работали вместе ранее
    def find_team(node, team_size, visited, team):
        visited[node] = True
        team.append(node)

        if len(team) == team_size:
            return team

        for neighbor in G.neighbors(node):
            if not visited[neighbor]:
                new_team = find_team(neighbor, team_size, visited, team)
                if new_team:
                    return new_team

        team.pop()
        visited[node] = False
        return None     

    teams = []
    visited = {node: False for node in G.nodes()}
    for node in G.nodes():
        if not visited[node]:
            team = find_team(node, team_size, visited, [])
            if team:
                teams.append(team)
    
    # Поиск студентов, которые не попали ни в одну команду
    unassigned_students = [node for node in G.nodes() if not visited[node]]

    # Распределение оставшихся студентов между собой
    for i in range(0, len(unassigned_students), team_size):
        teams.append(unassigned_students[i:i+team_size])

    df_clusters = pd.DataFrame([{'cluster': c1, 'node': c2} for c1,c2 in enumerate(teams)])
    df_transformed = df_clusters.explode('node').reset_index(drop=True)
    
    json_file = df_transformed.to_json(orient='records') 

    edges_file = create_edges_json_file(request, direction=direction, course=course)

    test_proj_skills_file = list(Skills_weight.objects.filter(project_id=project_id).values
                               (id=F('skill_id'), coef=F('weight_skill')))
    
    students_file = create_students_json_file(request, direction=direction, course=course)

    result = find_the_best_team(test_proj_skills_file, students_file, json_file, edges_file)

    # отправляем полученный массив в метод, который получает по id студентов и их оценки по требуемым тегам
    students_data = get_students_score(request, result, project_id)
    
    return JsonResponse({'data': students_data}, safe=False)      

def get_students_score(request, arrays, project_id):
    students_info = []
    nested_list = json.loads(arrays)
    skill_ids = list(Skills_weight.objects.filter(project_id=project_id).values_list('skill_id', flat=True))
    
    for inner_list in nested_list:
        team_scores = []
        student_ids_in_team = []
        for student_id in inner_list:
            student = Student.objects.filter(id=student_id).values('id', 'name', 'direction').first()
            if student:
                student_scores = {skillid: [] for skillid in skill_ids}
                for skillid in skill_ids:
                    scores_data = Skills_students.objects.filter(student=student_id, skill_id=skillid).values('score')
                    if scores_data:
                        skill_scores = [entry['score'] for entry in scores_data]
                        student_scores[skillid] = skill_scores
                team_scores.append({
                    'studentId': student['id'],
                    'scores': student_scores
                })
                student_ids_in_team.append(student['id'])
        
        # Calculate average scores for each skill in the team
        team_avg_scores = {skillid: 0 for skillid in skill_ids}
        for skillid in skill_ids:
            skill_total_score = 0
            count = 0
            for student_scores in team_scores:
                if student_scores['scores'][skillid]:
                    skill_total_score += sum(student_scores['scores'][skillid])
                    count += len(student_scores['scores'][skillid])
            team_avg_scores[skillid] = skill_total_score / count if count > 0 else 0

        students_info.append({
            'studentIds': student_ids_in_team,
            'teamScores': team_scores,
            'score': team_avg_scores,
            'skillIds': skill_ids
        })

    return students_info



#получение оценок у студентов к требованиям проекта
def get_score_students_for_skill_project(request, df_edges, studentIds, skillIds):

    # Получаем данные по оценкам студентов по определенному навыку
    scores_data = Skills_students.objects.filter(studentidin=studentIds, skillidin=skillIds)\
                                            .values('student_id', 'skill_id')\
                                            .annotate(totalscore=Sum('score'))

    # Находим среднее значение
    totalscores = scores_data.aggregate(avgscore=Avg('totalscore'))
    df = pd.DataFrame(list(scores_data))
    
    return {'scores_data': df.todict(), 'average_score': totalscores}
    

# добавление тегов проекта
class ProjectTagsView(generics.ListCreateAPIView):
    queryset = Tag_project.objects.all()
    serializer_class = TagsProjectsSerializer

    def post(self, request, *args, **kwargs):
        project_id = request.data.get('project_id')
        tag_ids = request.data.get('selectedTags')
        
        if project_id and tag_ids:
            project = Project.objects.get(id=project_id)
            create_tags_for_project(project, tag_ids)
            
            return Response({'message': 'Теги успешно добавлены к проекту'}, status=201)
        else:
            return Response({'error': 'Недостаточно данных для создания тегов к проекту'}, status=400)


class DisciplineView(generics.ListCreateAPIView):
    queryset = Discipline.objects.all()
    serializer_class = DisciplineSerializer
        
class DisciplineCreteView(generics.ListCreateAPIView):
    queryset = Discipline.objects.all()
    serializer_class = DisciplineSerializer

    def post(self, request, *args, **kwargs):
        name = request.data.get('name')

        existing_discipline = Discipline.objects.filter(name=name).first()
        if existing_discipline:
            message = "Такая дисциплина уже существует"
            return Response({'error': message}, status=401)
        else:
            create_discipline(name)
            return Response({'message': 'Дисциплина успешно добавлена'}, status=201)
        
class SkillCreteView(generics.ListCreateAPIView):
    pass        


@api_view(['POST'])        
def grade_file_view(request):
    discipline_name = request.data.get('discipline') 
    students = request.data.get('student')        
    skills = request.data.get('skill')
    score = request.data.get('score')

    if discipline_name and students and skills and score:
        discipline, created = Discipline.objects.get_or_create(name=discipline_name)  # Получаем или создаем дисциплину
        for email, scoreValue in zip(students, score):
            user = User.objects.filter(email=email).first()
            if user:
                try: 
                    student = Student.objects.get(user=user)
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
                            studentSkill.score = scoreValue  
                            studentSkill.save()
                        except Skills_students.DoesNotExist:  
                            studentSkill = Skills_students.objects.create(student=student, skill=skill, discipline=discipline, score=scoreValue)
                            studentSkill.save() 
                except Student.DoesNotExist:  
                    continue
        return Response({'message': 'Оценки успешно добавлены!'}, status=status.HTTP_201_CREATED)
    else:
        return Response({'error': 'Заполните все поля!'}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])        
def grade_crete_view(request):

    discipline_id = request.data.get('discipline') 
    students = request.data.get('student')        
    skills = request.data.get('skill')
    score = request.data.get('score')
    newDiscipline = request.data.get('newDiscipline')
    projectName = request.data.get('projectName')
            
    if newDiscipline is None: 
        discipline = Discipline.objects.get(id=discipline_id)
    else:
        existing_discipline = Discipline.objects.filter(name=newDiscipline.get('name'))

        if existing_discipline.exists():
            # Дисциплина с таким названием уже существует, используйте существующую запись
            discipline = existing_discipline.first()
        else:
            # Создайте новую запись
            new_discipline = Discipline.objects.create(name=newDiscipline.get('name'))
            discipline = new_discipline

    # добавление проекта если он есть
    if projectName is not None:
        existing_project = Project.objects.filter(title=projectName)
        if existing_project.exists():
            # Проект с таким названием уже существует, используйте существующую запись
            project = existing_project.first()
        else:
            # Создайте новую запись
            project = Project.objects.create(title=projectName, description=projectName, count=len(students), status=True)

    for studentId in students:
        student = Student.objects.get(id=studentId)
        # добавление связи проекта и студентов
        student_project = History_project.objects.create(project=project, student=student)

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
    return Response({'message': 'Оценки успешно добавлены!'}, status=status.HTTP_201_CREATED)
    # else:
    #     return Response({'error': 'Заполните все поля!'}, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'pk'


class TagDetailView(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagsSerializer

    
class ProjectDetailsView(generics.ListAPIView):
    # только те которые открыты
    queryset = Project.objects.filter(status=False)
    serializer_class = ProjectSerializer


class ProjectCreateView(generics.CreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

# получение списка преподавателей
    
class TeacherView(generics.ListCreateAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer  


class ProjectDetailsIsTrue(generics.ListAPIView):
    queryset = Project.objects.filter(status=False)
    serializer_class = ProjectDetailsSerializer

class SkillView(generics.ListAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillsSerializer

# добавление веса для каждого навыка
class ProjectSkillsView(generics.ListCreateAPIView):
    queryset = Skills_weight.objects.all()
    serializer_class = SkillsWeightSerializer

    def post(self, request, *args, **kwargs):
        project_id = request.data.get('project_id')
        weight_ids = request.data.get('weight_skill')
        skill_ids = request.data.get('skill_ids')

        if project_id and skill_ids and weight_ids:
            project = Project.objects.get(id=project_id)
            create_skills_for_project(weight_ids, project, skill_ids)
            response = Response({'message': 'Коэффициенты для навыков успешно добавлены'})
        return response
    
# добавление стороннего проекта

@api_view(['POST'])
def add_other_project(request):
    if request.method == 'POST':
        title = request.data.get('title')
        description = request.data.get('description')
        teachers = request.data.get('teachers')
        tags = request.data.get('tags')
        students = request.data.get('students')
        skills = request.data.get('skills')
        status_project = True

        if title and description and students and skills:
            count = len(students)

            print(count)
            
            new_project = Project.objects.create(title=title, description=description, count=count, status=status_project)

            if teachers:
                teacher_ids = [teacher['id'] for teacher in teachers]
                new_project.teachers.set(teacher_ids)

            if tags:
                tag_ids = [tag['id'] for tag in tags]
                new_project.tags.set(tag_ids)

            if students:
                student_ids = [student['id'] for student in students]
                new_project.students.set(student_ids)    

            if skills:
                for skill in skills:
                    skill_id = skill['id']
                    weight_value = skill['weight_skill']
                    skill_project = Skills_weight.objects.create(project=new_project, skill_id=skill_id, weight_skill=weight_value)
                    skill_project.save()

            new_project.save()      

            response = Response({'success': 'Проект успешно создан'}, status=status.HTTP_201_CREATED)
        else:
            response = Response({'error': 'Не все поля заполнены!'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        response = Response({'error': 'Метод не разрешен'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    return response

# добавление проекта
@api_view(['POST'])
def add_new_project(request):
    title = request.data.get('title')
    description = request.data.get('description')
    count = request.data.get('count')
    teachers = request.data.get('teachers')
    tags = request.data.get('tags')
    newTags = request.data.get('newTags')
    skills = request.data.get('skills')
    status_project = request.data.get('status')

    if not all([title, description, count]):
        return Response({'error': 'Не все обязательные поля заполнены'}, status=status.HTTP_400_BAD_REQUEST)
    
    new_project = Project.objects.create(title=title, description=description, count=count, status=status_project)

    if teachers:
        teacher_ids = [teacher['id'] for teacher in teachers]
        new_project.teachers.set(teacher_ids)

    if tags:
        tag_ids = [tag['id'] for tag in tags]
        new_project.tags.set(tag_ids)

    if newTags:
        tags = []
        for tag in newTags:
            new_tag = Tag.objects.create(tag=tag)
            tags.append(new_tag.id)
        new_project.tags.set(tags)

    if skills:
        for skill in skills:
            skill_id = skill['id']
            weight_value = skill['weight_skill']

            # Проверяем, существует ли навык в базе данных
            try:
                skill_obj = Skill.objects.get(skill=skill['skill'])
                # Создаем связь между навыком и проектом    
                skill_project = Skills_weight.objects.create(project=new_project, skill_id=skill_id, weight_skill=weight_value)
            except Skill.DoesNotExist:
                # Если навык не существует, создаем новый
                skill_obj = Skill.objects.create(skill=skill['skill'])
                skill_obj.save()
                # Создаем связь между навыком и проектом 
                skill_project = Skills_weight.objects.create(project=new_project, skill_id=skill_obj.id, weight_skill=weight_value)

            skill_project.save()

    new_project.save()      

    response = Response({'success': 'Проект успешно создан'}, status=status.HTTP_201_CREATED)

    return response

# изменение проекта
@api_view(['POST'])
def edit_project(request):
    project_id = request.data.get('id')
    title = request.data.get('title')
    description = request.data.get('description')
    count = request.data.get('count')
    teachers = request.data.get('teachers')
    students = request.data.get('students')
    tags = request.data.get('tags')
    skills = request.data.get('skills')
    status_project = request.data.get('status')

    try:
        project = Project.objects.get(id=project_id)
        project.title = title
        project.description = description
        project.count = count
        project.status = status_project

        # if status_project is True:
        #     for skill in skills:
        #         skill_id = skill['id']
        #         # Проверяем, существует ли навык в базе данных
        #         try:
        #             skill_obj = Skill.objects.get(skill=skill['skill']) 
        #             try:
        #                 skills_student = Skills_students.objects.get(project=project, skill_id=skill_id)
        #                 skills_student.skill = skill_obj  # Обновляем вес, если навык уже существует для проекта
        #                 skills_student.save()
        #                 skills_student.students.set(students)
        #             except Skills_weight.DoesNotExist:  # Если навык не существует, то создаем новую запись
        #                 skills_student = Skills_weight.objects.create(project=project, skill_id=skill_id, weight_skill=weight_value)
        #                 skills_student.save()
        #                 skills_student.students.set(students)
        #         except Skill.DoesNotExist:
        #             # Если требования не существует, создаем новый
        #             skill_obj = Skill.objects.create(skill=skill['skill'])
        #             skill_obj.save()
        #             # Создаем связь между навыком и проектом
        #             skills_student = Skills_weight.objects.create(project=project, skill_id=skill_obj.id, weight_skill=weight_value)
        #             skills_student.save()
        #             skills_student.students.set(students)

        if 'teachers' in request.data:
            project.teachers.set(teachers)

        if 'students' in request.data:
            project.students.set(students)

        if 'tags' in request.data:
            project.tags.set(tags)

        if 'skills' in request.data:
            project_skills = Skills_weight.objects.filter(project=project)
            for project_skill in project_skills:
                if project_skill.skill_id not in [skill['id'] for skill in skills]:
                    project_skill.delete()
            
            for skill in skills:
                skill_id = skill['id']
                weight_value = skill['weight_skill']
                # Проверяем, существует ли навык в базе данных
                try:
                    skill_obj = Skill.objects.get(skill=skill['skill']) 
                    try:
                        skill_project = Skills_weight.objects.get(project=project, skill_id=skill_id)
                        skill_project.weight_skill = weight_value  # Обновляем вес, если навык уже существует для проекта
                        skill_project.save()
                    except Skills_weight.DoesNotExist:  # Если навык не существует, то создаем новую запись
                        skill_project = Skills_weight.objects.create(project=project, skill_id=skill_id, weight_skill=weight_value)
                        skill_project.save()
                except Skill.DoesNotExist:
                    # Если требования не существует, создаем новый
                    skill_obj = Skill.objects.create(skill=skill['skill'])
                    skill_obj.save()
                    # Создаем связь между навыком и проектом
                    skill_project = Skills_weight.objects.create(project=project, skill_id=skill_obj.id, weight_skill=weight_value)
                    skill_project.save()
        project.save()
        response = Response({'success': 'Проект успешно изменен'}, status=status.HTTP_200_OK)
    except Project.DoesNotExist:
        response = Response({'error': 'Проект не найден'}, status=status.HTTP_404_NOT_FOUND)
    return response



# добавление препода к проекту
@api_view(['POST'])
def ProjectTeacherView(request):
    project_id = request.data.get('project_id')
    teacher_id = request.data.get('teacher_id')
    if teacher_id != 0:
        if project_id and teacher_id:
            project = Project.objects.get(id=project_id)
            teacher = Teacher.objects.get(id=teacher_id)
            create_teacher_for_project(project, teacher)
            response = Response({'message': 'Преподаватель успешно добавлен'})
    response = Response({'message': 'Проект успешно добавлен'})
    return response

# добавление веса к навыкам
@api_view(['POST'])
def project_weight_view(request):
    project_id = request.data.get('project_id')
    weight = request.data.get('weight_skill')
    skill_ids = request.data.get('skill_ids')

    if project_id and weight and skill_ids:
        try:
            project = Project.objects.get(id=project_id)
            for skill_id, weight_value in zip(skill_ids, weight):
                skill = Skill.objects.get(id=skill_id)
                create_skills_for_project(project, skill, weight_value)
            response = Response({'message': 'Коэффициенты успешно добавлены'}, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            response = Response({'error': 'Проект с указанным ID не найден'}, status=status.HTTP_404_NOT_FOUND)
    else:
        response = Response({'error': 'Некорректные данные'}, status=status.HTTP_400_BAD_REQUEST)

    return response   
      
class StudentDetailsView(generics.ListCreateAPIView):
    queryset = Student.objects.filter(is_study=True)
    serializer_class = StudentSerializer

class StudentDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    lookup_field = 'pk'   

@api_view(['POST'])
def create_users(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'error': 'Требуются имя пользователя и пароль'}, status=400)
    
    user = User.objects.create_user(email=email, password=password)
    response = Response({'message': 'Пользователь успешно создан'})
    return response

@api_view(['POST'])
def add_user(request):
    if request.method == 'POST':
        name = request.data.get('name')
        course = request.data.get('course')
        email = request.data.get('email')
        direction = request.data.get('direction')

        # Проверка регулярного выражения для email
        email_stud_pattern = r'^[a-zA-Z0-9]+@study.utmn.ru$'
        email_teach_pattern = r'^[a-zA-Z0-9._%+-]+@utmn+\.[a-zA-Z]{2,}$'
        if not re.match(email_teach_pattern, email):
            if not re.match(email_stud_pattern, email):
                return Response({'error': 'Неверный формат электронной почты'}, status=status.HTTP_400_BAD_REQUEST)
        
        is_student_email = email.endswith('@study.utmn.ru')
        is_teacher_email = email.endswith('@utmn.ru')

        print(is_teacher_email)
        
        try:
            user = User.objects.get(email=email)
            if is_student_email:
                user.is_student = True
                user.is_teacher = False
                user.save()
                Student.objects.update_or_create(user=user, defaults={'name': name, 'course': course, 'direction': direction, 'is_study': True, 'photo': ''})
            elif is_teacher_email:
                user.is_student = False
                user.is_teacher = True
                user.save()
                Teacher.objects.update_or_create(user=user, defaults={'name': name, 'photo': ''})
            return Response({'message': 'Пользователь успешно обновлен'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            user = User.objects.create(email=email, password='')
            if is_student_email:
                user.is_student = True
                user.is_teacher = False
                user.save()
                Student.objects.create(name=name, direction=direction, course=course, is_study=True, user=user, photo='')
            elif is_teacher_email:
                user.is_student = False
                user.is_teacher = True
                user.save()
                Teacher.objects.create(name=name, user=user, photo='')

            return Response({'message': 'Пользователь успешно добавлен'}, status=status.HTTP_200_OK)
        
    else:
        return Response({'error': 'Метод не разрешен'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['POST'])
def add_user_file(request):

    course = request.data.get('is_course')
    direction = request.data.get('direction') 
    names = request.data.get('name')       
    emails = request.data.get('email') 
    is_student = request.data.get('is_student')

    if direction and names and course and emails and is_student:
        add_users_for_file(direction, emails, names, course, is_student)
        return Response({'message': 'Пользователи успешно добавлены!'}, status=status.HTTP_201_CREATED)
    else:
        return Response({'error': 'Заполните все поля!'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def edit_user(request):
    id = request.data.get('id')
    course = request.data.get('course')
    direction = request.data.get('direction')
    isStudy = request.data.get('isStudy')
    name = request.data.get('name')
    is_user = request.data.get('is_user')
    is_working = request.data.get('isWorking')

    if id:
        if is_user == "student":
            student = Student.objects.get(id=id)
            edit_user_student(student,course, direction, isStudy, name)
        else:
            teacher = Teacher.objects.get(id=id)
            edit_user_teacher(teacher, is_working, name)
        return Response({'message': 'Пользователь успешно изменен'}, status=status.HTTP_200_OK)
    else:
        Response({'error': 'Пользователь не выбран'}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def add_skills_from_report(request):
    discipline =  request.data.get('discipline')
    students =  request.data.get('student')
    skills =  request.data.get('skill')
    score =  request.data.get('score')
    projectName = request.data.get('projectName')

    if projectName is not None:
        project = Project.objects.create(name=projectName, description=projectName, count=len(students), status=True)
        
    if discipline.get('id') is None:
        new_discipline = Discipline.objects.create(
            name=discipline.get('name'),
        )
        discipline = new_discipline
    discipline = Discipline.objects.get(id=discipline['id'])    
    # Находим студентов по кратким именам
    for student in students:
        # student = Student.objects.get(id=student_id)  
        a, b, c = student.split()
        regex_pattern = rf"^{a}\s{b}[а-я]+\s{c}[а-я]+$" 
        try:
            student_obj = Student.objects.filter(name__regex=regex_pattern).first()
            # Создаем список навыков
            for skill_name in skills:
                if not skill_name:
                    continue    # Продолжаем, если skill_name пустой

                if re.search('[а-яА-Я]', skill_name):
                    continue
                try:
                    # Ищем навык в БД, игнорируя регистр
                    skill_obj = Skill.objects.get(skill__iexact=skill_name) 
                except Skill.DoesNotExist:
                    # Создаем новый навык в нижнем регистре
                    skill_obj = Skill.objects.create(skill=skill_name.lower())
                    skill_obj.save()
                # добавляем навыки студенту
                student_skill = Skills_students.objects.create(discipline=discipline, student=student_obj, skill=skill_obj, score=score)
                student_skill.save

            # добавляем связь между студентами если они работали в команде
            if projectName is not None:    
                history_project = History_project.objects.create(project=project, student=student_obj)
                history_project.save()
        except Student.DoesNotExist:
            continue
    return Response({'message': 'Данные успешно добавлены'}, status=status.HTTP_200_OK)


@api_view(['POST'])
def upload_docx_report(request):
    report_file = []
    if 'report_file' in request.FILES:
        report_file.append(request.FILES['report_file'])
        
        texts = []
        for i in range(len(report_file)):
            texts.append(str(getTextFromDocx(report_file[i])))

        reportTexts = []
        for i in range(len(texts)):
            try:
                # reportTexts.append(processingOfReportTexts(texts[i], report_file[i]))
                reportTexts.append(processingOfReportTextsYandexGPT(texts[i], report_file[i]))
            except Exception as e:
                reportTexts.append(processingOfReportTexts(texts[i], report_file[i]))


        df = pd.DataFrame(reportTexts, columns=['Students', 'Skills'])
        df.Skills[0] = [re.sub(r'\s+', '', re.sub(r'[^\w\s-]', '', item)) for item in df.Skills[0]]

        data = df.to_dict('records')
        return Response({'data': data}, status=status.HTTP_200_OK)
        
    return HttpResponse(status=400)

# Функция предобработки текста отчетов с помощью модели с Hugging face
def processingOfReportTexts(text_from_report, report_name):
  # Загружаем переменные окружения из .env файла
    load_dotenv()

    key = os.getenv('KEY')

    names_of_students = extract_names_from_filename(report_name.name)

    if 'ОГЛАВЛЕНИЕ' in text_from_report:
        title_page_report = text_from_report.split('ОГЛАВЛЕНИЕ')[0]
    elif 'СОДЕРЖАНИЕ' in text_from_report:
        title_page_report = text_from_report.split('СОДЕРЖАНИЕ')[0]
    else:
        title_page_report = text_from_report

    if 'ГЛАВА 2.' in text_from_report:
        text_from_report = text_from_report.split('ГЛАВА 2.')[1]

    if 'БИБЛИОГРАФИЧЕСКИЙ СПИСОК' in text_from_report:
        text_from_report = text_from_report.split('БИБЛИОГРАФИЧЕСКИЙ СПИСОК')[0]
    elif 'СПИСОК ЛИТЕРАТУРЫ' in text_from_report:
        text_from_report = text_from_report.split('СПИСОК ЛИТЕРАТУРЫ')[0]
    elif 'ЛИТЕРАТУРА' in text_from_report:
        text_from_report = text_from_report.split('ЛИТЕРАТУРА')[0]
    elif 'ПРИЛОЖЕНИЯ' in text_from_report:
        text_from_report = text_from_report.split('ПРИЛОЖЕНИЯ')[0]

    en_text_from_report = translate_ru_to_en_googletranslator(text_from_report)
    en_text_from_report = en_text_from_report.replace('. ', ' ')
    en_text_from_report = en_text_from_report.replace('language', ' ')
    en_text_from_report = en_text_from_report.lower()

    API_URLS = ["https://api-inference.huggingface.co/models/kaliani/flair-ner-skill"]

    def query(payload, API_URL, headers):
        response = requests.post(API_URL, headers=headers, json=payload)
        return response.json()

    headers = {"Authorization": "Bearer " + key}

    for url in API_URLS:
        model_name = url.split("/")[-1]
        skills = []

        payload = {"inputs": en_text_from_report, "wait_for_model": True}
        result = query(payload, url, headers)
        skills.extend([str(item['word']) for item in result if item['entity_group'] == 'SKILL'])
        skills_string = ', '.join(skills)
        unique_skills = list(set(skills_string.split(', ')))
        unique_skills_string = ",".join(unique_skills)
        unique_skills_string = unique_skills_string.replace('.,', ',')
        skills = unique_skills_string.split(',')

    return names_of_students, skills  # массив с ФИО + массив навыков

# Функция предобработки текста отчетов с помощью YandexGPT
def processingOfReportTextsYandexGPT(text_from_report, report_name):
    # Загружаем переменные окружения из .env файла
    load_dotenv()

    catalog_id = os.getenv('CATALOG_ID')
    api_key = os.getenv('API_KEY')

    names_of_students = extract_names_from_filename(report_name.name)

    if 'ОГЛАВЛЕНИЕ' in text_from_report:
        title_page_report = text_from_report.split('ОГЛАВЛЕНИЕ')[0]
    elif 'СОДЕРЖАНИЕ' in text_from_report:
        title_page_report = text_from_report.split('СОДЕРЖАНИЕ')[0]
    else:
        title_page_report = text_from_report

    if 'ГЛАВА 2.' in text_from_report:
        text_from_report = text_from_report.split('ГЛАВА 2.')[1]

    if 'БИБЛИОГРАФИЧЕСКИЙ СПИСОК' in text_from_report:
        text_from_report = text_from_report.split('БИБЛИОГРАФИЧЕСКИЙ СПИСОК')[0]
    elif 'СПИСОК ЛИТЕРАТУРЫ' in text_from_report:
        text_from_report = text_from_report.split('СПИСОК ЛИТЕРАТУРЫ')[0]
    elif 'ЛИТЕРАТУРА' in text_from_report:
        text_from_report = text_from_report.split('ЛИТЕРАТУРА')[0]
    elif 'ПРИЛОЖЕНИЯ' in text_from_report:
        text_from_report = text_from_report.split('ПРИЛОЖЕНИЯ')[0]

    text_from_report = text_from_report.replace('. ', ' ')
    text_from_report = text_from_report.lower()

    prompt = {
        "modelUri": "gpt://" + catalog_id + "/yandexgpt-lite",
        "completionOptions": {
            "stream": False,
            "temperature": 0.6,
            "maxTokens": "20000"
        },
        "messages": [
            {
                "role": "system",
                "text": "Из текста «" + text_from_report + "» извлеки все тектовые теги, которые обозначают названия технологий, фреймворков, языков программирования или библиотек языков программирования на английском языке."
            },
            {
                "role": "user",
                "text": "Получившиеся текстовые теги выведи в формате строки, в которой теги разделены запятой. Выведи только строку с тегами и запятыми, и больше ничего. Без дополнительных собщений. Предложение с окончанием строки с тегами закончи знаком точка."
            },
            {
                "role": "user",
                "text": "Не используй никакие знаки кроме . ,"
            }
        ]
    }

    url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Api-Key " + api_key
    }

    response = requests.post(url, headers=headers, json=prompt)
    text_response = response.text
    data = json.loads(text_response)
    result = data['result']['alternatives'][0]['message']['text']

    result = result.replace('\n', ' ')
    skills = result.split(':')[1]
    skills = skills.split('.')[0]
    skills = skills.split(',')

    return names_of_students, skills  # массив с ФИО + массив навыков

# Функция получения текста из отчета
def getTextFromDocx(filename):
    doc = Document(filename)
    fullText = []
    for para in doc.paragraphs:
        fullText.append(para.text)
    return '\n'.join(fullText)

# Выделение ФИО из названия файла отчета
def extract_names_from_filename(filename):
    filename = filename.split('.')[0]
    parts = filename.split('_')
    names = []
    for part in parts:
        name_parts = part.split('-')
        if len(name_parts) == 3:
            names.append(' '.join(name_parts))
    return names

# Переводчик с русского на английский
def translate_ru_to_en_googletranslator(text):
    translator = Translator()
    chunks = [text[i:i+3000] for i in range(0, len(text), 3000)]  # Разделение текста на части по 3000 символов
    translated_chunks = [translator.translate(chunk, dest='en').text for chunk in chunks]

    return ' '.join(translated_chunks)  # Объединение переведенных частей текста