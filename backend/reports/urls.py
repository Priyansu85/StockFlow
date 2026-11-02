from django.urls import path

from .views import (
    DashboardView,
    PurchaseReportView,
    SalesReportView,
)


urlpatterns = [
    path(
        'dashboard/',
        DashboardView.as_view(),
        name='dashboard'
    ),

    path(
        'sales/',
        SalesReportView.as_view(),
        name='sales-report'
    ),

    path(
        'purchases/',
        PurchaseReportView.as_view(),
        name='purchase-report'
    ),
]