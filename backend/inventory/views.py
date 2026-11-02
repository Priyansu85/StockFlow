from django.db.models import F

from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from products.models import Product

from .models import InventoryTransaction
from .serializers import (
    InventoryTransactionSerializer,
    ProductStockSerializer,
)


class InventoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductStockSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(
        detail=False,
        methods=['get'],
        url_path='low-stock'
    )
    def low_stock(self, request):
        products = self.get_queryset().filter(
            current_stock__lte=F('minimum_stock')
        )

        serializer = self.get_serializer(
            products,
            many=True
        )

        return Response(serializer.data)


class InventoryTransactionViewSet(
    viewsets.ReadOnlyModelViewSet
):
    queryset = (
        InventoryTransaction.objects
        .select_related('product', 'created_by')
        .all()
    )

    serializer_class = InventoryTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]