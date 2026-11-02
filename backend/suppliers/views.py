from rest_framework import viewsets

from accounts.permissions import RolePermission

from .models import Supplier
from .serializers import SupplierSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [RolePermission]

    manager_write_allowed = True

    filterset_fields = [
        'is_active',
    ]

    search_fields = [
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
    ]

    ordering_fields = [
        'name',
        'created_at',
        'updated_at',
    ]

    ordering = ['name']