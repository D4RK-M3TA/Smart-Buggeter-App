from django.contrib import admin
from .models import Category, Transaction, StatementUpload, RecurringPattern


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'color', 'user', 'is_system', 'created_at']
    list_filter = ['is_system', 'created_at']
    search_fields = ['name']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['date', 'description', 'amount', 'transaction_type', 'category', 'user', 'is_recurring']
    list_filter = ['transaction_type', 'category', 'is_recurring', 'date']
    search_fields = ['description', 'notes']
    date_hierarchy = 'date'
    raw_id_fields = ['user', 'category']


@admin.register(StatementUpload)
class StatementUploadAdmin(admin.ModelAdmin):
    list_display = ['original_filename', 'user', 'file_type', 'status', 'transactions_count', 'created_at']
    list_filter = ['status', 'file_type', 'created_at']
    search_fields = ['original_filename']
    raw_id_fields = ['user']


@admin.register(RecurringPattern)
class RecurringPatternAdmin(admin.ModelAdmin):
    list_display = ['merchant_name', 'description_pattern', 'frequency', 'average_amount', 'user', 'is_active']
    list_filter = ['frequency', 'is_active']
    search_fields = ['merchant_name', 'description_pattern']
    raw_id_fields = ['user']
