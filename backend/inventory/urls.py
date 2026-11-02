from rest_framework.routers import DefaultRouter

from .views import (
    InventoryTransactionViewSet,
    InventoryViewSet,
)


router = DefaultRouter()

router.register(
    r'inventory',
    InventoryViewSet,
    basename='inventory'
)

router.register(
    r'inventory-transactions',
    InventoryTransactionViewSet,
    basename='inventory-transaction'
)

urlpatterns = router.urls