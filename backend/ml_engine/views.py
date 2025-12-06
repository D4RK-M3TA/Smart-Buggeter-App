from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from .classifier import TransactionClassifier, train_initial_model, get_training_data
from .serializers import (
    PredictSerializer, PredictResponseSerializer,
    TrainSerializer, TrainResponseSerializer,
    ModelStatusSerializer
)


class PredictCategoryView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['ML'],
        request=PredictSerializer,
        responses={200: PredictResponseSerializer}
    )
    def post(self, request):
        serializer = PredictSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        descriptions = serializer.validated_data['descriptions']
        
        classifier = TransactionClassifier()
        if not classifier.load_model():
            return Response(
                {'error': 'Model not trained yet. Please train the model first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        predictions = classifier.predict_batch(descriptions)
        
        results = [
            {
                'description': desc,
                'category': pred,
                'confidence': conf
            }
            for desc, (pred, conf) in zip(descriptions, predictions)
        ]
        
        return Response({'predictions': results})


class TrainModelView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['ML'],
        request=TrainSerializer,
        responses={200: TrainResponseSerializer}
    )
    def post(self, request):
        serializer = TrainSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        include_user_data = serializer.validated_data.get('include_user_data', False)
        
        descriptions, categories = get_training_data()
        
        if include_user_data:
            from transactions.models import Transaction
            
            user_transactions = Transaction.objects.filter(
                user=request.user,
                category__isnull=False
            ).select_related('category')
            
            for tx in user_transactions:
                descriptions.append(tx.description)
                categories.append(tx.category.name.lower())
        
        if len(descriptions) < 10:
            return Response(
                {'error': 'Not enough training data. Need at least 10 samples.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        classifier = TransactionClassifier()
        results = classifier.train(descriptions, categories)
        classifier.save_model()
        
        return Response({
            'message': 'Model trained successfully',
            'train_accuracy': results['train_accuracy'],
            'test_accuracy': results['test_accuracy'],
            'samples_trained': results['samples_trained'],
            'samples_tested': results['samples_tested']
        })


class ModelStatusView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['ML'], responses={200: ModelStatusSerializer})
    def get(self, request):
        classifier = TransactionClassifier()
        is_loaded = classifier.load_model()
        
        return Response({
            'model_exists': is_loaded,
            'model_path': str(classifier.model_path),
            'categories': classifier.categories
        })


class InitializeModelView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['ML'], responses={200: TrainResponseSerializer})
    def post(self, request):
        results = train_initial_model()
        
        return Response({
            'message': 'Initial model trained successfully',
            'train_accuracy': results['train_accuracy'],
            'test_accuracy': results['test_accuracy'],
            'samples_trained': results['samples_trained'],
            'samples_tested': results['samples_tested']
        })


class FeatureImportanceView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['ML'])
    def get(self, request):
        category = request.query_params.get('category')
        top_n = int(request.query_params.get('top_n', 10))
        
        classifier = TransactionClassifier()
        if not classifier.load_model():
            return Response(
                {'error': 'Model not trained yet.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if category:
            features = classifier.get_feature_importance(category, top_n)
            return Response({category: features})
        
        all_features = {}
        for cat in classifier.categories:
            all_features[cat] = classifier.get_feature_importance(cat, top_n)
        
        return Response(all_features)
