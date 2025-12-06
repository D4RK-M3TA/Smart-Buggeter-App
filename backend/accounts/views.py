import pyotp
import qrcode
import io
import base64
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema

from .serializers import (
    UserRegistrationSerializer, UserSerializer, UserPreferencesSerializer,
    ChangePasswordSerializer, MFASetupSerializer, MFAVerifySerializer,
    TokenObtainSerializer, UserSessionSerializer
)
from .models import UserPreferences, UserSession

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    @extend_schema(tags=['Authentication'])
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(views.APIView):
    permission_classes = [AllowAny]
    serializer_class = TokenObtainSerializer

    @extend_schema(tags=['Authentication'], request=TokenObtainSerializer)
    def post(self, request):
        serializer = TokenObtainSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        otp_code = serializer.validated_data.get('otp_code', '')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.mfa_enabled:
            if not otp_code:
                return Response({'mfa_required': True}, status=status.HTTP_200_OK)
            
            totp = pyotp.TOTP(user.mfa_secret)
            if not totp.verify(otp_code):
                return Response({'error': 'Invalid OTP code'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        
        # Create session
        device_name = request.data.get('device_name', 'Unknown Device')
        device_type = request.data.get('device_type', 'desktop')
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        session = UserSession.objects.create(
            user=user,
            device_name=device_name,
            device_type=device_type,
            ip_address=ip_address,
            user_agent=user_agent[:500],
            refresh_token_jti=str(refresh['jti'])
        )
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'session': UserSessionSerializer(session).data
        })


    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['User Profile'])
    def get_object(self):
        return self.request.user


class UserPreferencesView(generics.RetrieveUpdateAPIView):
    serializer_class = UserPreferencesSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['User Profile'])
    def get_object(self):
        preferences, _ = UserPreferences.objects.get_or_create(user=self.request.user)
        return preferences


class ChangePasswordView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['User Profile'], request=ChangePasswordSerializer)
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully'})


class MFASetupView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['MFA'])
    def get(self, request):
        user = request.user
        if user.mfa_enabled:
            return Response({'error': 'MFA is already enabled'}, status=status.HTTP_400_BAD_REQUEST)

        secret = pyotp.random_base32()
        user.mfa_secret = secret
        user.save()

        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(user.email, issuer_name='Smart Budgeter')

        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color='black', back_color='white')
        
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_code = base64.b64encode(buffer.getvalue()).decode()

        return Response({
            'secret': secret,
            'qr_code': f'data:image/png;base64,{qr_code}',
            'provisioning_uri': provisioning_uri
        })

    @extend_schema(tags=['MFA'], request=MFASetupSerializer)
    def post(self, request):
        serializer = MFASetupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.mfa_secret:
            return Response({'error': 'Please initiate MFA setup first'}, status=status.HTTP_400_BAD_REQUEST)

        totp = pyotp.TOTP(user.mfa_secret)
        if totp.verify(serializer.validated_data['otp_code']):
            user.mfa_enabled = True
            user.save()
            return Response({'message': 'MFA enabled successfully'})
        
        return Response({'error': 'Invalid OTP code'}, status=status.HTTP_400_BAD_REQUEST)


class MFADisableView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['MFA'], request=MFAVerifySerializer)
    def post(self, request):
        serializer = MFAVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.mfa_enabled:
            return Response({'error': 'MFA is not enabled'}, status=status.HTTP_400_BAD_REQUEST)

        totp = pyotp.TOTP(user.mfa_secret)
        if totp.verify(serializer.validated_data['otp_code']):
            user.mfa_enabled = False
            user.mfa_secret = None
            user.save()
            return Response({'message': 'MFA disabled successfully'})
        
        return Response({'error': 'Invalid OTP code'}, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenRefreshView(TokenRefreshView):
    @extend_schema(tags=['Authentication'])
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        # Update session activity
        if response.status_code == 200:
            try:
                from rest_framework_simplejwt.tokens import RefreshToken
                refresh_token = RefreshToken(request.data.get('refresh'))
                session = UserSession.objects.filter(
                    refresh_token_jti=str(refresh_token['jti']),
                    is_active=True
                ).first()
                if session:
                    session.save()  # Updates last_activity
            except Exception:
                pass
        
        return response


class UserSessionListView(generics.ListAPIView):
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['User Sessions'])
    def get_queryset(self):
        return UserSession.objects.filter(
            user=self.request.user,
            is_active=True
        )


class UserSessionDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['User Sessions'])
    def get_queryset(self):
        return UserSession.objects.filter(user=self.request.user)

    @extend_schema(tags=['User Sessions'])
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
        
        # Blacklist the refresh token
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
        try:
            token = OutstandingToken.objects.get(jti=instance.refresh_token_jti)
            token.blacklisttoken_set.create()
        except OutstandingToken.DoesNotExist:
            pass


class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Authentication'])
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                from rest_framework_simplejwt.tokens import RefreshToken
                token = RefreshToken(refresh_token)
                
                # Deactivate session
                try:
                    session = UserSession.objects.get(
                        refresh_token_jti=str(token['jti'])
                    )
                    session.is_active = False
                    session.save()
                except UserSession.DoesNotExist:
                    pass
                
                token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
