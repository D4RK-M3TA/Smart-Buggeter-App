# Deploy Frontend on Render - Step by Step Guide

## Prerequisites
- Backend already deployed on Render (e.g., `https://smart-buggeter-app.onrender.com`)
- GitHub repository connected to Render

## Step 1: Create New Web Service for Frontend

1. Go to your Render Dashboard
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository: `D4RK-M3TA/Smart-Buggeter-App`
4. Select **"Docker"** as the environment

## Step 2: Configure Service Settings

Fill in these values in the Render configuration:

| Field | Value |
|-------|-------|
| **Name** | `smart-budgeter-frontend` (or your preferred name) |
| **Region** | `Virginia (US East)` (or same as backend) |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Dockerfile Path** | `Dockerfile` |
| **Docker Build Context Directory** | `.` |
| **Docker Command** | (leave empty - nginx starts automatically) |

## Step 3: Environment Variables

Add this environment variable in the Render dashboard:

### Required Variable:

```
VITE_API_URL=https://smart-buggeter-app.onrender.com/api
```

**Important**: Replace `smart-buggeter-app.onrender.com` with your actual backend URL!

### How to Add:
1. In your Web Service page, scroll down to **"Environment"** section
2. Click **"Add Environment Variable"**
3. Enter **Key**: `VITE_API_URL`
4. Enter **Value**: `https://YOUR-BACKEND-URL.onrender.com/api`
5. Click **"Save Changes"**

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy your frontend
3. Wait for deployment to complete (usually 3-5 minutes)

## Step 5: Access Your Application

Once deployed, you'll get a URL like:
```
https://smart-budgeter-frontend.onrender.com
```

Visit this URL to see your full application!

## Important Notes

- **CORS**: Make sure your backend has CORS configured to allow requests from your frontend domain
- **Environment Variable**: The `VITE_API_URL` must be set at **build time** (not runtime) for Vite apps
- **Backend URL**: Always use your backend's Render URL, not `localhost`

## Troubleshooting

### Frontend can't connect to backend
- Check that `VITE_API_URL` is set correctly
- Verify your backend URL is accessible
- Check browser console for CORS errors
- Ensure backend CORS settings allow your frontend domain

### Build fails
- Check that Root Directory is set to `frontend`
- Verify Dockerfile exists in `frontend/` directory
- Check build logs for specific errors

### 404 errors on page refresh
- This is normal for SPAs - nginx is configured to handle this
- If issues persist, check nginx.conf configuration

## Summary Checklist

- [ ] Created new Web Service in Render
- [ ] Set Root Directory: `frontend`
- [ ] Set Dockerfile Path: `Dockerfile`
- [ ] Set Docker Build Context Directory: `.`
- [ ] Added `VITE_API_URL` environment variable with your backend URL
- [ ] Deployed successfully
- [ ] Tested frontend can connect to backend API
