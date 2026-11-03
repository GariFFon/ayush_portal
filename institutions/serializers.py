"""Serializers for institutions app."""

from rest_framework import serializers
from .models import Achievement, Certification, Experience, University, StudentProfile, Company, CompanyMembership


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ["id", "name", "location", "website", "established_year", "logo"]


class StudentProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)
    university = UniversitySerializer(read_only=True)
    university_id = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(), source="university", write_only=True, required=False
    )
    profile_completion = serializers.IntegerField(read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id", "user_email", "user_name", "university", "university_id",
            "degree", "branch", "graduation_year", "cgpa",
            "resume_url", "resume_file", "linkedin_url", "github_url",
            "bio", "is_available", "profile_completion",
        ]


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id", "name", "website", "description", "industry",
            "size", "location", "logo", "is_verified",
        ]


class CompanyMembershipSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)

    class Meta:
        model = CompanyMembership
        fields = ["id", "company", "is_active", "joined_at"]


MAX_UPLOAD = 5 * 1024 * 1024
CERT_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ["id", "title", "company", "location", "start_date", "end_date", "is_current", "description"]

    def validate(self, attrs):
        start, end = attrs.get("start_date"), attrs.get("end_date")
        if attrs.get("is_current"):
            attrs["end_date"] = None
        elif start and end and end < start:
            raise serializers.ValidationError({"end_date": "End date can't be before the start date."})
        return attrs


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ["id", "name", "issuer", "issued_on", "credential_id", "credential_url", "file"]

    def validate_file(self, value):
        if value:
            import os

            if value.size > MAX_UPLOAD:
                raise serializers.ValidationError("File must be 5 MB or smaller.")
            if os.path.splitext(value.name)[1].lower() not in CERT_EXTENSIONS:
                raise serializers.ValidationError("Upload a PDF or an image (PNG, JPG, WebP).")
        return value


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ["id", "title", "detail", "achieved_on"]
