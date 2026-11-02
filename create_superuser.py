import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ayush_portal.settings")
django.setup()

from accounts.models import User

if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser("admin", "admin@careerbridge.com", "Admin@1234", role="admin")
    print("Superuser created: admin / Admin@1234")
else:
    print("Superuser already exists")
