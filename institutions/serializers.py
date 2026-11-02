"""Serializers for institutions app."""

from rest_framework import serializers
from .models import University, StudentProfile, Company, CompanyMembership


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
