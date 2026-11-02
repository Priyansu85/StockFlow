
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import RolePermission
from .models import Purchase
from .serializers import PurchaseSerializer
from .services import receive_purchase


class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = (
        Purchase.objects
        .select_related('supplier', 'created_by')
        .prefetch_related('items__product')
        .all()
    )

    serializer_class = PurchaseSerializer

    permission_classes = [RolePermission]
    manager_write_allowed = True

    filterset_fields = [
        'status',
        'supplier',
        'purchase_date',
    ]

    search_fields = [
        'invoice_number',
        'supplier__name',
        'notes',
    ]

    ordering_fields = [
        'invoice_number',
        'purchase_date',
        'created_at',
        'updated_at',
    ]

    ordering = ['-purchase_date', '-created_at']

    @action(
        detail=True,
        methods=['post'],
        url_path='receive'
    )
    def receive(self, request, pk=None):
        purchase = self.get_object()

        try:
            purchase = receive_purchase(
                purchase.id,
                request.user
            )

        except DjangoValidationError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(purchase)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
