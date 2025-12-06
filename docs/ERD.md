# Entity Relationship Diagram

## Database Schema Overview

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (UUID)       │
│ email (unique)  │
│ username        │
│ password_hash   │
│ mfa_enabled     │
│ mfa_secret      │
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│ UserPreferences  │                  │   UserSession    │
├─────────────────┤                  ├─────────────────┤
│ user_id (FK)    │                  │ id (UUID)       │
│ currency        │                  │ user_id (FK)    │
│ notifications   │                  │ device_name     │
│ budget_threshold│                  │ refresh_token   │
└─────────────────┘                  │ is_active       │
                                      └─────────────────┘

┌─────────────────┐
│    Category     │
├─────────────────┤
│ id (UUID)       │
│ name            │
│ user_id (FK)    │
│ is_system       │
│ icon            │
│ color           │
└────────┬────────┘
         │
         ├──────────────────────────────┐
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│  Transaction    │          │     Budget      │
├─────────────────┤          ├─────────────────┤
│ id (UUID)       │          │ id (UUID)       │
│ user_id (FK)    │          │ user_id (FK)    │
│ date            │          │ category_id (FK)│
│ description     │          │ amount          │
│ amount          │          │ period          │
│ type            │          │ start_date      │
│ category_id (FK)│          │ end_date        │
│ ml_category_id  │          │ is_active       │
│ ml_confidence   │          └────────┬────────┘
│ is_recurring    │                   │
│ recurring_group │                   ▼
│ notes           │          ┌─────────────────┐
│ receipt         │          │  BudgetAlert     │
│ idempotency_hash│          ├─────────────────┤
└────────┬────────┘          │ budget_id (FK)  │
         │                   │ alert_type      │
         │                   │ message         │
         │                   │ is_read         │
         │                   └─────────────────┘
         │
         ▼
┌─────────────────┐
│StatementUpload  │
├─────────────────┤
│ id (UUID)       │
│ user_id (FK)    │
│ file            │
│ status          │
│ transactions_ct │
│ file_hash       │
└─────────────────┘

┌─────────────────┐
│RecurringPattern │
├─────────────────┤
│ id (UUID)       │
│ user_id (FK)    │
│ description     │
│ merchant_name   │
│ average_amount  │
│ frequency       │
│ category_id (FK)│
│ next_expected   │
│ is_active       │
└─────────────────┘

┌─────────────────┐
│  Notification   │
├─────────────────┤
│ id (UUID)       │
│ user_id (FK)    │
│ type            │
│ title           │
│ message         │
│ is_read         │
│ metadata        │
└─────────────────┘

┌─────────────────┐
│  AuditLog       │
├─────────────────┤
│ id (UUID)       │
│ user_id (FK)    │
│ action          │
│ model_name      │
│ endpoint        │
│ ip_address      │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│     Group       │ (Bill Splitting - Optional)
├─────────────────┤
│ id (UUID)       │
│ name            │
│ created_by (FK) │
│ is_active       │
└────────┬────────┘
         │
         ├──────────────────────────────┐
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│  GroupMember    │          │  GroupExpense    │
├─────────────────┤          ├─────────────────┤
│ id (UUID)       │          │ id (UUID)        │
│ group_id (FK)   │          │ group_id (FK)   │
│ user_id (FK)    │          │ description     │
│ is_admin        │          │ amount          │
└─────────────────┘          │ paid_by (FK)    │
                             │ split_method    │
                             │ date            │
                             └────────┬────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │  ExpenseShare   │
                             ├─────────────────┤
                             │ id (UUID)       │
                             │ expense_id (FK) │
                             │ user_id (FK)    │
                             │ amount          │
                             │ is_paid         │
                             └─────────────────┘

┌─────────────────┐
│   Settlement    │ (Bill Splitting)
├─────────────────┤
│ id (UUID)       │
│ group_id (FK)   │
│ from_user (FK)  │
│ to_user (FK)    │
│ amount          │
│ is_paid         │
└─────────────────┘
```

## Key Relationships

1. **User → Transactions**: One-to-Many
2. **User → Budgets**: One-to-Many
3. **Category → Transactions**: One-to-Many
4. **Category → Budgets**: One-to-Many
5. **Transaction → StatementUpload**: Many-to-One
6. **User → UserSessions**: One-to-Many (Multi-device support)
7. **Group → GroupMembers**: One-to-Many (Bill splitting)
8. **Group → GroupExpenses**: One-to-Many (Bill splitting)
9. **GroupExpense → ExpenseShares**: One-to-Many (Bill splitting)

## Indexes

- User.email (unique)
- Transaction.idempotency_hash (unique)
- Transaction.user_id + date (for queries)
- Notification.user_id + is_read (for queries)
- UserSession.refresh_token_jti (unique)
- AuditLog.user_id + created_at (for queries)

