from django.db import models
from django.conf import settings
import uuid


class Group(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_groups'
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='GroupMember',
        related_name='groups'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'groups'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class GroupMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='group_members')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='group_memberships'
    )
    is_admin = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_members'
        unique_together = ['group', 'user']

    def __str__(self):
        return f"{self.user.email} in {self.group.name}"


class GroupExpense(models.Model):
    SPLIT_METHOD_CHOICES = [
        ('equal', 'Equal'),
        ('percentage', 'Percentage'),
        ('amount', 'Custom Amount'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='expenses'
    )
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='paid_expenses'
    )
    split_method = models.CharField(
        max_length=20,
        choices=SPLIT_METHOD_CHOICES,
        default='equal'
    )
    date = models.DateField()
    category = models.ForeignKey(
        'transactions.Category',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True)
    is_settled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'group_expenses'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.description} - ${self.amount}"


class ExpenseShare(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expense = models.ForeignKey(
        GroupExpense,
        on_delete=models.CASCADE,
        related_name='shares'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expense_shares'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expense_shares'
        unique_together = ['expense', 'user']

    def __str__(self):
        return f"{self.user.email} - ${self.amount}"


class Settlement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='settlements'
    )
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_settlements'
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_settlements'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'settlements'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.from_user.email} → {self.to_user.email}: ${self.amount}"

