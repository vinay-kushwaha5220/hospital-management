# Admin Credentials

## 🔐 Default Admin Account

Use these credentials to login as admin:

```
Email: admin@hospital.com
Password: admin123456
```

## 🎯 Admin Capabilities

The admin account has full access to:

- ✅ **Dashboard** - View all statistics
- ✅ **Doctors Management** - Add, edit, delete doctors
- ✅ **Patients Management** - View, edit, delete patients
- ✅ **Appointments Management** - View all appointments, delete appointments
- ✅ **Full System Access** - Manage entire hospital system

## 🔄 Creating/Updating Admin

If you need to create or update the admin account:

```bash
# Create admin (if doesn't exist)
cd backend
node scripts/createAdmin.js

# Update admin credentials
node scripts/updateAdmin.js
```

## ⚠️ Security Note

**IMPORTANT:** Change the default password after first login in production!

## 📝 User Roles

1. **Patient** - Can register, book appointments, view their appointments
2. **Doctor** - Created by admin, can view their appointments, confirm/reschedule
3. **Admin** - Full system access (this account)

---

**Note:** Only patients can register themselves. Doctors and additional admins must be created by the admin through the system.
