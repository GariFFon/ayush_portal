"""Institutions views."""

from rest_framework import generics, permissions
from .models import University, StudentProfile, Company
from .serializers import UniversitySerializer, StudentProfileSerializer, CompanySerializer


class UniversityListView(generics.ListAPIView):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [permissions.AllowAny]


class StudentProfileView(generics.RetrieveUpdateAPIView):
    """Student: get or update their own profile."""
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile


class CompanyListView(generics.ListAPIView):
    queryset = Company.objects.filter(is_verified=True)
    serializer_class = CompanySerializer
    permission_classes = [permissions.AllowAny]
