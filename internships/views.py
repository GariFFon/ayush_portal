"""Views for internships app."""

from django.db.models import Q
from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Skill, StudentSkill, Internship, InternshipSkill
from .serializers import (
    SkillSerializer,
    StudentSkillSerializer,
    InternshipListSerializer,
    InternshipDetailSerializer,
    InternshipCreateSerializer,
)
from institutions.models import StudentProfile, CompanyMembership


class IsCompanyRecruiter(permissions.BasePermission):
    """Allow only users with company role who have a company membership."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "company"


class SkillListView(generics.ListAPIView):
    """Public list of all skills for autocomplete."""
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "category"]


class InternshipListView(generics.ListAPIView):
    """Public searchable list of published internships."""
    serializer_class = InternshipListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Internship.objects.filter(status=Internship.Status.PUBLISHED).select_related("company")
        q = self.request.query_params.get("q")
        location = self.request.query_params.get("location")
        work_mode = self.request.query_params.get("work_mode")
        skill = self.request.query_params.get("skill")

        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))
        if location:
            qs = qs.filter(location__icontains=location)
        if work_mode:
            qs = qs.filter(work_mode=work_mode)
        if skill:
            qs = qs.filter(required_skills__name__icontains=skill).distinct()
        return qs


class InternshipDetailView(generics.RetrieveAPIView):
    """Full internship details including required skills."""
    queryset = Internship.objects.filter(status=Internship.Status.PUBLISHED)
    serializer_class = InternshipDetailSerializer
    permission_classes = [permissions.AllowAny]


class CompanyInternshipListCreateView(generics.ListCreateAPIView):
    """Recruiter: list their company's internships and create new ones."""
    permission_classes = [IsCompanyRecruiter]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return InternshipCreateSerializer
        return InternshipListSerializer

    def get_queryset(self):
        company_ids = CompanyMembership.objects.filter(
            user=self.request.user, is_active=True
        ).values_list("company_id", flat=True)
        return Internship.objects.filter(company_id__in=company_ids)

    def perform_create(self, serializer):
        membership = CompanyMembership.objects.filter(
            user=self.request.user, is_active=True
        ).first()
        if not membership:
            raise permissions.PermissionDenied("No active company membership found.")
        serializer.save(company=membership.company, posted_by=self.request.user)


class StudentSkillListCreateView(generics.ListCreateAPIView):
    """Student: list and add their own skills."""
    serializer_class = StudentSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = StudentProfile.objects.get(user=self.request.user)
        return StudentSkill.objects.filter(student=profile).select_related("skill")

    def perform_create(self, serializer):
        profile = StudentProfile.objects.get(user=self.request.user)
        serializer.save(student=profile)


class StudentSkillDestroyView(generics.DestroyAPIView):
    """Student: remove a skill from their profile."""
    serializer_class = StudentSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = StudentProfile.objects.get(user=self.request.user)
        return StudentSkill.objects.filter(student=profile)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def skill_match_view(request, internship_id):
    """Return skill-match score between the authenticated student and an internship."""
    from .matching import calculate_skill_match
    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        return Response({"error": "Student profile not found."}, status=404)

    try:
        internship = Internship.objects.get(pk=internship_id)
    except Internship.DoesNotExist:
        return Response({"error": "Internship not found."}, status=404)

    student_skills = list(
        profile.student_skills.select_related("skill").values_list("skill__name", flat=True)
    )
    internship_skills = list(
        internship.internship_skills.select_related("skill").values(
            "skill__name", "is_required"
        )
    )
    skills_input = [{"name": s["skill__name"], "is_required": s["is_required"]} for s in internship_skills]
    match = calculate_skill_match(student_skills, skills_input)
    return Response(match)
