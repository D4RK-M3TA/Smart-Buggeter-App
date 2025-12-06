from rest_framework import serializers
from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'is_read', 'read_at', 'metadata', 'created_at'
        ]
        read_only_fields = ['created_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'email_enabled', 'webhook_enabled', 'webhook_url',
            'budget_threshold_alerts', 'budget_exceeded_alerts',
            'recurring_payment_alerts', 'large_transaction_alerts',
            'large_transaction_threshold', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

