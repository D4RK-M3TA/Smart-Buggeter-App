from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Group, GroupMember, GroupExpense, ExpenseShare, Settlement

User = get_user_model()


class GroupMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.UUIDField(source='user.id', read_only=True)

    class Meta:
        model = GroupMember
        fields = ['id', 'user_id', 'user_email', 'is_admin', 'joined_at']


class GroupSerializer(serializers.ModelSerializer):
    members = GroupMemberSerializer(source='group_members', many=True, read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    member_count = serializers.IntegerField(source='group_members.count', read_only=True)

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'description', 'created_by', 'created_by_email',
            'members', 'member_count', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class GroupCreateSerializer(serializers.ModelSerializer):
    member_emails = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Group
        fields = ['name', 'description', 'member_emails']

    def create(self, validated_data):
        member_emails = validated_data.pop('member_emails', [])
        group = Group.objects.create(
            created_by=self.context['request'].user,
            **validated_data
        )
        
        # Add creator as admin member
        GroupMember.objects.create(
            group=group,
            user=self.context['request'].user,
            is_admin=True
        )
        
        # Add other members
        for email in member_emails:
            try:
                user = User.objects.get(email=email)
                if user != self.context['request'].user:
                    GroupMember.objects.create(group=group, user=user)
            except User.DoesNotExist:
                pass
        
        return group


class ExpenseShareSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.UUIDField(source='user.id', read_only=True)

    class Meta:
        model = ExpenseShare
        fields = [
            'id', 'user_id', 'user_email', 'amount', 'percentage',
            'is_paid', 'paid_at', 'created_at'
        ]
        read_only_fields = ['paid_at', 'created_at']


class GroupExpenseSerializer(serializers.ModelSerializer):
    paid_by_email = serializers.EmailField(source='paid_by.email', read_only=True)
    shares = ExpenseShareSerializer(many=True, read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = GroupExpense
        fields = [
            'id', 'group', 'group_name', 'description', 'amount',
            'paid_by', 'paid_by_email', 'split_method', 'date',
            'category', 'notes', 'is_settled', 'shares',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class GroupExpenseCreateSerializer(serializers.ModelSerializer):
    shares = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = GroupExpense
        fields = [
            'group', 'description', 'amount', 'split_method',
            'date', 'category', 'notes', 'shares'
        ]

    def create(self, validated_data):
        shares_data = validated_data.pop('shares', [])
        expense = GroupExpense.objects.create(
            paid_by=self.context['request'].user,
            **validated_data
        )
        
        group = expense.group
        members = group.group_members.all()
        
        if expense.split_method == 'equal':
            share_amount = expense.amount / members.count()
            for member in members:
                ExpenseShare.objects.create(
                    expense=expense,
                    user=member.user,
                    amount=share_amount
                )
        elif expense.split_method == 'percentage':
            total_percentage = sum(s.get('percentage', 0) for s in shares_data)
            if abs(total_percentage - 100) > 0.01:
                raise serializers.ValidationError('Percentages must sum to 100')
            
            for share_data in shares_data:
                user_id = share_data.get('user_id')
                percentage = share_data.get('percentage', 0)
                amount = (expense.amount * percentage) / 100
                
                try:
                    user = User.objects.get(id=user_id)
                    ExpenseShare.objects.create(
                        expense=expense,
                        user=user,
                        amount=amount,
                        percentage=percentage
                    )
                except User.DoesNotExist:
                    pass
        elif expense.split_method == 'amount':
            total_amount = sum(s.get('amount', 0) for s in shares_data)
            if abs(total_amount - expense.amount) > 0.01:
                raise serializers.ValidationError('Amounts must sum to expense total')
            
            for share_data in shares_data:
                user_id = share_data.get('user_id')
                amount = share_data.get('amount', 0)
                
                try:
                    user = User.objects.get(id=user_id)
                    ExpenseShare.objects.create(
                        expense=expense,
                        user=user,
                        amount=amount
                    )
                except User.DoesNotExist:
                    pass
        
        return expense


class SettlementSerializer(serializers.ModelSerializer):
    from_user_email = serializers.EmailField(source='from_user.email', read_only=True)
    to_user_email = serializers.EmailField(source='to_user.email', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = Settlement
        fields = [
            'id', 'group', 'group_name', 'from_user', 'from_user_email',
            'to_user', 'to_user_email', 'amount', 'is_paid', 'paid_at',
            'payment_method', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['from_user', 'created_at', 'updated_at']


class BalanceSummarySerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    user_email = serializers.EmailField()
    you_owe = serializers.DecimalField(max_digits=12, decimal_places=2)
    owed_to_you = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_balance = serializers.DecimalField(max_digits=12, decimal_places=2)

