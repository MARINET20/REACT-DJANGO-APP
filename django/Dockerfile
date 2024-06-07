FROM python:3.10.2

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


RUN pip install --upgrade pip

COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# SMTP configuration
ENV EMAIL_HOST=$EMAIL_HOST
ENV EMAIL_PORT=$EMAIL_PORT
ENV EMAIL_HOST_USER=$EMAIL_HOST_USER
ENV EMAIL_HOST_PASSWORD=$EMAIL_HOST_PASSWORD
ENV EMAIL_USE_SSL=$EMAIL_USE_SSL
ENV EMAIL_BACKEND =$EMAIL_BACKEND

# CMD python manage.py migrate && \
#     python manage.py runserver 0.0.0.0:8000

CMD python manage.py migrate \
    && python manage.py createsuperuser --no-input \
    && python manage.py runserver 0.0.0.0:8000
# ENTRYPOINT ["/bin/bash", "/usr/src/app/entrypoint.sh"]