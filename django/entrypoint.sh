#!/bin/sh

# Проверка подключения к базе данных
if [ "$DATABASE" = "postgres" ]; then
    echo "Ожидание доступности базы данных..."

    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 0.1
    done

    echo "База данных доступна!"
fi

# Проверка наличия пользователя в базе данных
if ! python manage.py shell -c "from django.contrib.auth.models import User; \
User.objects.filter(email=$DJANGO_SUPERUSER_EMAIL).exists()"; then
    echo "Суперпользователь не найден. Создание суперпользователя..."
    python manage.py createsuperuser --no-input
else
    echo "Суперпользователь уже существует."
fi

# Применение миграций
python manage.py migrate

# Запуск переданной команды
exec "$@"