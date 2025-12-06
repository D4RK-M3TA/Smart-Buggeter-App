from django.urls import path
from .views import (
    GroupListCreateView, GroupDetailView, GroupMemberAddView,
    GroupExpenseListCreateView, GroupExpenseDetailView,
    ExpenseShareUpdateView, BalanceView,
    SettlementListCreateView, SettlementDetailView
)

urlpatterns = [
    path('groups/', GroupListCreateView.as_view(), name='group-list-create'),
    path('groups/<uuid:pk>/', GroupDetailView.as_view(), name='group-detail'),
    path('groups/<uuid:group_id>/members/', GroupMemberAddView.as_view(), name='group-add-member'),
    path('groups/<uuid:group_id>/balance/', BalanceView.as_view(), name='group-balance'),
    path('expenses/', GroupExpenseListCreateView.as_view(), name='expense-list-create'),
    path('expenses/<uuid:pk>/', GroupExpenseDetailView.as_view(), name='expense-detail'),
    path('shares/<uuid:share_id>/', ExpenseShareUpdateView.as_view(), name='share-update'),
    path('settlements/', SettlementListCreateView.as_view(), name='settlement-list-create'),
    path('settlements/<uuid:pk>/', SettlementDetailView.as_view(), name='settlement-detail'),
]

