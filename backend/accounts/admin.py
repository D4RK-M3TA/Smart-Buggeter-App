from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserPreferences


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'mfa_enabled', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_staff', 'mfa_enabled', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('MFA Settings', {'fields': ('mfa_enabled', 'mfa_secret')}),
    )


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = ['user', 'default_currency', 'notification_enabled', 'budget_alert_threshold']
    list_filter = ['default_currency', 'notification_enabled']
    search_fields = ['user__email']
