from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=32, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email


class UserPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    default_currency = models.CharField(max_length=3, default='USD')
    notification_enabled = models.BooleanField(default=True)
    budget_alert_threshold = models.DecimalField(max_digits=5, decimal_places=2, default=80.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_preferences'

    def __str__(self):
        return f"Preferences for {self.user.email}"


class UserSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    device_name = models.CharField(max_length=255, blank=True)
    device_type = models.CharField(max_length=50, blank=True)  # mobile, desktop, tablet
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    refresh_token_jti = models.CharField(max_length=255, unique=True)  # JWT ID
    is_active = models.BooleanField(default=True)
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_sessions'
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['user', '-last_activity']),
            models.Index(fields=['refresh_token_jti']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.device_name or 'Unknown Device'}"
