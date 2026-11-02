from rest_framework import filters, viewsets

from accounts.permissions import RolePermission

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [RolePermission]

    manager_write_allowed = True

    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    permission_classes = [RolePermission]

    manager_write_allowed = True

    filterset_fields = [
        'category',
        'is_active',
    ]

    search_fields = [
        'name',
        'sku',
        'description',
        'category__name',
    ]

    ordering_fields = [
        'name',
        'sku',
        'purchase_price',
        'selling_price',
        'current_stock',
        'created_at',
        'updated_at',
    ]

    ordering = ['name']