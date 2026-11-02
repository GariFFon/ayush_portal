"""Models for institutions app — University, StudentProfile, Company, CompanyMembership."""

from django.conf import settings
from django.db import models


class University(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    website = models.URLField(blank=True)
    established_year = models.PositiveIntegerField(null=True, blank=True)
    logo = models.ImageField(upload_to="university_logos/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Universities"
        ordering = ["name"]

    def __str__(self):
        return self.name


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    university = models.ForeignKey(
        University,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students",
    )
    degree = models.CharField(max_length=100, blank=True)
    branch = models.CharField(max_length=100, blank=True)
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    resume_url = models.URLField(blank=True)
    resume_file = models.FileField(upload_to="resumes/", null=True, blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} — {self.university or 'No University'}"

    @property
    def profile_completion(self):
        """Returns a rough % of profile fields completed."""
        fields = [
            self.university_id, self.degree, self.branch, self.graduation_year,
            self.cgpa, self.resume_url or self.resume_file, self.linkedin_url, self.bio,
        ]
        filled = sum(1 for f in fields if f)
        return round(filled / len(fields) * 100)


class Company(models.Model):
    name = models.CharField(max_length=200)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    size = models.CharField(
        max_length=30,
        choices=[
            ("startup", "Startup (1–50)"),
            ("small", "Small (51–200)"),
            ("medium", "Medium (201–1000)"),
            ("large", "Large (1000+)"),
        ],
        blank=True,
    )
    location = models.CharField(max_length=200, blank=True)
    logo = models.ImageField(upload_to="company_logos/", null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Companies"
        ordering = ["name"]

    def __str__(self):
        return self.name


class CompanyMembership(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="company_memberships",
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "company"],
                name="unique_company_membership",
            )
        ]

    def __str__(self):
        return f"{self.user} @ {self.company}"
