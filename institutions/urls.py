"""URL patterns for institutions app."""

from django.urls import path
from .views import UniversityListView, StudentProfileView, CompanyListView

urlpatterns = [
    path("universities/", UniversityListView.as_view(), name="university-list"),
    path("student-profile/", StudentProfileView.as_view(), name="student-profile"),
    path("companies/", CompanyListView.as_view(), name="company-list"),
]
