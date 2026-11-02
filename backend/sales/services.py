from collections import defaultdict

from django.core.exceptions import ValidationError
from django.db import transaction

from inventory.models import InventoryTransaction
from products.models import Product

from .models import Sale


@transaction.atomic
def complete_sale(sale_id, user=None):
    sale = (
        Sale.objects
        .select_for_update()
        .get(pk=sale_id)
    )

    if sale.status == Sale.Status.COMPLETED:
        return sale

    if sale.status == Sale.Status.CANCELLED:
        raise ValidationError(
            "A cancelled sale cannot be completed."
        )

    items = list(sale.items.all())

    if not items:
        raise ValidationError(
            "A sale must contain at least one item."
        )

    required_quantities = defaultdict(int)

    for item in items:
        required_quantities[item.product_id] += item.quantity

    product_ids = sorted(required_quantities.keys())

    products = {
        product.id: product
        for product in Product.objects
        .select_for_update()
        .filter(id__in=product_ids)
    }

    if len(products) != len(product_ids):
        raise ValidationError(
            "One or more products no longer exist."
        )

    # Check all stock BEFORE changing anything
    for product_id, required_quantity in required_quantities.items():
        product = products[product_id]

        if product.current_stock < required_quantity:
            raise ValidationError(
                f"Insufficient stock for {product.name}. "
                f"Available: {product.current_stock}, "
                f"Required: {required_quantity}."
            )

    actor = user or sale.created_by

    # Deduct stock
    for item in items:
        product = products[item.product_id]

        product.current_stock -= item.quantity

        product.save(
            update_fields=[
                'current_stock',
                'updated_at',
            ]
        )

        InventoryTransaction.objects.create(
            product=product,
            transaction_type=InventoryTransaction.TransactionType.OUT,
            quantity=item.quantity,
            note=f"Sale {sale.invoice_number}",
            created_by=actor,
        )

    sale.status = Sale.Status.COMPLETED

    sale.save(
        update_fields=[
            'status',
            'updated_at',
        ]
    )

    return sale