from django.contrib import admin

from .models import Purchase, PurchaseItem


class PurchaseItemInline(admin.TabularInline):
    model = PurchaseItem
    extra = 1


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = (
        'invoice_number',
        'supplier',
        'purchase_date',
        'status',
        'created_by',
        'created_at',
    )

    search_fields = (
        'invoice_number',
        'supplier__name',
    )

    list_filter = (
        'status',
        'purchase_date',
    )

    readonly_fields = (
        'created_at',
        'updated_at',
    )

    inlines = [PurchaseItemInline]


@admin.register(PurchaseItem)
class PurchaseItemAdmin(admin.ModelAdmin):
    list_display = (
        'purchase',
        'product',
        'quantity',
        'unit_price',
    )

    search_fields = (
        'purchase__invoice_number',
        'product__name',
        'product__sku',
    )