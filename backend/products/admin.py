from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    search_fields = ('name',)
    list_filter = ('is_active',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'sku',
        'category',
        'purchase_price',
        'selling_price',
        'current_stock',
        'minimum_stock',
        'is_active',
    )

    search_fields = ('name', 'sku')
    list_filter = ('category', 'is_active')