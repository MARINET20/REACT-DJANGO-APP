from django.contrib.auth.models import User

from .models import Teacher, Student, Project


# Функции ниже проверяют, может ли пользователь выполнять ту или иную операцию

def superuser_can(function): # декоратор, который проверяет, является ли пользователь суперпользователем
    def wrapper(user, *args, **kwargs):
        if user.is_superuser:
            return True
        return function(user, *args, **kwargs)

    return wrapper

def is_teacher(user: User): 
    return user.is_teacher()

def is_student(user: User): 
    return user.is_student()

@superuser_can
def can_create_project(user: User):
    return user.is_teacher()

@superuser_can
def can_create_discipline(user: User):
    return is_teacher(user)

@superuser_can
def can_create_score(user: User):
    return is_teacher(user)

@superuser_can
def can_create_accompdocs(user: User):
    return is_teacher(user)


@superuser_can
def can_create_skill(user: User):
    return is_student(user)


def can_view_project(user: User):
    return user.is_authenticated