from django.contrib import admin
from .models import Teacher, Student, Project, User

admin.site.register(Teacher)
admin.site.register(Student)
admin.site.register(Project)
admin.site.register(User)