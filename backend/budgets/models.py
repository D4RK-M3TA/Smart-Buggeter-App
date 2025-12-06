from django.db import models
from django.conf import settings
import uuid


class Budget(models.Model):
    PERIOD_CHOICES = [
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
        ('custom', 'Custom'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='budgets'
    )
    name = models.CharField(max_length=100)
    category = models.ForeignKey(
        'transactions.Category', on_delete=models.CASCADE,
        related_name='budgets', null=True, blank=True
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='monthly')
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    rollover = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'budgets'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - ${self.amount}"

    @property
    def spent(self):
        from transactions.models import Transaction
        from django.db.models import Sum
        from datetime import date
        
        today = date.today()
        end = min(self.end_date, today)
        
        result = Transaction.objects.filter(
            user=self.user,
            transaction_type='debit',
            date__gte=self.start_date,
            date__lte=end
        )
        
        if self.category:
            result = result.filter(category=self.category)
        
        return result.aggregate(total=Sum('amount'))['total'] or 0

    @property
    def remaining(self):
        return max(self.amount - self.spent, 0)

    @property
    def percentage_used(self):
        if self.amount == 0:
            return 0
        return min((self.spent / self.amount) * 100, 100)


class BudgetAlert(models.Model):
    ALERT_TYPES = [
        ('threshold', 'Threshold Warning'),
        ('exceeded', 'Budget Exceeded'),
        ('upcoming', 'Upcoming Expense'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    budget = models.ForeignKey(
        Budget, on_delete=models.CASCADE,
        related_name='alerts'
    )
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    message = models.TextField()
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'budget_alerts'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.budget.name} - {self.alert_type}"
