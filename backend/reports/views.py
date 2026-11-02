from decimal import Decimal

from django.db.models.functions import TruncDate
from django.db.models import F, Sum
from django.db.models.functions import Coalesce
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from inventory.models import InventoryTransaction
from products.models import Product
from purchases.models import Purchase, PurchaseItem
from sales.models import Sale, SaleItem

from .serializers import DashboardSerializer


def get_date_range(request):
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    if start_date and end_date and start_date > end_date:
        raise ValueError(
            'start_date cannot be greater than end_date.'
        )

    return start_date, end_date


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start_date, end_date = get_date_range(request)

        total_products = Product.objects.filter(
            is_active=True
        ).count()

        total_stock = Product.objects.filter(
            is_active=True
        ).aggregate(
            total=Coalesce(
                Sum('current_stock'),
                0
            )
        )['total']

        low_stock_count = Product.objects.filter(
            is_active=True,
            current_stock__lte=F('minimum_stock')
        ).count()

        purchase_items = PurchaseItem.objects.filter(
            purchase__status=Purchase.Status.RECEIVED
        )

        sale_items = SaleItem.objects.filter(
            sale__status=Sale.Status.COMPLETED
        )

        if start_date:
            purchase_items = purchase_items.filter(
                purchase__purchase_date__gte=start_date
            )

            sale_items = sale_items.filter(
                sale__sale_date__gte=start_date
            )

        if end_date:
            purchase_items = purchase_items.filter(
                purchase__purchase_date__lte=end_date
            )

            sale_items = sale_items.filter(
                sale__sale_date__lte=end_date
            )

        total_purchases = purchase_items.aggregate(
            total=Coalesce(
                Sum(F('quantity') * F('unit_price')),
                Decimal('0.00')
            )
        )['total']

        total_sales = sale_items.aggregate(
            total=Coalesce(
                Sum(F('quantity') * F('unit_price')),
                Decimal('0.00')
            )
        )['total']

        total_profit = total_sales - total_purchases

        sales_trend = list(
            sale_items
            .values('sale__sale_date')
            .annotate(
                total=Sum(
                    F('quantity') * F('unit_price')
                )
            )
            .order_by('sale__sale_date')
        )

        sales_trend = [
            {
                'date': item['sale__sale_date'],
                'total': item['total'],
            }
            for item in sales_trend
        ]
        
        purchase_trend = list(
            purchase_items
            .values('purchase__purchase_date')
            .annotate(
                total=Sum(
                    F('quantity') * F('unit_price')
                )
            )
            .order_by('purchase__purchase_date')
        )

        purchase_trend = [
            {
                'date': item['purchase__purchase_date'],
                'total': item['total'],
            }
            for item in purchase_trend
        ]
        
        recent_transactions = list(
            InventoryTransaction.objects
            .select_related('product', 'created_by')
            .values(
                'id',
                'product__name',
                'product__sku',
                'transaction_type',
                'quantity',
                'created_at',
            )[:10]
        )

        data = {
            'total_products': total_products,
            'total_stock': total_stock,
            'low_stock_count': low_stock_count,
            'total_purchases': total_purchases,
            'total_sales': total_sales,
            'total_profit': total_profit,
            'recent_transactions': recent_transactions,
            'sales_trend': sales_trend,
            'purchase_trend': purchase_trend,
        }

        serializer = DashboardSerializer(data)

        return Response(serializer.data)


class SalesReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            start_date, end_date = get_date_range(request)
        except ValueError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )

        sales = Sale.objects.filter(
            status=Sale.Status.COMPLETED
        ).select_related(
            'created_by'
        ).prefetch_related(
            'items__product'
        )

        if start_date:
            sales = sales.filter(
                sale_date__gte=start_date
            )

        if end_date:
            sales = sales.filter(
                sale_date__lte=end_date
            )

        result = []

        for sale in sales:
            total = sum(
                (
                    item.quantity * item.unit_price
                    for item in sale.items.all()
                ),
                Decimal('0.00')
            )

            result.append({
                'id': sale.id,
                'invoice_number': sale.invoice_number,
                'customer_name': sale.customer_name,
                'customer_phone': sale.customer_phone,
                'sale_date': sale.sale_date,
                'created_by': (
                    sale.created_by.username
                    if sale.created_by
                    else None
                ),
                'total': total,
            })

        return Response(result)


class PurchaseReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            start_date, end_date = get_date_range(request)
        except ValueError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )

        purchases = Purchase.objects.filter(
            status=Purchase.Status.RECEIVED
        ).select_related(
            'supplier',
            'created_by'
        ).prefetch_related(
            'items__product'
        )

        if start_date:
            purchases = purchases.filter(
                purchase_date__gte=start_date
            )

        if end_date:
            purchases = purchases.filter(
                purchase_date__lte=end_date
            )

        result = []

        for purchase in purchases:
            total = sum(
                (
                    item.quantity * item.unit_price
                    for item in purchase.items.all()
                ),
                Decimal('0.00')
            )

            result.append({
                'id': purchase.id,
                'invoice_number': purchase.invoice_number,
                'supplier': purchase.supplier.name,
                'purchase_date': purchase.purchase_date,
                'created_by': (
                    purchase.created_by.username
                    if purchase.created_by
                    else None
                ),
                'total': total,
            })

        return Response(result)