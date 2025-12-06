from django.db.models import Q, Sum, F
from django.utils import timezone
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from .models import Group, GroupMember, GroupExpense, ExpenseShare, Settlement
from .serializers import (
    GroupSerializer, GroupCreateSerializer, GroupExpenseSerializer,
    GroupExpenseCreateSerializer, ExpenseShareSerializer, SettlementSerializer,
    BalanceSummarySerializer
)


class GroupListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GroupCreateSerializer
        return GroupSerializer

    @extend_schema(tags=['Bill Splitting'])
    def get_queryset(self):
        return Group.objects.filter(
            group_members__user=self.request.user,
            is_active=True
        ).distinct().prefetch_related('group_members__user')

    @extend_schema(tags=['Bill Splitting'])
    def perform_create(self, serializer):
        serializer.save()


class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Bill Splitting'])
    def get_queryset(self):
        return Group.objects.filter(
            group_members__user=self.request.user
        ).prefetch_related('group_members__user')

    @extend_schema(tags=['Bill Splitting'])
    def perform_update(self, serializer):
        group = self.get_object()
        member = GroupMember.objects.get(group=group, user=self.request.user)
        if not member.is_admin:
            return Response(
                {'error': 'Only group admins can update the group'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()

    @extend_schema(tags=['Bill Splitting'])
    def perform_destroy(self, instance):
        member = GroupMember.objects.get(group=instance, user=self.request.user)
        if not member.is_admin:
            return Response(
                {'error': 'Only group admins can delete the group'},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.is_active = False
        instance.save()


class GroupMemberAddView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Bill Splitting'])
    def post(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
            member = GroupMember.objects.get(group=group, user=request.user)
            if not member.is_admin:
                return Response(
                    {'error': 'Only group admins can add members'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except (Group.DoesNotExist, GroupMember.DoesNotExist):
            return Response(
                {'error': 'Group not found or you are not a member'},
                status=status.HTTP_404_NOT_FOUND
            )

        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
            GroupMember.objects.get_or_create(group=group, user=user)
            return Response({'message': 'Member added successfully'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class GroupExpenseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GroupExpenseCreateSerializer
        return GroupExpenseSerializer

    @extend_schema(tags=['Bill Splitting'])
    def get_queryset(self):
        group_id = self.request.query_params.get('group')
        queryset = GroupExpense.objects.filter(
            group__group_members__user=self.request.user
        ).select_related('group', 'paid_by', 'category').prefetch_related('shares__user')
        
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        
        return queryset.distinct()

    @extend_schema(tags=['Bill Splitting'])
    def perform_create(self, serializer):
        serializer.save()


class GroupExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GroupExpenseSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Bill Splitting'])
    def get_queryset(self):
        return GroupExpense.objects.filter(
            group__group_members__user=self.request.user
        ).select_related('group', 'paid_by', 'category').prefetch_related('shares__user')


class ExpenseShareUpdateView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Bill Splitting'])
    def patch(self, request, share_id):
        try:
            share = ExpenseShare.objects.get(
                id=share_id,
                user=request.user
            )
        except ExpenseShare.DoesNotExist:
            return Response(
                {'error': 'Share not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        is_paid = request.data.get('is_paid', False)
        share.is_paid = is_paid
        if is_paid:
            share.paid_at = timezone.now()
        else:
            share.paid_at = None
        share.save()

        # Check if all shares are paid
        expense = share.expense
        all_paid = expense.shares.exclude(id=share.id).filter(is_paid=False).count() == 0
        if all_paid and is_paid:
            expense.is_settled = True
            expense.save()

        return Response(ExpenseShareSerializer(share).data)


class BalanceView(views.APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Bill Splitting'])
    def get(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
            GroupMember.objects.get(group=group, user=request.user)
        except (Group.DoesNotExist, GroupMember.DoesNotExist):
            return Response(
                {'error': 'Group not found or you are not a member'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Calculate balances for all members
        balances = []
        members = group.group_members.all()
        
        for member in members:
            # Amount user owes (shares they haven't paid)
            you_owe = ExpenseShare.objects.filter(
                expense__group=group,
                user=member.user,
                is_paid=False
            ).aggregate(total=Sum('amount'))['total'] or 0

            # Amount owed to user (expenses they paid minus shares paid to them)
            paid_expenses = GroupExpense.objects.filter(
                group=group,
                paid_by=member.user
            ).aggregate(total=Sum('amount'))['total'] or 0

            paid_shares = ExpenseShare.objects.filter(
                expense__group=group,
                expense__paid_by=member.user,
                is_paid=True
            ).exclude(user=member.user).aggregate(total=Sum('amount'))['total'] or 0

            owed_to_you = paid_expenses - paid_shares
            net_balance = owed_to_you - you_owe

            balances.append({
                'user_id': member.user.id,
                'user_email': member.user.email,
                'you_owe': you_owe,
                'owed_to_you': owed_to_you,
                'net_balance': net_balance
            })

        return Response(balances)


class SettlementListCreateView(generics.ListCreateAPIView):
    serializer_class = SettlementSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Bill Splitting'])
    def get_queryset(self):
        group_id = self.request.query_params.get('group')
        queryset = Settlement.objects.filter(
            Q(group__group_members__user=self.request.user) &
            (Q(from_user=self.request.user) | Q(to_user=self.request.user))
        ).select_related('group', 'from_user', 'to_user')
        
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        
        return queryset.distinct()

    @extend_schema(tags=['Bill Splitting'])
    def perform_create(self, serializer):
        serializer.save(from_user=self.request.user)


class SettlementDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = SettlementSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Bill Splitting'])
    def get_queryset(self):
        return Settlement.objects.filter(
            Q(from_user=self.request.user) | Q(to_user=self.request.user)
        ).select_related('group', 'from_user', 'to_user')

    @extend_schema(tags=['Bill Splitting'])
    def patch(self, request, *args, **kwargs):
        settlement = self.get_object()
        if settlement.to_user != request.user:
            return Response(
                {'error': 'Only the recipient can mark settlement as paid'},
                status=status.HTTP_403_FORBIDDEN
            )

        is_paid = request.data.get('is_paid', False)
        settlement.is_paid = is_paid
        if is_paid:
            settlement.paid_at = timezone.now()
        else:
            settlement.paid_at = None
        settlement.save()

        return Response(SettlementSerializer(settlement).data)

