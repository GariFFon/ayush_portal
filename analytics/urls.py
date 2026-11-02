"""URL patterns for analytics app."""

from django.urls import path
from .views import (
    student_dashboard_stats,
    company_dashboard_stats,
    university_dashboard_stats,
    admin_dashboard_stats,
)

urlpatterns = [
    path("student/", student_dashboard_stats, name="student-stats"),
    path("company/", company_dashboard_stats, name="company-stats"),
    path("university/", university_dashboard_stats, name="university-stats"),
    path("admin/", admin_dashboard_stats, name="admin-stats"),
]
