# Smart Personal Budgeter

## Overview
A full-stack personal finance management application with ML-powered transaction categorization. Built with Django REST Framework backend and React frontend.

## Architecture

### Backend (Django + DRF)
- **accounts/**: User authentication, JWT tokens, TOTP MFA
- **transactions/**: Transaction management, CSV/PDF parsing, recurring detection
- **budgets/**: Budget tracking, alerts, monthly reports
- **ml_engine/**: TF-IDF + Logistic Regression transaction classifier
- **exports/**: CSV, Excel, and PDF export functionality
- **core/**: Audit logging, middleware, system configuration

### Frontend (React + Vite)
- **pages/**: Dashboard, Transactions, Budgets, Upload, Settings
- **components/**: Layout, shared UI components
- **services/**: API client with axios
- **contexts/**: Auth state management

### Database
- PostgreSQL with Django ORM
- Models: User, Transaction, Category, Budget, BudgetAlert, AuditLog, etc.

## Key Features
1. JWT authentication with refresh tokens
2. Optional TOTP-based MFA
3. Bank statement upload (CSV/PDF) with idempotent parsing
4. ML auto-categorization of transactions
5. Recurring payment detection
6. Budget management with overspend alerts
7. Export to CSV, Excel, and PDF

## Running the Application
- Frontend: `npm run dev` in /frontend (port 5000)
- Backend: `python manage.py runserver 0.0.0.0:8000`
- Celery: `celery -A budgeter worker -l info`

## API Documentation
- Swagger UI: `/api/docs/`
- ReDoc: `/api/redoc/`
- OpenAPI Schema: `/api/schema/`

## Environment Variables
- DATABASE_URL: PostgreSQL connection string
- SESSION_SECRET: Django secret key
- REDIS_URL: Redis connection for Celery (optional)

## Recent Changes
- Initial project setup (December 2024)
- Full Django backend with DRF APIs
- React frontend with dashboard and charts
- ML transaction classifier with TF-IDF
