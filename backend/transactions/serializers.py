from rest_framework import serializers
from .models import Category, Transaction, StatementUpload, RecurringPattern


class CategorySerializer(serializers.ModelSerializer):
    transaction_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'color', 'is_system', 'transaction_count', 'created_at']
        read_only_fields = ['id', 'is_system', 'created_at']

    def get_transaction_count(self, obj):
        return obj.transactions.count()


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    ml_category_name = serializers.CharField(source='ml_category.name', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'date', 'description', 'amount', 'transaction_type',
            'category', 'category_name', 'ml_category', 'ml_category_name',
            'ml_confidence', 'is_recurring', 'recurring_group', 'notes',
            'receipt', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ml_category', 'ml_confidence', 'created_at', 'updated_at']


class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'date', 'description', 'amount', 'transaction_type',
            'category', 'notes', 'receipt'
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TransactionBulkUpdateSerializer(serializers.Serializer):
    transaction_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1
    )
    category = serializers.UUIDField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)


class StatementUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatementUpload
        fields = [
            'id', 'file', 'original_filename', 'file_type', 'status',
            'transactions_count', 'error_message', 'created_at', 'processed_at'
        ]
        read_only_fields = [
            'id', 'original_filename', 'file_type', 'status',
            'transactions_count', 'error_message', 'created_at', 'processed_at'
        ]


class RecurringPatternSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = RecurringPattern
        fields = [
            'id', 'description_pattern', 'merchant_name', 'average_amount',
            'frequency', 'category', 'category_name', 'last_occurrence',
            'next_expected', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TransactionFilterSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    category = serializers.UUIDField(required=False)
    transaction_type = serializers.ChoiceField(
        choices=['debit', 'credit'], required=False
    )
    is_recurring = serializers.BooleanField(required=False)
    min_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False
    )
    max_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False
    )
    search = serializers.CharField(required=False)
