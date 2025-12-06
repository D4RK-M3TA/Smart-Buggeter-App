from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/budgets/', include('budgets.urls')),
    path('api/exports/', include('exports.urls')),
    path('api/ml/', include('ml_engine.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Conditionally include bill-splitting routes
if getattr(settings, 'BILL_SPLIT_ENABLED', False):
    urlpatterns.append(path('api/billsplit/', include('billsplit.urls')))

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
