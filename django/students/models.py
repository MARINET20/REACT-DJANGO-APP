from django.db import models
from django.contrib.auth.models import User, AbstractUser, AbstractBaseUser 
from django.conf import settings 
from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib import auth
import uuid
from django.utils.translation import gettext_lazy as _
from .managers import UserManager


class UuidModel(models.Model): # общий родительский класс для всех моделей с uuid
    uuid = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)

    class Meta:
        abstract = True

class User(AbstractBaseUser):
    username = None
    first_name = None
    last_name = None
    last_login = None
    email = models.EmailField(max_length = 200 , unique = True)
    is_active = models.BooleanField(default = True) 
    is_staff = models.BooleanField(default = False) 
    is_superuser = models.BooleanField(default = False) 
  
    is_student = models.BooleanField(default = False) 
    is_teacher = models.BooleanField(default = False) 
    USERNAME_FIELD = "email"
      
    objects = UserManager() 
      
    def __str__(self): 
        return str(self.email) 
      
    def has_perm(self , perm, obj = None): 
        return self.is_admin 
      
    def has_module_perms(self , app_label): 
        return True
      
    def save(self , *args , **kwargs): 
        return super().save(*args , **kwargs)
    

class PasswordResetCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.PROTECT)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name

class Teacher(models.Model): # Профиль преподавателя
    user = models.OneToOneField(
        User,
        on_delete=models.PROTECT,
        related_name='teacher',
    )
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    photo = models.ImageField(upload_to="photos/%Y/%m/%d/", default=None, blank=True, null=True, verbose_name="Фото")
    projects = models.ManyToManyField('Project', through='Project_details')

    def __str__(self):
        if hasattr(self.user, 'teacher'):
            return self.user.is_teacher
        return self.user.email
    
    

# Проектная дисциплина
class Discipline(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(unique=True, max_length=1000)

    def __str__(self):
        return self.name

# Проекты
class Project(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(unique=True, max_length=1000)
    photo = models.TextField(null = True)
    description = models.TextField(null = False)
    teachers = models.ManyToManyField(Teacher, through='Project_details', blank=True)
    count = models.IntegerField(null = False)
    status = models.BooleanField(null = False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    tags = models.ManyToManyField('Tag', through='Tag_project')
    students = models.ManyToManyField('Student', through='History_project')
    skills = models.ManyToManyField('Skill', through='Skills_weight', blank=True)
    selected_projects = models.ManyToManyField('Student', through='SelectedProject', related_name='students_projects')


    def __str__(self):
        return self.name
           
#  информация о проекте и преподаватели
class Project_details(UuidModel):
    project = models.ForeignKey('Project', on_delete=models.RESTRICT)
    teacher = models.ForeignKey('Teacher', on_delete=models.RESTRICT)

    def __str__(self):
        return self.name


# Профиль студента
class Student(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.PROTECT,
        related_name='student',
    )
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, null = False)
    direction = models.CharField(max_length=255, null = False)
    course = models.IntegerField(null = False)
    is_study = models.BooleanField(null = False)
    photo = models.ImageField(upload_to="photos/%Y/%m/%d/", default=None, blank=True, null=True, verbose_name="Фото")
    projects = models.ManyToManyField('Project', through='History_project')
    skills = models.ManyToManyField('Skill', through='Skills_students')
    selected_projects = models.ManyToManyField('Project', through='SelectedProject', related_name='students_projects')

    def __str__(self):
        if hasattr(self.user, 'student'):
            return self.user.is_student
        return self.user.email


class History_project(UuidModel):
    student = models.ForeignKey('Student', on_delete=models.RESTRICT)
    project = models.ForeignKey('Project', on_delete=models.RESTRICT)

    def __str__(self):
        return self.name


class AccompDoc(UuidModel):
    student = models.ForeignKey(Student, on_delete=models.RESTRICT)
    discipline = models.ForeignKey(Discipline, on_delete=models.RESTRICT)
    implementation = models.BooleanField()
    publication = models.BooleanField()

    def __str__(self):
        return self.name        

class SelectedProject(UuidModel): # Избранные проекты пользователей
    student = models.ForeignKey('Student', on_delete=models.RESTRICT)
    project = models.ForeignKey('Project', on_delete=models.RESTRICT)

    def __str__(self):
        return self.name

class Skill(models.Model):
    id = models.AutoField(primary_key=True)
    skill = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Skills_weight(UuidModel):
    project = models.ForeignKey('Project', on_delete=models.RESTRICT)
    skill = models.ForeignKey('Skill', on_delete=models.RESTRICT)
    weight_skill = models.FloatField(blank=True)


class Skills_students(UuidModel):
    student = models.ForeignKey(Student, on_delete=models.RESTRICT)
    skill = models.ForeignKey('Skill', on_delete=models.RESTRICT)
    discipline = models.ForeignKey(Discipline, on_delete=models.RESTRICT, blank=True)
    score = models.FloatField(blank=True)

    def __str__(self):
        return self.name
        

class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    tag = models.CharField(max_length=100) 

    def __str__(self):
        return self.name   


class Tag_project(UuidModel):
    project = models.ForeignKey('Project', on_delete=models.RESTRICT)
    tag = models.ForeignKey('Tag', on_delete=models.RESTRICT)

    def __str__(self):
        return self.name


# add two methods to django.User class
auth.models.User.add_to_class('is_teacher', lambda self: hasattr(self, 'teacher'))
auth.models.User.add_to_class('is_student', lambda self: hasattr(self, 'student'))
    