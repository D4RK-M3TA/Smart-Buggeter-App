from django.contrib import admin
from .models import Group, GroupMember, GroupExpense, ExpenseShare, Settlement


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']


@admin.register(GroupMember)
class GroupMemberAdmin(admin.ModelAdmin):
    list_display = ['group', 'user', 'is_admin', 'joined_at']
    list_filter = ['is_admin', 'joined_at']


@admin.register(GroupExpense)
class GroupExpenseAdmin(admin.ModelAdmin):
    list_display = ['description', 'group', 'amount', 'paid_by', 'date', 'is_settled']
    list_filter = ['is_settled', 'split_method', 'date']
    search_fields = ['description']


@admin.register(ExpenseShare)
class ExpenseShareAdmin(admin.ModelAdmin):
    list_display = ['expense', 'user', 'amount', 'is_paid']
    list_filter = ['is_paid']


@admin.register(Settlement)
class SettlementAdmin(admin.ModelAdmin):
    list_display = ['from_user', 'to_user', 'amount', 'is_paid', 'created_at']
    list_filter = ['is_paid', 'created_at']

