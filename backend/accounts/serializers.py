from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UserPreferences

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        UserPreferences.objects.create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'mfa_enabled', 'created_at']
        read_only_fields = ['id', 'email', 'mfa_enabled', 'created_at']


class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = ['default_currency', 'notification_enabled', 'budget_alert_threshold']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])


class MFASetupSerializer(serializers.Serializer):
    otp_code = serializers.CharField(max_length=6, min_length=6)


class MFAVerifySerializer(serializers.Serializer):
    otp_code = serializers.CharField(max_length=6, min_length=6)


class TokenObtainSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    otp_code = serializers.CharField(required=False, allow_blank=True)
    device_name = serializers.CharField(required=False, allow_blank=True)
    device_type = serializers.CharField(required=False, allow_blank=True)


class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import UserSession
        model = UserSession
        fields = [
            'id', 'device_name', 'device_type', 'ip_address',
            'is_active', 'last_activity', 'created_at'
        ]
        read_only_fields = ['id', 'ip_address', 'last_activity', 'created_at']
