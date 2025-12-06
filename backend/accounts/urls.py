from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, UserProfileView,
    UserPreferencesView, ChangePasswordView, MFASetupView,
    MFADisableView, CustomTokenRefreshView, UserSessionListView,
    UserSessionDetailView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('preferences/', UserPreferencesView.as_view(), name='preferences'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('mfa/setup/', MFASetupView.as_view(), name='mfa_setup'),
    path('mfa/disable/', MFADisableView.as_view(), name='mfa_disable'),
    path('sessions/', UserSessionListView.as_view(), name='session-list'),
    path('sessions/<uuid:pk>/', UserSessionDetailView.as_view(), name='session-detail'),
]
