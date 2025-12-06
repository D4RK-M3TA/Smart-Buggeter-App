from django.db import models
from django.conf import settings
import uuid


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('budget_threshold', 'Budget Threshold Warning'),
        ('budget_exceeded', 'Budget Exceeded'),
        ('recurring_upcoming', 'Upcoming Recurring Payment'),
        ('large_transaction', 'Large Transaction Alert'),
        ('statement_processed', 'Statement Processed'),
        ('export_ready', 'Export Ready'),
        ('system', 'System Notification'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.title}"

    def mark_as_read(self):
        from django.utils import timezone
        self.is_read = True
        self.read_at = timezone.now()
        self.save()


class NotificationPreference(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    email_enabled = models.BooleanField(default=True)
    webhook_enabled = models.BooleanField(default=False)
    webhook_url = models.URLField(blank=True)
    budget_threshold_alerts = models.BooleanField(default=True)
    budget_exceeded_alerts = models.BooleanField(default=True)
    recurring_payment_alerts = models.BooleanField(default=True)
    large_transaction_alerts = models.BooleanField(default=True)
    large_transaction_threshold = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=1000.00
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notification_preferences'

    def __str__(self):
        return f"Preferences for {self.user.email}"

