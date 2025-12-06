from django.db import models
from django.conf import settings
import uuid
import hashlib


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=7, default='#6B7280')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='categories', null=True, blank=True
    )
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        unique_together = ['name', 'user']
        ordering = ['name']

    def __str__(self):
        return self.name


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('debit', 'Debit'),
        ('credit', 'Credit'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='transactions'
    )
    date = models.DateField()
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='transactions'
    )
    ml_category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='ml_categorized_transactions'
    )
    ml_confidence = models.FloatField(null=True, blank=True)
    is_recurring = models.BooleanField(default=False)
    recurring_group = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True)
    receipt = models.FileField(upload_to='receipts/', blank=True, null=True)
    source_file = models.ForeignKey(
        'StatementUpload', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='transactions'
    )
    idempotency_hash = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-date', '-created_at']

    def save(self, *args, **kwargs):
        if not self.idempotency_hash:
            hash_input = f"{self.user_id}:{self.date}:{self.description}:{self.amount}:{self.transaction_type}"
            self.idempotency_hash = hashlib.sha256(hash_input.encode()).hexdigest()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.date} - {self.description[:30]} - ${self.amount}"


class StatementUpload(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='statement_uploads'
    )
    file = models.FileField(upload_to='statements/')
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transactions_count = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    file_hash = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'statement_uploads'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.original_filename} - {self.status}"


class RecurringPattern(models.Model):
    FREQUENCY_CHOICES = [
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='recurring_patterns'
    )
    description_pattern = models.CharField(max_length=255)
    merchant_name = models.CharField(max_length=255, blank=True)
    average_amount = models.DecimalField(max_digits=12, decimal_places=2)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True
    )
    last_occurrence = models.DateField(null=True, blank=True)
    next_expected = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'recurring_patterns'
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.merchant_name or self.description_pattern[:30]} - {self.frequency}"
