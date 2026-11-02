from django.contrib import admin

from .models import Sale, SaleItem


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 1


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = (
        'invoice_number',
        'customer_name',
        'customer_phone',
        'sale_date',
        'status',
        'created_by',
        'created_at',
    )

    search_fields = (
        'invoice_number',
        'customer_name',
        'customer_phone',
    )

    list_filter = (
        'status',
        'sale_date',
    )

    readonly_fields = (
        'created_at',
        'updated_at',
    )

    inlines = [SaleItemInline]


@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = (
        'sale',
        'product',
        'quantity',
        'unit_price',
    )

    search_fields = (
        'sale__invoice_number',
        'product__name',
        'product__sku',
    )