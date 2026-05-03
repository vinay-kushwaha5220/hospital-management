# Hospital Management System - Deployment Guide

## ✅ Backend Deployment (Vercel)

### Step 1: Deploy Backend
1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import repository: `vinay-kushwaha5220/hospital-management`
4. **Root Directory**: `backend`
5. Click **Deploy**

### Step 2: Add Environment Variables
Go to **Settings** → **Environment Variables** and add:

```
MONGODB_URI = mongodb+srv://kushwahavinay5220_db_user:NOubds1WsfP2Gsl1@cluster0.kmnts8s.mongodb.net/hospital_db?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET = hospital_jwt_secret_key_2024_super_secure

EMAIL_USER = kushwahavinay5220@gmail.com

EMAIL_PASS = laum gobj dstc zhev

NODE_ENV = production
```

**Important:** Select **Production**, **Preview**, and **Development** for all variables.

### Step 3: Redeploy
- Go to **Deployments** tab
- Click **⋯** on latest deployment
- Click **Redeploy**

### Step 4: Note Backend URL
Your backend URL will be something like:
```
https://hospital-management-ten-pearl.vercel.app
```

---

## ✅ Frontend Deployment (Vercel)

### Step 1: Update Frontend vercel.json
Make sure `frontend/vercel.json` has:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "env": {
    "REACT_APP_API_URL": "https://hospital-management-ten-pearl.vercel.app/api"
  }
}
```

### Step 2: Deploy Frontend
1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import same repository: `vinay-kushwaha5220/hospital-management`
4. **Root Directory**: `frontend`
5. Click **Deploy**

### Step 3: Add Environment Variable (Optional)
If vercel.json doesn't work, add manually:
```
REACT_APP_API_URL = https://hospital-management-ten-pearl.vercel.app/api
```

---

## 🧪 Testing

### Test Backend
```bash
curl https://hospital-management-ten-pearl.vercel.app
# Should return: {"message":"Hospital Management API is running"}
```

### Test Registration
```bash
curl -X POST https://hospital-management-ten-pearl.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"patient"}'
# Should return: {"message":"OTP sent to test@example.com..."}
```

### Test Frontend
1. Open: https://hospital-management-99ih.vercel.app
2. Click **Register**
3. Fill form and submit
4. Should show: "OTP sent to your email!"
5. Check email for OTP

---

## 🔧 Troubleshooting

### CORS Error
- Make sure backend `vercel.json` has CORS headers
- Check backend `server.js` has `app.use(cors())`
- Redeploy both frontend and backend

### Email Not Sending
- Verify `EMAIL_USER` and `EMAIL_PASS` in backend environment variables
- Check Gmail App Password is correct (not regular password)
- Check backend logs in Vercel dashboard

### MongoDB Connection Error
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access allows `0.0.0.0/0`
- Check database name is `hospital_db`

### Frontend Shows Old API URL
- Clear browser cache
- Check `vercel.json` has correct API URL
- Redeploy frontend
- Check environment variables in Vercel dashboard

---

## 📋 Final URLs

- **Frontend**: https://hospital-management-99ih.vercel.app
- **Backend**: https://hospital-management-ten-pearl.vercel.app
- **GitHub**: https://github.com/vinay-kushwaha5220/hospital-management
