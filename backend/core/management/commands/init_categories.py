from django.core.management.base import BaseCommand
from transactions.models import Category


class Command(BaseCommand):
    help = 'Initialize system categories'

    def handle(self, *args, **options):
        categories = [
            {'name': 'groceries', 'icon': 'shopping-cart', 'color': '#22C55E'},
            {'name': 'dining', 'icon': 'utensils', 'color': '#F97316'},
            {'name': 'transportation', 'icon': 'car', 'color': '#3B82F6'},
            {'name': 'utilities', 'icon': 'bolt', 'color': '#EAB308'},
            {'name': 'entertainment', 'icon': 'film', 'color': '#A855F7'},
            {'name': 'shopping', 'icon': 'bag-shopping', 'color': '#EC4899'},
            {'name': 'healthcare', 'icon': 'heart-pulse', 'color': '#EF4444'},
            {'name': 'travel', 'icon': 'plane', 'color': '#06B6D4'},
            {'name': 'subscriptions', 'icon': 'repeat', 'color': '#8B5CF6'},
            {'name': 'income', 'icon': 'wallet', 'color': '#10B981'},
            {'name': 'transfer', 'icon': 'arrows-rotate', 'color': '#6B7280'},
            {'name': 'fees', 'icon': 'receipt', 'color': '#DC2626'},
            {'name': 'other', 'icon': 'circle', 'color': '#9CA3AF'},
        ]

        created_count = 0
        for cat_data in categories:
            category, created = Category.objects.update_or_create(
                name=cat_data['name'],
                is_system=True,
                user=None,
                defaults={
                    'icon': cat_data['icon'],
                    'color': cat_data['color']
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created category: {cat_data['name']}")
            else:
                self.stdout.write(f"Updated category: {cat_data['name']}")

        self.stdout.write(
            self.style.SUCCESS(f'Successfully initialized {len(categories)} categories ({created_count} new)')
        )
