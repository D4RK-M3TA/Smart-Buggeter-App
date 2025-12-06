from django.contrib import admin
from .models import AuditLog, SystemCategory


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'model_name', 'endpoint', 'ip_address', 'created_at']
    list_filter = ['action', 'model_name', 'created_at']
    search_fields = ['user__email', 'endpoint']
    readonly_fields = ['id', 'user', 'action', 'model_name', 'object_id', 'changes', 'ip_address', 'user_agent', 'endpoint', 'created_at']
    date_hierarchy = 'created_at'


@admin.register(SystemCategory)
class SystemCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'color', 'created_at']
    search_fields = ['name']
