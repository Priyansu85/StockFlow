
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserManagementSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user

        return (
            user
            and user.is_authenticated
            and (
                user.is_superuser
                or user.role == 'ADMIN'
            )
        )


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserManagementSerializer
    permission_classes = [IsAdminUserRole]

    def perform_update(self, serializer):
        target_user = serializer.instance

        # Protect the currently logged-in Admin account
        if target_user.pk == self.request.user.pk:

            if (
                serializer.validated_data.get('is_active') is False
                or serializer.validated_data.get('role') not in (None, 'ADMIN')
            ):
                raise PermissionDenied(
                    "You cannot deactivate or change the role of your own Admin account."
                )

        serializer.save()

    def perform_destroy(self, instance):
        # Prevent self-deletion
        if instance.pk == self.request.user.pk:
            raise PermissionDenied(
                "You cannot delete your own Admin account."
            )

        instance.delete()
