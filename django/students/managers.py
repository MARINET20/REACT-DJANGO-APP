from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser 
from django.utils.translation import gettext_lazy as _
from django.db import models 

# Переопределение методов добавления пользователя, создание суперпользователя в классе User

class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email or len(email) <= 0:
            raise ValueError(_('Почта отсутствует!'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):

        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)
