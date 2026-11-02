"""Serializers for applications app."""

from rest_framework import serializers
from .models import Application
from internships.serializers import InternshipListSerializer
from institutions.serializers import StudentProfileSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    internship = InternshipListSerializer(read_only=True)
    internship_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__("internships.models", fromlist=["Internship"]).Internship.objects.all(),
        source="internship",
        write_only=True,
    )

    class Meta:
        model = Application
        fields = [
            "id", "internship", "internship_id", "status",
            "cover_letter", "applied_at", "updated_at",
        ]
        read_only_fields = ["id", "status", "applied_at", "updated_at"]


class ApplicationDetailSerializer(serializers.ModelSerializer):
    """Used by recruiters to see full applicant info."""
    internship = InternshipListSerializer(read_only=True)
    student = StudentProfileSerializer(read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "student", "internship", "status",
            "cover_letter", "recruiter_notes", "applied_at", "updated_at",
        ]


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Recruiter updates status and notes."""
    class Meta:
        model = Application
        fields = ["status", "recruiter_notes"]
