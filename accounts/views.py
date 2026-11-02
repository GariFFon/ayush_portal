"""Views for accounts app — registration, profile, and user management."""

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Register a new user (any role)."""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"message": "Account created successfully.", "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the authenticated user's own profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserProfileUpdateSerializer
        return UserSerializer


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    """Quick endpoint for the frontend to confirm auth status and get user data."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
