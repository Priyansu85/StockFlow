from rest_framework import serializers

from products.models import Product

from .models import InventoryTransaction


class InventoryTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    sku = serializers.CharField(
        source='product.sku',
        read_only=True
    )

    created_by_username = serializers.CharField(
        source='created_by.username',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = InventoryTransaction
        fields = [
            'id',
            'product',
            'product_name',
            'sku',
            'transaction_type',
            'quantity',
            'note',
            'created_by',
            'created_by_username',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'product',
            'product_name',
            'sku',
            'transaction_type',
            'quantity',
            'note',
            'created_by',
            'created_by_username',
            'created_at',
        ]


class ProductStockSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )

    is_low_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'sku',
            'category',
            'category_name',
            'current_stock',
            'minimum_stock',
            'is_low_stock',
        ]

        read_only_fields = [
            'id',
            'name',
            'sku',
            'category',
            'category_name',
            'current_stock',
            'minimum_stock',
            'is_low_stock',
        ]

    def get_is_low_stock(self, obj):
        return obj.current_stock <= obj.minimum_stock