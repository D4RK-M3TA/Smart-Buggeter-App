# API Documentation

Complete API documentation is available via Swagger UI at `/api/docs/` when the backend is running.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Getting Tokens

1. Register: `POST /api/auth/register/`
2. Login: `POST /api/auth/login/`
3. Refresh: `POST /api/auth/refresh/`

## Endpoints

### Authentication

#### Register
```
POST /api/auth/register/
Body: {
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "password_confirm": "password"
}
```

#### Login
```
POST /api/auth/login/
Body: {
  "email": "user@example.com",
  "password": "password",
  "otp_code": "123456"  // Required if MFA enabled
}
```

#### Refresh Token
```
POST /api/auth/refresh/
Body: {
  "refresh": "<refresh_token>"
}
```

### Transactions

#### List Transactions
```
GET /api/transactions/
Query Params:
  - start_date: YYYY-MM-DD
  - end_date: YYYY-MM-DD
  - category: UUID
  - transaction_type: debit|credit
  - is_recurring: true|false
  - min_amount: float
  - max_amount: float
  - search: string
```

#### Create Transaction
```
POST /api/transactions/
Body: {
  "date": "2024-01-15",
  "description": "Grocery Store",
  "amount": "50.00",
  "transaction_type": "debit",
  "category": "<category_uuid>",
  "notes": "Weekly groceries"
}
```

#### Upload Statement
```
POST /api/transactions/upload/
Content-Type: multipart/form-data
Body: file (CSV or PDF)
```

### Budgets

#### List Budgets
```
GET /api/budgets/
```

#### Create Budget
```
POST /api/budgets/
Body: {
  "name": "Groceries Budget",
  "category": "<category_uuid>",
  "amount": "500.00",
  "period": "monthly",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

### Insights

#### Transaction Summary
```
GET /api/transactions/summary/
Query Params:
  - start_date: YYYY-MM-DD
  - end_date: YYYY-MM-DD
```

### Notifications

#### List Notifications
```
GET /api/notifications/
Query Params:
  - is_read: true|false
  - type: notification_type
```

#### Mark as Read
```
PATCH /api/notifications/<id>/
Body: {
  "is_read": true
}
```

### Bill Splitting (if enabled)

#### List Groups
```
GET /api/billsplit/groups/
```

#### Create Group
```
POST /api/billsplit/groups/
Body: {
  "name": "Roommates",
  "description": "Shared expenses",
  "member_emails": ["user1@example.com", "user2@example.com"]
}
```

#### Create Expense
```
POST /api/billsplit/expenses/
Body: {
  "group": "<group_uuid>",
  "description": "Dinner",
  "amount": "100.00",
  "split_method": "equal",
  "date": "2024-01-15"
}
```

## Response Format

### Success Response
```json
{
  "id": "uuid",
  "field": "value"
}
```

### Error Response
```json
{
  "error": "Error message",
  "detail": "Detailed error information"
}
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Rate Limiting

API rate limiting may be configured in production. Check response headers for rate limit information.

## Postman Collection

A Postman collection is available at `docs/postman_collection.json`. Import it into Postman for easy API testing.

