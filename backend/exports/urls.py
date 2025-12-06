from django.urls import path
from .views import (
    ExportTransactionsCSVView, ExportTransactionsExcelView,
    ExportBudgetReportPDFView, ExportCategorySummaryView
)

urlpatterns = [
    path('transactions/csv/', ExportTransactionsCSVView.as_view(), name='export_csv'),
    path('transactions/excel/', ExportTransactionsExcelView.as_view(), name='export_excel'),
    path('budget-report/pdf/', ExportBudgetReportPDFView.as_view(), name='export_budget_pdf'),
    path('category-summary/', ExportCategorySummaryView.as_view(), name='export_category_summary'),
]
