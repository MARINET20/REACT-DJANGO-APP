from django.contrib.auth import get_user_model

User = get_user_model()

def run():
    # Create admin user
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            email='admin@example.com',
            password='password'
        )
