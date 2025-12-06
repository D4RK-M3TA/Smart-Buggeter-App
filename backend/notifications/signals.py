from django.db.models.signals import post_save
from django.dispatch import receiver
from transactions.models import Transaction, StatementUpload
from .models import Notification
from .tasks import send_notification_email, send_webhook_notification


@receiver(post_save, sender=StatementUpload)
def notify_statement_processed(sender, instance, created, **kwargs):
    """Notify user when statement is processed"""
    if instance.status == 'completed' and instance.transactions_count > 0:
        Notification.objects.create(
            user=instance.user,
            notification_type='statement_processed',
            title='Statement Processed',
            message=f'Your statement "{instance.original_filename}" has been processed. {instance.transactions_count} transactions imported.',
            metadata={
                'upload_id': str(instance.id),
                'transactions_count': instance.transactions_count
            }
        )

