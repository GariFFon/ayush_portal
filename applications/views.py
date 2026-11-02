"""Views for applications app."""

from django.db import IntegrityError
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Application
from .serializers import (
    ApplicationSerializer,
    ApplicationDetailSerializer,
    ApplicationStatusUpdateSerializer,
)
from institutions.models import StudentProfile, CompanyMembership
from internships.models import Internship


class StudentApplicationListCreateView(generics.ListCreateAPIView):
    """Student: view their applications and submit a new one."""
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = StudentProfile.objects.get(user=self.request.user)
        return Application.objects.filter(student=profile).select_related(
            "internship", "internship__company"
        )

    def perform_create(self, serializer):
        try:
            profile = StudentProfile.objects.get(user=self.request.user)
        except StudentProfile.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Please complete your student profile before applying.")

        internship = serializer.validated_data["internship"]
        if internship.status != Internship.Status.PUBLISHED:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("This internship is not accepting applications.")

        try:
            serializer.save(student=profile)
        except IntegrityError:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You have already applied for this internship.")


class ApplicationWithdrawView(generics.DestroyAPIView):
    """Student: withdraw a pending application."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        profile = StudentProfile.objects.get(user=self.request.user)
        return Application.objects.filter(student=profile, status=Application.Status.APPLIED)


class RecruiterApplicationListView(generics.ListAPIView):
    """Recruiter: see all applicants for their company's internships."""
    serializer_class = ApplicationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        company_ids = CompanyMembership.objects.filter(
            user=self.request.user, is_active=True
        ).values_list("company_id", flat=True)

        internship_id = self.request.query_params.get("internship")
        qs = Application.objects.filter(
            internship__company_id__in=company_ids
        ).select_related("student", "student__user", "internship")

        if internship_id:
            qs = qs.filter(internship_id=internship_id)
        return qs


class RecruiterApplicationStatusUpdateView(generics.UpdateAPIView):
    """Recruiter: update application status and add notes."""
    serializer_class = ApplicationStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        company_ids = CompanyMembership.objects.filter(
            user=self.request.user, is_active=True
        ).values_list("company_id", flat=True)
        return Application.objects.filter(internship__company_id__in=company_ids)
