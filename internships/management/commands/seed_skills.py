"""Seed a starter catalogue of skills (used for resume matching and profiles).

    python manage.py seed_skills

Safe to re-run: existing skills are left alone.
"""

from django.core.management.base import BaseCommand

from internships.models import Skill

CATALOGUE = {
    "Programming": ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Kotlin", "Swift", "PHP", "Ruby", "R", "MATLAB", "Dart"],
    "Web": ["HTML", "CSS", "React", "Next.js", "Vue", "Angular", "Node.js", "Express", "Django", "Flask", "FastAPI", "Tailwind CSS", "Bootstrap", "REST APIs", "GraphQL"],
    "Data": ["SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Pandas", "NumPy", "Power BI", "Tableau", "Excel", "Data Analysis", "Data Visualization", "Statistics"],
    "AI/ML": ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "scikit-learn", "NLP", "Computer Vision", "OpenCV", "LLMs"],
    "DevOps": ["Git", "GitHub", "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "CI/CD", "Linux", "Jenkins", "Terraform"],
    "Mobile": ["Android", "iOS", "React Native", "Flutter"],
    "Design": ["Figma", "UI Design", "UX Research", "Adobe Photoshop", "Adobe Illustrator", "Prototyping", "Wireframing"],
    "Core": ["Data Structures", "Algorithms", "Object-Oriented Programming", "System Design", "Testing", "Agile", "Scrum"],
    "Business": ["Communication", "Leadership", "Teamwork", "Project Management", "Digital Marketing", "SEO", "Content Writing", "Public Speaking", "Problem Solving"],
}


class Command(BaseCommand):
    help = "Seed a starter catalogue of skills."

    def handle(self, *args, **options):
        existing = {n.lower() for n in Skill.objects.values_list("name", flat=True)}
        new = []
        for category, names in CATALOGUE.items():
            for name in names:
                if name.lower() not in existing:
                    existing.add(name.lower())
                    new.append(Skill(name=name, category=category))
        Skill.objects.bulk_create(new)
        self.stdout.write(self.style.SUCCESS(f"Added {len(new)} skills."))
