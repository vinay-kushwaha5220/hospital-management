# Create Admin via API (Temporary Solution)

Since admin login is not working, here's a temporary solution:

## Option 1: Register Admin via Frontend

1. Go to: https://hospital-management-99ih.vercel.app/register
2. Register with:
   - Name: Hospital Admin
   - Email: admin@hospital.com  
   - Password: admin123456
   - Role: Patient (will be changed to admin)

3. Verify OTP from email

4. Then run this script to change role to admin:

```bash
cd backend
node scripts/changeUserRole.js admin@hospital.com admin
```

## Option 2: Check Vercel Environment Variables

The issue is likely that Vercel backend is NOT connected to the correct database.

**Fix:**
1. Go to Vercel Dashboard
2. Select backend project: `hospital-management-ten-pearl`
3. Settings → Environment Variables
4. Add/Update:
   ```
   MONGODB_URI = mongodb+srv://kushwahavinay5220_db_user:NOubds1WsfP2Gsl1@cluster0.kmnts8s.mongodb.net/hospital_db?retryWrites=true&w=majority&appName=Cluster0
   ```
5. Redeploy

## Option 3: Use Existing Admin

Check if any of these users can login as admin:
- vinay@yopmail.com
- jolomegi@yopmail.com  
- mytyxikus@yopmail.com

These were created earlier and have admin role.
