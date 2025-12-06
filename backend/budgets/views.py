from datetime import date
from django.db.models import Sum
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Budget, BudgetAlert
from .serializers import (
    BudgetSerializer, BudgetCreateSerializer,
    BudgetAlertSerializer, BudgetSummarySerializer
)


class BudgetListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BudgetCreateSerializer
        return BudgetSerializer

    @extend_schema(
        tags=['Budgets'],
        parameters=[
            OpenApiParameter('is_active', bool, description='Filter by active status'),
            OpenApiParameter('period', str, description='Filter by period'),
        ]
    )
    def get_queryset(self):
        queryset = Budget.objects.filter(user=self.request.user)
        
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        period = self.request.query_params.get('period')
        if period:
            queryset = queryset.filter(period=period)
        
        return queryset.select_related('category')

    @extend_schema(tags=['Budgets'])
    def perform_create(self, serializer):
        serializer.save()


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Budgets'])
    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)


class BudgetSummaryView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Budgets'], responses={200: BudgetSummarySerializer})
    def get(self, request):
        today = date.today()
        
        active_budgets = Budget.objects.filter(
            user=request.user,
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        ).select_related('category')
        
        total_budget = sum(b.amount for b in active_budgets)
        total_spent = sum(b.spent for b in active_budgets)
        
        exceeded_count = sum(1 for b in active_budgets if b.percentage_used >= 100)
        on_track_count = len(active_budgets) - exceeded_count
        
        return Response({
            'total_budget': total_budget,
            'total_spent': total_spent,
            'total_remaining': max(total_budget - total_spent, 0),
            'budgets_count': len(active_budgets),
            'exceeded_count': exceeded_count,
            'on_track_count': on_track_count,
            'budgets': BudgetSerializer(active_budgets, many=True).data
        })


class BudgetAlertListView(generics.ListAPIView):
    serializer_class = BudgetAlertSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Budget Alerts'],
        parameters=[
            OpenApiParameter('is_read', bool, description='Filter by read status'),
        ]
    )
    def get_queryset(self):
        queryset = BudgetAlert.objects.filter(
            budget__user=self.request.user
        )
        
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        return queryset.select_related('budget')


class BudgetAlertMarkReadView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Budget Alerts'])
    def post(self, request, pk=None):
        if pk:
            alerts = BudgetAlert.objects.filter(
                id=pk, budget__user=request.user
            )
        else:
            alerts = BudgetAlert.objects.filter(
                budget__user=request.user, is_read=False
            )
        
        updated = alerts.update(is_read=True)
        return Response({'marked_read': updated})


class MonthlyBudgetReportView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Budgets'],
        parameters=[
            OpenApiParameter('year', int, description='Year'),
            OpenApiParameter('month', int, description='Month (1-12)'),
        ]
    )
    def get(self, request):
        from transactions.models import Transaction, Category
        from calendar import monthrange
        
        today = date.today()
        year = int(request.query_params.get('year', today.year))
        month = int(request.query_params.get('month', today.month))
        
        start_date = date(year, month, 1)
        _, last_day = monthrange(year, month)
        end_date = date(year, month, last_day)
        
        transactions = Transaction.objects.filter(
            user=request.user,
            date__gte=start_date,
            date__lte=end_date
        )
        
        income = transactions.filter(
            transaction_type='credit'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        expenses = transactions.filter(
            transaction_type='debit'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        by_category = transactions.filter(
            transaction_type='debit',
            category__isnull=False
        ).values(
            'category__id', 'category__name', 'category__color'
        ).annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        budgets = Budget.objects.filter(
            user=request.user,
            start_date__lte=end_date,
            end_date__gte=start_date
        ).select_related('category')
        
        budget_data = []
        for budget in budgets:
            budget_data.append({
                'id': str(budget.id),
                'name': budget.name,
                'category': budget.category.name if budget.category else None,
                'amount': budget.amount,
                'spent': budget.spent,
                'remaining': budget.remaining,
                'percentage_used': budget.percentage_used
            })
        
        return Response({
            'period': {
                'year': year,
                'month': month,
                'start_date': start_date,
                'end_date': end_date
            },
            'summary': {
                'income': income,
                'expenses': expenses,
                'net': income - expenses
            },
            'by_category': list(by_category),
            'budgets': budget_data
        })
