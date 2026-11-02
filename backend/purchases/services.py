from django.core.exceptions import ValidationError
from django.db import transaction

from inventory.models import InventoryTransaction
from products.models import Product

from .models import Purchase


@transaction.atomic
def receive_purchase(purchase_id, user=None):
    purchase = (
        Purchase.objects
        .select_for_update()
        .get(pk=purchase_id)
    )

    if purchase.status == Purchase.Status.RECEIVED:
        return purchase

    if purchase.status == Purchase.Status.CANCELLED:
        raise ValidationError(
            "A cancelled purchase cannot be received."
        )

    items = list(purchase.items.all())

    if not items:
        raise ValidationError(
            "A purchase must contain at least one item."
        )

    product_ids = sorted(
        {item.product_id for item in items}
    )

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

    actor = user or purchase.created_by

    for item in items:
        product = products[item.product_id]

        product.current_stock += item.quantity

        product.save(
            update_fields=[
                'current_stock',
                'updated_at',
            ]
        )

        InventoryTransaction.objects.create(
            product=product,
            transaction_type=InventoryTransaction.TransactionType.IN,
            quantity=item.quantity,
            note=f"Purchase {purchase.invoice_number}",
            created_by=actor,
        )

    purchase.status = Purchase.Status.RECEIVED

    purchase.save(
        update_fields=[
            'status',
            'updated_at',
        ]
    )

    return purchase