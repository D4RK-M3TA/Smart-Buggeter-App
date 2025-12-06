from django.urls import path
from .views import (
    CategoryListCreateView, CategoryDetailView,
    TransactionListCreateView, TransactionDetailView,
    TransactionBulkUpdateView, TransactionSummaryView,
    StatementUploadView, StatementUploadListView, StatementUploadDetailView,
    RecurringPatternListView, RecurringPatternDetailView
)

urlpatterns = [
    path('categories/', CategoryListCreateView.as_view(), name='category_list'),
    path('categories/<uuid:pk>/', CategoryDetailView.as_view(), name='category_detail'),
    path('', TransactionListCreateView.as_view(), name='transaction_list'),
    path('<uuid:pk>/', TransactionDetailView.as_view(), name='transaction_detail'),
    path('bulk-update/', TransactionBulkUpdateView.as_view(), name='transaction_bulk_update'),
    path('summary/', TransactionSummaryView.as_view(), name='transaction_summary'),
    path('upload/', StatementUploadView.as_view(), name='statement_upload'),
    path('uploads/', StatementUploadListView.as_view(), name='statement_upload_list'),
    path('uploads/<uuid:pk>/', StatementUploadDetailView.as_view(), name='statement_upload_detail'),
    path('recurring/', RecurringPatternListView.as_view(), name='recurring_pattern_list'),
    path('recurring/<uuid:pk>/', RecurringPatternDetailView.as_view(), name='recurring_pattern_detail'),
]
