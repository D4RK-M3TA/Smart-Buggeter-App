from django.contrib import admin
from .models import Budget, BudgetAlert


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'category', 'amount', 'period', 'start_date', 'end_date', 'is_active']
    list_filter = ['period', 'is_active', 'created_at']
    search_fields = ['name']
    raw_id_fields = ['user', 'category']
    date_hierarchy = 'start_date'


@admin.register(BudgetAlert)
class BudgetAlertAdmin(admin.ModelAdmin):
    list_display = ['budget', 'alert_type', 'percentage', 'is_read', 'created_at']
    list_filter = ['alert_type', 'is_read', 'created_at']
    raw_id_fields = ['budget']
