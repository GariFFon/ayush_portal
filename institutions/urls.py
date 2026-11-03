"""URL patterns for institutions app."""

from django.urls import path
from .views import (
    AchievementDetailView,
    AchievementListView,
    CertificationDetailView,
    CertificationListView,
    CompanyListView,
    ExperienceDetailView,
    ExperienceListView,
    ResumeUploadView,
    StudentProfileView,
    UniversityListView,
)

urlpatterns = [
    path("universities/", UniversityListView.as_view(), name="university-list"),
    path("student-profile/", StudentProfileView.as_view(), name="student-profile"),
    path("student-profile/resume/", ResumeUploadView.as_view(), name="resume-upload"),
    path("student-profile/experience/", ExperienceListView.as_view(), name="experience-list"),
    path("student-profile/experience/<int:pk>/", ExperienceDetailView.as_view(), name="experience-detail"),
    path("student-profile/certifications/", CertificationListView.as_view(), name="certification-list"),
    path("student-profile/certifications/<int:pk>/", CertificationDetailView.as_view(), name="certification-detail"),
    path("student-profile/achievements/", AchievementListView.as_view(), name="achievement-list"),
    path("student-profile/achievements/<int:pk>/", AchievementDetailView.as_view(), name="achievement-detail"),
    path("companies/", CompanyListView.as_view(), name="company-list"),
]
