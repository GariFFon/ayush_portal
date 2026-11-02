"""Models for applications app."""

from django.db import models


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = "applied", "Applied"
        REVIEW = "review", "Under Review"
        SHORTLISTED = "shortlisted", "Shortlisted"
        SELECTED = "selected", "Selected"
        REJECTED = "rejected", "Rejected"

    student = models.ForeignKey(
        "institutions.StudentProfile",
        on_delete=models.CASCADE,
        related_name="applications",
    )
    internship = models.ForeignKey(
        "internships.Internship",
        on_delete=models.CASCADE,
        related_name="applications",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPLIED,
    )
    cover_letter = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    recruiter_notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-applied_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "internship"],
                name="unique_student_internship_application",
            )
        ]

    def __str__(self):
        return f"{self.student.user.username} → {self.internship.title} [{self.status}]"
