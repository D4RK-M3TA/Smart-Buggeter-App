from rest_framework import serializers
from .models import Budget, BudgetAlert


class BudgetSerializer(serializers.ModelSerializer):
    spent = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    remaining = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    percentage_used = serializers.FloatField(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Budget
        fields = [
            'id', 'name', 'category', 'category_name', 'amount', 'period',
            'start_date', 'end_date', 'is_active', 'rollover', 'notes',
            'spent', 'remaining', 'percentage_used', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BudgetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = [
            'name', 'category', 'amount', 'period',
            'start_date', 'end_date', 'is_active', 'rollover', 'notes'
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BudgetAlertSerializer(serializers.ModelSerializer):
    budget_name = serializers.CharField(source='budget.name', read_only=True)

    class Meta:
        model = BudgetAlert
        fields = [
            'id', 'budget', 'budget_name', 'alert_type', 'message',
            'percentage', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'budget', 'alert_type', 'message', 'percentage', 'created_at']


class BudgetSummarySerializer(serializers.Serializer):
    total_budget = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_remaining = serializers.DecimalField(max_digits=12, decimal_places=2)
    budgets_count = serializers.IntegerField()
    exceeded_count = serializers.IntegerField()
    on_track_count = serializers.IntegerField()
