from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
import requests
from .models import Notification, NotificationPreference


@shared_task
def send_notification_email(notification_id):
    """Send email notification"""
    try:
        notification = Notification.objects.get(id=notification_id)
        prefs = NotificationPreference.objects.filter(
            user=notification.user
        ).first()
        
        if not prefs or not prefs.email_enabled:
            return
        
        send_mail(
            subject=notification.title,
            message=notification.message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[notification.user.email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Error sending email notification: {e}")


@shared_task
def send_webhook_notification(notification_id):
    """Send webhook notification"""
    try:
        notification = Notification.objects.get(id=notification_id)
        prefs = NotificationPreference.objects.filter(
            user=notification.user
        ).first()
        
        if not prefs or not prefs.webhook_enabled or not prefs.webhook_url:
            return
        
        payload = {
            'type': notification.notification_type,
            'title': notification.title,
            'message': notification.message,
            'metadata': notification.metadata,
            'created_at': notification.created_at.isoformat(),
        }
        
        requests.post(
            prefs.webhook_url,
            json=payload,
            timeout=10
        )
    except Exception as e:
        print(f"Error sending webhook notification: {e}")


@shared_task
def check_budget_thresholds():
    """Check all budgets and send threshold warnings"""
    from budgets.models import Budget
    from accounts.models import UserPreferences
    
    budgets = Budget.objects.filter(is_active=True)
    
    for budget in budgets:
        user_prefs = UserPreferences.objects.filter(
            user=budget.user
        ).first()
        
        if not user_prefs or not user_prefs.notification_enabled:
            continue
        
        threshold = user_prefs.budget_alert_threshold
        percentage_used = budget.percentage_used
        
        if percentage_used >= threshold and percentage_used < 100:
            Notification.objects.create(
                user=budget.user,
                notification_type='budget_threshold',
                title=f'Budget Alert: {budget.name}',
                message=f'Your budget "{budget.name}" has reached {percentage_used:.1f}% of its limit.',
                metadata={
                    'budget_id': str(budget.id),
                    'percentage_used': float(percentage_used),
                    'threshold': float(threshold)
                }
            )
        
        if percentage_used >= 100:
            Notification.objects.create(
                user=budget.user,
                notification_type='budget_exceeded',
                title=f'Budget Exceeded: {budget.name}',
                message=f'Your budget "{budget.name}" has been exceeded!',
                metadata={
                    'budget_id': str(budget.id),
                    'percentage_used': float(percentage_used)
                }
            )


@shared_task
def check_recurring_payments():
    """Check for upcoming recurring payments"""
    from transactions.models import RecurringPattern
    from datetime import timedelta
    
    upcoming_date = timezone.now().date() + timedelta(days=3)
    
    patterns = RecurringPattern.objects.filter(
        is_active=True,
        next_expected__lte=upcoming_date,
        next_expected__gte=timezone.now().date()
    )
    
    for pattern in patterns:
        Notification.objects.create(
            user=pattern.user,
            notification_type='recurring_upcoming',
            title='Upcoming Recurring Payment',
            message=f'You have a recurring payment of ${pattern.average_amount} for "{pattern.merchant_name or pattern.description_pattern}" coming up on {pattern.next_expected}.',
            metadata={
                'pattern_id': str(pattern.id),
                'amount': float(pattern.average_amount),
                'date': pattern.next_expected.isoformat()
            }
        )


@shared_task
def check_large_transactions():
    """Check for large transactions and send alerts"""
    from transactions.models import Transaction
    from datetime import timedelta
    
    yesterday = timezone.now().date() - timedelta(days=1)
    
    transactions = Transaction.objects.filter(
        date=yesterday,
        transaction_type='debit'
    )
    
    for transaction in transactions:
        prefs = NotificationPreference.objects.filter(
            user=transaction.user
        ).first()
        
        if not prefs or not prefs.large_transaction_alerts:
            continue
        
        if transaction.amount >= prefs.large_transaction_threshold:
            Notification.objects.create(
                user=transaction.user,
                notification_type='large_transaction',
                title='Large Transaction Alert',
                message=f'A large transaction of ${transaction.amount} was made: {transaction.description}',
                metadata={
                    'transaction_id': str(transaction.id),
                    'amount': float(transaction.amount),
                    'description': transaction.description
                }
            )

