# Render Deployment Guide for Smart Budgeter

## Step 1: Configure Web Service

Based on your project structure, here are the correct values for the Render configuration screen:

### Configuration Fields:

1. **Language**: `Docker` ✅ (Already selected - correct!)

2. **Branch**: `main` ✅ (Already selected - correct!)

3. **Region**: `Virginia (US East)` ✅ (You can keep this or choose a region closer to your users)

4. **Root Directory**: `backend`
   - Since your project is a monorepo with separate `backend/` and `frontend/` directories, you need to set this to `backend` so Render knows where your Django application is located.

5. **Dockerfile Path**: `./Dockerfile`
   - Since you set Root Directory to `backend`, the Dockerfile path should be `./Dockerfile` (relative to the backend directory).
   - Your Dockerfile is located at `backend/Dockerfile`, so this is correct.

---

## Step 2: Environment Variables

Add the following environment variables in the Render dashboard:

### Required Environment Variables:

```
SESSION_SECRET=<generate-a-secure-random-key-here>
DEBUG=False
```

### Database Variables (PostgreSQL):

**Important**: First, create a PostgreSQL database in Render:
1. Go to Render Dashboard → "New" → "PostgreSQL"
2. Render will automatically provide these variables - copy them:

```
PGDATABASE=<from-render-postgres>
PGUSER=<from-render-postgres>
PGPASSWORD=<from-render-postgres>
PGHOST=<from-render-postgres>
PGPORT=<from-render-postgres>
```

### Redis Variables (Optional but Recommended):

**Important**: Create a Redis instance in Render:
1. Go to Render Dashboard → "New" → "Redis"
2. Copy the Redis URL:

```
REDIS_URL=<from-render-redis>
```

### Optional Environment Variables:

```
BILL_SPLIT_ENABLED=False
USE_S3=False
```

### Email Configuration (Optional):

If you want email notifications to work:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@smartbudgeter.com
```

### AWS S3 Configuration (Optional):

Only if you want to use S3 for file storage:

```
USE_S3=True
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
```

---

## Step 3: Additional Setup

### 1. Create PostgreSQL Database

Before deploying, create a PostgreSQL database:
- Go to Render Dashboard → "New" → "PostgreSQL"
- Choose a name and plan
- Copy the connection details to your environment variables

### 2. Create Redis Instance (Optional)

For Celery task queue (recommended):
- Go to Render Dashboard → "New" → "Redis"
- Copy the Redis URL to `REDIS_URL` environment variable

### 3. Run Database Migrations

After the first deployment, you may need to run migrations. You can do this by:
- Adding a one-time command in Render: `python manage.py migrate`
- Or SSH into your service and run it manually

### 4. Generate Secret Key

Generate a secure secret key for `SESSION_SECRET`:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Or use an online generator: https://djecrety.ir/

---

## Step 4: Deploy Frontend Separately

Your frontend needs to be deployed separately (e.g., on Netlify, Vercel, or Render Static Site). 

**For Netlify** (recommended):
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Environment variable: `VITE_API_URL=https://your-render-backend-url.onrender.com/api`

**For Render Static Site**:
- Root directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://your-render-backend-url.onrender.com/api`

---

## Summary Checklist

- [ ] Set Root Directory to `backend`
- [ ] Set Dockerfile Path to `./Dockerfile`
- [ ] Create PostgreSQL database in Render
- [ ] Add all database environment variables
- [ ] Create Redis instance (optional)
- [ ] Add `REDIS_URL` environment variable
- [ ] Generate and add `SESSION_SECRET`
- [ ] Set `DEBUG=False`
- [ ] Deploy the service
- [ ] Run database migrations
- [ ] Deploy frontend separately
- [ ] Update frontend `VITE_API_URL` with backend URL
- [ ] Test the application

---

## Troubleshooting

### Build fails
- Check that Root Directory is set to `backend`
- Verify Dockerfile Path is `./Dockerfile`
- Check build logs for specific errors

### Database connection errors
- Verify all PostgreSQL environment variables are set correctly
- Check that the database is created and running
- Ensure `PGHOST` includes the full hostname (not just IP)

### Application won't start
- Check application logs in Render dashboard
- Verify `SESSION_SECRET` is set
- Ensure `DEBUG=False` in production
- Check that migrations have been run

### Frontend can't connect to backend
- Verify `VITE_API_URL` in frontend deployment
- Check CORS settings (should allow all origins by default)
- Ensure backend URL is accessible via HTTPS


