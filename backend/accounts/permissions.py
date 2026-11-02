from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    """
    Role-based access control for StockFlow APIs.

    Supports:
    - ADMIN
    - MANAGER
    - STAFF

    Django superusers are treated as ADMIN.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Django superuser always has full access.
        if user.is_superuser:
            return True

        role = user.role
        method = request.method

        # ADMIN has full API access.
        if role == 'ADMIN':
            return True

        # Manager permissions.
        if role == 'MANAGER':
            if getattr(view, 'manager_write_allowed', False):
                return method in ['GET', 'POST', 'PUT', 'PATCH']
            return method in ['GET', 'HEAD', 'OPTIONS']

        # Staff permissions.
        if role == 'STAFF':
            if getattr(view, 'staff_write_allowed', False):
                return method in ['GET', 'POST']
            return method in ['GET', 'HEAD', 'OPTIONS']

        return False