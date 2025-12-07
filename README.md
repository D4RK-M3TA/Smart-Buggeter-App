# Smart Personal Budgeter

A full-stack personal finance application with ML-powered transaction categorization, budget management, and optional bill-splitting features.

## Screenshots

<div align="center">
  <img src="screenshots/Screenshot 2025-12-08 at 00-26-02 SmartBudget - Personal Finance Manager.png" alt="SmartBudget Dashboard" width="800"/>
  <p><em>Dashboard Overview</em></p>
</div>

<div align="center">
  <img src="screenshots/Screenshot 2025-12-08 at 00-27-16 SmartBudget - Personal Finance Manager.png" alt="SmartBudget Interface" width="800"/>
  <p><em>Application Interface</em></p>
</div>

## Features

### Core Features
- **Bank Statement Upload**: Upload CSV/PDF bank statements for automatic transaction import
- **ML-Powered Categorization**: Automatic transaction categorization using TF-IDF + Logistic Regression
- **Recurring Payment Detection**: Automatically detects and tracks recurring payments
- **Budget Management**: Set category-based budgets with alerts and tracking
- **Insights & Reports**: Spending trends, top merchants, category breakdowns
- **Receipt Management**: Upload and attach receipts to transactions (S3 or local storage)
- **Export**: Export transactions and reports to CSV/Excel

### Security Features
- JWT authentication with refresh tokens
- Optional MFA (TOTP) support
- Multi-device session management
- Audit logging for sensitive actions

### Optional Features
- **Bill Splitting**: Group expense splitting with balance tracking (disabled by default)

## Tech Stack

### Backend
- Django 5.0 + Django REST Framework
- PostgreSQL
- Celery + Redis for async tasks
- AWS S3 for file storage (optional)
- scikit-learn for ML categorization

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Recharts for data visualization
- Axios for API calls

### Infrastructure
- Docker + Docker Compose
- Nginx for frontend serving
- Gunicorn for Django WSGI

## Quick Start

### Prerequisites
- Docker and Docker Compose
- (Optional) AWS credentials for S3 storage

### 1. Clone the repository
```bash
git clone <repository-url>
cd smart-budgeter
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start services
```bash
docker-compose up -d
```

### 4. Initialize database and ML model
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Initialize categories
docker-compose exec backend python manage.py init_categories

# Train initial ML model (or use the notebook)
docker-compose exec backend python -c "from ml_engine.classifier import train_initial_model; train_initial_model()"
```

### 5. Access the application
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/docs/
- Admin Panel: http://localhost:8000/admin/

## Development Setup

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
export DEBUG=True
export SECRET_KEY=your-secret-key
export PGDATABASE=budgeter
export PGUSER=postgres
export PGPASSWORD=postgres

# Run migrations
python manage.py migrate

# Run development server
python manage.py runserver
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Running Celery Workers
```bash
# In backend directory
celery -A budgeter worker --loglevel=info
celery -A budgeter beat --loglevel=info
```

## Project Structure

```
smart-budgeter/
├── backend/                 # Django backend
│   ├── accounts/           # User authentication & profiles
│   ├── transactions/       # Transaction management
│   ├── budgets/            # Budget management
│   ├── ml_engine/          # ML categorization
│   ├── billsplit/          # Bill splitting (optional)
│   ├── notifications/      # Notification system
│   ├── exports/            # Export functionality
│   └── core/               # Core utilities
├── frontend/               # React frontend
│   └── src/
│       ├── components/     # React components
│       ├── pages/          # Page components
│       └── services/        # API services
├── ml_notebooks/           # ML training notebooks
├── docs/                   # Documentation
└── docker-compose.yml      # Docker setup
```

## API Documentation

API documentation is available via Swagger UI at `/api/docs/` when the backend is running.

### Authentication
All API endpoints (except auth endpoints) require JWT authentication:
```
Authorization: Bearer <access_token>
```

### Key Endpoints
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/transactions/` - List transactions
- `POST /api/transactions/upload/` - Upload statement
- `GET /api/budgets/` - List budgets
- `GET /api/insights/` - Get spending insights

## Configuration

### Environment Variables

#### Required
- `SECRET_KEY`: Django secret key
- `PGDATABASE`, `PGUSER`, `PGPASSWORD`: PostgreSQL credentials

#### Optional
- `BILL_SPLIT_ENABLED`: Enable bill splitting (default: False)
- `USE_S3`: Use AWS S3 for file storage (default: False)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: AWS credentials
- `EMAIL_HOST`, `EMAIL_PORT`: Email configuration for notifications

### Feature Flags

#### Bill Splitting
To enable bill splitting:
```bash
export BILL_SPLIT_ENABLED=True
```
Then restart the backend service.

## ML Model Training

The ML model can be trained using the Jupyter notebook:
```bash
cd ml_notebooks
jupyter notebook train_classifier.ipynb
```

Or programmatically:
```python
from ml_engine.classifier import train_initial_model
train_initial_model()
```

The model will be saved to `backend/ml_models/transaction_classifier.joblib`.

## Deployment

See `docs/DEPLOYMENT.md` for detailed deployment instructions for:
- AWS ECS
- Azure App Service
- Simple EC2/VPS

## Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests (if configured)
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

