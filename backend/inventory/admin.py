from django.contrib import admin
from .models import InventoryTransaction


@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = (
        'product',
        'transaction_type',
        'quantity',
        'created_by',
        'created_at',
    )

    search_fields = (
        'product__name',
        'product__sku',
        'note',
    )

    list_filter = (
        'transaction_type',
        'created_at',
    )

    readonly_fields = ('created_at',)