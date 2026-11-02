"""Serializers for internships app."""

from rest_framework import serializers
from .models import Skill, StudentSkill, Internship, InternshipSkill
from institutions.serializers import CompanySerializer


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category"]


class StudentSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), source="skill", write_only=True
    )

    class Meta:
        model = StudentSkill
        fields = ["id", "skill", "skill_id", "proficiency"]


class InternshipSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)

    class Meta:
        model = InternshipSkill
        fields = ["skill", "is_required"]


class InternshipListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_logo = serializers.ImageField(source="company.logo", read_only=True)
    skills_count = serializers.SerializerMethodField()

    class Meta:
        model = Internship
        fields = [
            "id", "title", "company_name", "company_logo", "location",
            "work_mode", "stipend", "duration_months", "deadline",
            "status", "openings", "skills_count", "created_at",
        ]

    def get_skills_count(self, obj):
        return obj.internship_skills.filter(is_required=True).count()


class InternshipDetailSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    internship_skills = InternshipSkillSerializer(many=True, read_only=True)

    class Meta:
        model = Internship
        fields = [
            "id", "title", "company", "description", "location", "work_mode",
            "stipend", "duration_months", "openings", "deadline", "status",
            "internship_skills", "created_at", "updated_at",
        ]


class InternshipCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Internship
        fields = [
            "title", "description", "location", "work_mode", "stipend",
            "duration_months", "openings", "deadline", "status",
        ]
