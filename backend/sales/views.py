
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import RolePermission
from .models import Sale
from .serializers import SaleSerializer
from .services import complete_sale


class SaleViewSet(viewsets.ModelViewSet):
    queryset = (
        Sale.objects
        .select_related('created_by')
        .prefetch_related('items__product')
        .all()
    )

    serializer_class = SaleSerializer

    permission_classes = [RolePermission]
    manager_write_allowed = True

    filterset_fields = [
        'status',
        'sale_date',
    ]

    search_fields = [
        'invoice_number',
        'customer_name',
        'customer_phone',
        'notes',
    ]

    ordering_fields = [
        'invoice_number',
        'sale_date',
        'created_at',
        'updated_at',
    ]

    ordering = ['-sale_date', '-created_at']

    @action(
        detail=True,
        methods=['post'],
        url_path='complete'
    )
    def complete(self, request, pk=None):
        sale = self.get_object()

        try:
            sale = complete_sale(
                sale.id,
                request.user
            )

        except DjangoValidationError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(sale)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
