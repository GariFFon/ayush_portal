"""Reusable DRF permission classes for role-based access."""

from rest_framework.permissions import BasePermission


def role_required(*roles):
    """Build a permission class allowing only authenticated users with one of `roles`.

    Superusers always pass, so Django admins can inspect every dashboard.
    """

    class HasRole(BasePermission):
        message = "You do not have the required role to access this resource."

        def has_permission(self, request, view):
            user = request.user
            return bool(
                user
                and user.is_authenticated
                and (user.is_superuser or user.role in roles)
            )

    HasRole.__name__ = "HasRole_" + "_".join(roles)
    return HasRole
