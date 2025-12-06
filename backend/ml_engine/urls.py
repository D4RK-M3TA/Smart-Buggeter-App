from django.urls import path
from .views import (
    PredictCategoryView, TrainModelView, ModelStatusView,
    InitializeModelView, FeatureImportanceView
)

urlpatterns = [
    path('predict/', PredictCategoryView.as_view(), name='ml_predict'),
    path('train/', TrainModelView.as_view(), name='ml_train'),
    path('status/', ModelStatusView.as_view(), name='ml_status'),
    path('initialize/', InitializeModelView.as_view(), name='ml_initialize'),
    path('features/', FeatureImportanceView.as_view(), name='ml_features'),
]
