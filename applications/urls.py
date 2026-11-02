"""URL patterns for applications app."""

from django.urls import path
from .views import (
    StudentApplicationListCreateView,
    ApplicationWithdrawView,
    RecruiterApplicationListView,
    RecruiterApplicationStatusUpdateView,
)

urlpatterns = [
    path("", StudentApplicationListCreateView.as_view(), name="application-list-create"),
    path("<int:pk>/withdraw/", ApplicationWithdrawView.as_view(), name="application-withdraw"),
    path("recruiter/", RecruiterApplicationListView.as_view(), name="recruiter-applications"),
    path("recruiter/<int:pk>/status/", RecruiterApplicationStatusUpdateView.as_view(), name="update-status"),
]
