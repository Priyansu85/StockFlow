from django.db import transaction
from rest_framework import serializers

from .models import Sale, SaleItem


class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = [
            'id',
            'product',
            'quantity',
            'unit_price',
            'line_total',
        ]
        read_only_fields = [
            'id',
            'line_total',
        ]


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)

    class Meta:
        model = Sale
        fields = [
            'id',
            'invoice_number',
            'customer_name',
            'customer_phone',
            'sale_date',
            'status',
            'notes',
            'created_by',
            'created_at',
            'updated_at',
            'items',
        ]
        read_only_fields = [
            'id',
            'status',
            'created_by',
            'created_at',
            'updated_at',
        ]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError(
                "A sale must contain at least one item."
            )

        return items

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')

        request = self.context.get('request')

        sale = Sale.objects.create(
            **validated_data,
            created_by=request.user if request else None,
        )

        for item_data in items_data:
            SaleItem.objects.create(
                sale=sale,
                **item_data,
            )

        return sale