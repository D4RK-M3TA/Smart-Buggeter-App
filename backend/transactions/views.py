import hashlib
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Category, Transaction, StatementUpload, RecurringPattern
from .serializers import (
    CategorySerializer, TransactionSerializer, TransactionCreateSerializer,
    TransactionBulkUpdateSerializer, StatementUploadSerializer,
    RecurringPatternSerializer, TransactionFilterSerializer
)
from .tasks import process_statement_upload


class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Categories'])
    def get_queryset(self):
        return Category.objects.filter(
            Q(user=self.request.user) | Q(is_system=True)
        )

    @extend_schema(tags=['Categories'])
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Categories'])
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user, is_system=False)


class TransactionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TransactionCreateSerializer
        return TransactionSerializer

    @extend_schema(
        tags=['Transactions'],
        parameters=[
            OpenApiParameter('start_date', str, description='Filter start date (YYYY-MM-DD)'),
            OpenApiParameter('end_date', str, description='Filter end date (YYYY-MM-DD)'),
            OpenApiParameter('category', str, description='Category UUID'),
            OpenApiParameter('transaction_type', str, description='debit or credit'),
            OpenApiParameter('is_recurring', bool, description='Filter recurring transactions'),
            OpenApiParameter('min_amount', float, description='Minimum amount'),
            OpenApiParameter('max_amount', float, description='Maximum amount'),
            OpenApiParameter('search', str, description='Search in description'),
        ]
    )
    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)
        
        params = self.request.query_params
        
        if params.get('start_date'):
            queryset = queryset.filter(date__gte=params['start_date'])
        if params.get('end_date'):
            queryset = queryset.filter(date__lte=params['end_date'])
        if params.get('category'):
            queryset = queryset.filter(category_id=params['category'])
        if params.get('transaction_type'):
            queryset = queryset.filter(transaction_type=params['transaction_type'])
        if params.get('is_recurring'):
            queryset = queryset.filter(is_recurring=params['is_recurring'].lower() == 'true')
        if params.get('min_amount'):
            queryset = queryset.filter(amount__gte=params['min_amount'])
        if params.get('max_amount'):
            queryset = queryset.filter(amount__lte=params['max_amount'])
        if params.get('search'):
            queryset = queryset.filter(description__icontains=params['search'])
        
        return queryset.select_related('category', 'ml_category')

    @extend_schema(tags=['Transactions'])
    def perform_create(self, serializer):
        serializer.save()


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Transactions'])
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class TransactionBulkUpdateView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Transactions'], request=TransactionBulkUpdateSerializer)
    def post(self, request):
        serializer = TransactionBulkUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        transaction_ids = serializer.validated_data['transaction_ids']
        transactions = Transaction.objects.filter(
            id__in=transaction_ids, user=request.user
        )
        
        update_fields = {}
        if 'category' in serializer.validated_data:
            update_fields['category_id'] = serializer.validated_data['category']
        if 'notes' in serializer.validated_data:
            update_fields['notes'] = serializer.validated_data['notes']
        
        updated_count = transactions.update(**update_fields)
        
        return Response({
            'message': f'Updated {updated_count} transactions',
            'updated_count': updated_count
        })


class TransactionSummaryView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Transactions'],
        parameters=[
            OpenApiParameter('start_date', str, description='Start date (YYYY-MM-DD)'),
            OpenApiParameter('end_date', str, description='End date (YYYY-MM-DD)'),
        ]
    )
    def get(self, request):
        queryset = Transaction.objects.filter(user=request.user)
        
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        total_income = queryset.filter(
            transaction_type='credit'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        total_expenses = queryset.filter(
            transaction_type='debit'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        by_category = queryset.filter(
            transaction_type='debit', category__isnull=False
        ).values('category__name', 'category__color').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')
        
        return Response({
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net': total_income - total_expenses,
            'by_category': list(by_category),
            'transaction_count': queryset.count()
        })


class StatementUploadView(generics.CreateAPIView):
    serializer_class = StatementUploadSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(tags=['Statement Upload'])
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        filename = file.name.lower()
        if filename.endswith('.csv'):
            file_type = 'csv'
        elif filename.endswith('.pdf'):
            file_type = 'pdf'
        else:
            return Response(
                {'error': 'Unsupported file type. Only CSV and PDF are allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file_content = file.read()
        file_hash = hashlib.sha256(file_content).hexdigest()
        file.seek(0)
        
        existing = StatementUpload.objects.filter(
            user=request.user, file_hash=file_hash
        ).first()
        
        if existing:
            return Response({
                'message': 'This file has already been uploaded',
                'upload': StatementUploadSerializer(existing).data
            }, status=status.HTTP_200_OK)
        
        upload = StatementUpload.objects.create(
            user=request.user,
            file=file,
            original_filename=file.name,
            file_type=file_type,
            file_hash=file_hash
        )
        
        process_statement_upload.delay(str(upload.id))
        
        return Response(
            StatementUploadSerializer(upload).data,
            status=status.HTTP_201_CREATED
        )


class StatementUploadListView(generics.ListAPIView):
    serializer_class = StatementUploadSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Statement Upload'])
    def get_queryset(self):
        return StatementUpload.objects.filter(user=self.request.user)


class StatementUploadDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = StatementUploadSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Statement Upload'])
    def get_queryset(self):
        return StatementUpload.objects.filter(user=self.request.user)


class RecurringPatternListView(generics.ListAPIView):
    serializer_class = RecurringPatternSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Recurring Patterns'])
    def get_queryset(self):
        return RecurringPattern.objects.filter(user=self.request.user)


class RecurringPatternDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecurringPatternSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Recurring Patterns'])
    def get_queryset(self):
        return RecurringPattern.objects.filter(user=self.request.user)
