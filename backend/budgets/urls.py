from django.urls import path
from .views import (
    BudgetListCreateView, BudgetDetailView, BudgetSummaryView,
    BudgetAlertListView, BudgetAlertMarkReadView, MonthlyBudgetReportView
)

urlpatterns = [
    path('', BudgetListCreateView.as_view(), name='budget_list'),
    path('<uuid:pk>/', BudgetDetailView.as_view(), name='budget_detail'),
    path('summary/', BudgetSummaryView.as_view(), name='budget_summary'),
    path('alerts/', BudgetAlertListView.as_view(), name='budget_alerts'),
    path('alerts/<uuid:pk>/read/', BudgetAlertMarkReadView.as_view(), name='budget_alert_read'),
    path('alerts/read-all/', BudgetAlertMarkReadView.as_view(), name='budget_alerts_read_all'),
    path('monthly-report/', MonthlyBudgetReportView.as_view(), name='monthly_report'),
]
