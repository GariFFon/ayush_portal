"""Institutions views."""

import re

from rest_framework import filters, generics, permissions, status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from internships.models import Skill, StudentSkill
from .models import Achievement, Certification, Company, Experience, StudentProfile, University
from .serializers import (
    AchievementSerializer,
    CertificationSerializer,
    CompanySerializer,
    ExperienceSerializer,
    StudentProfileSerializer,
    UniversitySerializer,
)


class UniversityListView(generics.ListCreateAPIView):
    """List/search universities (public). Signed-in users can add one that is missing."""
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "location"]

    def create(self, request, *args, **kwargs):
        name = " ".join(str(request.data.get("name", "")).split())
        if not 2 <= len(name) <= 200:
            return Response({"name": "Enter a university name (2-200 characters)."}, status=status.HTTP_400_BAD_REQUEST)
        existing = University.objects.filter(name__iexact=name).first()
        if existing:
            return Response(self.get_serializer(existing).data, status=status.HTTP_200_OK)
        university = University.objects.create(name=name, location=str(request.data.get("location", ""))[:200])
        return Response(self.get_serializer(university).data, status=status.HTTP_201_CREATED)


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


# ── Student profile extras: experience, certifications, achievements, resume ──

class _OwnedByProfileMixin:
    """Scope a queryset to the signed-in student's profile and attach new rows to it."""

    permission_classes = [permissions.IsAuthenticated]

    def _profile(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get_queryset(self):
        return self.model.objects.filter(profile=self._profile())

    def perform_create(self, serializer):
        serializer.save(profile=self._profile())


class ExperienceListView(_OwnedByProfileMixin, generics.ListCreateAPIView):
    model = Experience
    serializer_class = ExperienceSerializer
    pagination_class = None


class ExperienceDetailView(_OwnedByProfileMixin, generics.RetrieveUpdateDestroyAPIView):
    model = Experience
    serializer_class = ExperienceSerializer


class CertificationListView(_OwnedByProfileMixin, generics.ListCreateAPIView):
    model = Certification
    serializer_class = CertificationSerializer
    pagination_class = None


class CertificationDetailView(_OwnedByProfileMixin, generics.RetrieveUpdateDestroyAPIView):
    model = Certification
    serializer_class = CertificationSerializer


class AchievementListView(_OwnedByProfileMixin, generics.ListCreateAPIView):
    model = Achievement
    serializer_class = AchievementSerializer
    pagination_class = None


class AchievementDetailView(_OwnedByProfileMixin, generics.RetrieveUpdateDestroyAPIView):
    model = Achievement
    serializer_class = AchievementSerializer


class ResumeUploadView(APIView):
    """Upload a PDF resume; read it and suggest skills (nothing is added automatically)."""

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]
    MAX_BYTES = 5 * 1024 * 1024
    MAX_PAGES = 12

    def post(self, request):
        upload = request.FILES.get("file")
        if upload is None:
            return Response({"file": "Choose a PDF file."}, status=status.HTTP_400_BAD_REQUEST)
        if upload.size > self.MAX_BYTES:
            return Response({"file": "Resume must be 5 MB or smaller."}, status=status.HTTP_400_BAD_REQUEST)
        head = upload.read(5)
        upload.seek(0)
        if head != b"%PDF-":
            return Response({"file": "That doesn't look like a PDF."}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        profile.resume_file.save(f"resume-{request.user.pk}.pdf", upload, save=True)

        text = self._extract_text(profile.resume_file.path)
        have = set(StudentSkill.objects.filter(student=profile).values_list("skill_id", flat=True))
        found = []
        for skill in Skill.objects.all():
            if re.search(rf"(?<![A-Za-z0-9+#]){re.escape(skill.name)}(?![A-Za-z0-9+#])", text, re.IGNORECASE):
                found.append({"id": skill.id, "name": skill.name, "already_added": skill.id in have})
        return Response(
            {
                "resume_file": request.build_absolute_uri(profile.resume_file.url),
                "detected_skills": found,
                "pages_read": min(self.MAX_PAGES, 99),
            },
            status=status.HTTP_200_OK,
        )

    def _extract_text(self, path):
        try:
            from pypdf import PdfReader

            reader = PdfReader(path)
            chunks = []
            for page in reader.pages[: self.MAX_PAGES]:
                chunks.append(page.extract_text() or "")
                if sum(len(c) for c in chunks) > 200_000:
                    break
            return "\n".join(chunks)
        except Exception:
            return ""
