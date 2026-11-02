from rest_framework import serializers


class DashboardSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    total_stock = serializers.IntegerField()
    low_stock_count = serializers.IntegerField()

    total_purchases = serializers.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    total_sales = serializers.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    total_profit = serializers.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    recent_transactions = serializers.ListField()
    
    sales_trend = serializers.ListField()
    purchase_trend = serializers.ListField()