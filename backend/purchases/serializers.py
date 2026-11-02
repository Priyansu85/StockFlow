from django.db import transaction
from rest_framework import serializers

from products.models import Product

from .models import Purchase, PurchaseItem


class PurchaseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseItem
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


class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True)

    class Meta:
        model = Purchase
        fields = [
            'id',
            'invoice_number',
            'supplier',
            'purchase_date',
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
                "A purchase must contain at least one item."
            )

        return items

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')

        request = self.context.get('request')

        purchase = Purchase.objects.create(
            **validated_data,
            created_by=request.user if request else None,
        )

        for item_data in items_data:
            PurchaseItem.objects.create(
                purchase=purchase,
                **item_data,
            )

        return purchase