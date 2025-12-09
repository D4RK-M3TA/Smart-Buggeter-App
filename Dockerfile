FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy backend project
COPY backend/ .

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/media /app/ml_models

# Collect static files (will be run again in docker-compose)
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["gunicorn", "budgeter.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
