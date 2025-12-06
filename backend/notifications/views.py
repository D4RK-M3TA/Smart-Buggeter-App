from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, NotificationPreferenceSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Notifications'])
    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        return queryset


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Notifications'])
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @extend_schema(tags=['Notifications'])
    def patch(self, request, *args, **kwargs):
        notification = self.get_object()
        is_read = request.data.get('is_read')
        
        if is_read is not None:
            if is_read:
                notification.mark_as_read()
            else:
                notification.is_read = False
                notification.read_at = None
                notification.save()
        
        return Response(NotificationSerializer(notification).data)


class NotificationMarkAllReadView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Notifications'])
    def post(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True, read_at=timezone.now())
        
        return Response({
            'message': f'Marked {count} notifications as read',
            'count': count
        })


class NotificationUnreadCountView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Notifications'])
    def get(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        return Response({'unread_count': count})


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Notifications'])
    def get_object(self):
        prefs, _ = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return prefs

