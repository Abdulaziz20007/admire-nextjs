# Vercel Deployment Checklist

## ✅ **READY FOR DEPLOYMENT**

The admin panel has been fully migrated to MongoDB with all API endpoints implemented. Here's your complete deployment checklist:

## 🔧 **Pre-Deployment Setup**

### 1. **MongoDB Atlas Setup**
- [ ] Create MongoDB Atlas account (if not already done)
- [ ] Create a new cluster or use existing one
- [ ] Create database user with read/write permissions
- [ ] Whitelist Vercel IP addresses (or use 0.0.0.0/0 for all IPs)
- [ ] Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/admire`

### 2. **Environment Variables for Vercel**
Set these in your Vercel dashboard under Settings > Environment Variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/admire
MONGODB_DB=admire
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_ACCESS_TIME=1d
JWT_REFRESH_TIME=7d
COOKIE_TIME=604800000
BCRYPT_SALT=10
NODE_ENV=production
```

**Important**: Generate a strong JWT_SECRET using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚀 **Deployment Steps**

### 1. **Deploy to Vercel**
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel --prod
```

### 2. **Initialize Database**
After deployment, run the seed script to create the initial admin user:

**Option A: Using Vercel CLI**
```bash
vercel env pull .env.local
npx ts-node src/scripts/seed-admin.ts
```

**Option B: Create admin manually via MongoDB Compass/Shell**
```javascript
// Connect to your MongoDB Atlas cluster and run:
use admire;
db.admins.insertOne({
  name: "Super",
  surname: "Admin", 
  username: "admin",
  password: "$2b$10$hash_will_be_generated", // Use bcrypt to hash "admin123"
  priority: "3",
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## ✅ **What's Included & Working**

### **Complete API Coverage**
- ✅ **Authentication System**: Login, logout, refresh, verify tokens
- ✅ **Admin Management**: Full CRUD with role-based permissions
- ✅ **Message Management**: View, update, delete with permission levels
- ✅ **Teachers Management**: Complete CRUD operations
- ✅ **Students Management**: Complete CRUD operations  
- ✅ **Media Management**: Complete CRUD operations
- ✅ **Web Configuration**: Get and update site settings
- ✅ **Social Media Management**: Complete CRUD operations
- ✅ **Icons Management**: Complete CRUD operations
- ✅ **Relationship Management**: All web-* relationship endpoints
- ✅ **Public Web Endpoint**: Landing page data with security validation

### **Security Features**
- ✅ **JWT Authentication**: Access & refresh tokens
- ✅ **Role-Based Access Control**: 4-tier permission system
- ✅ **Password Encryption**: Bcrypt with configurable salt rounds
- ✅ **API Protection**: Middleware validates permissions on all routes
- ✅ **Frontend Guards**: Permission-based navigation and page protection

### **Frontend Features**
- ✅ **Admin Panel**: Complete UI with permission-based navigation
- ✅ **Authentication Flow**: Login/logout with automatic token refresh
- ✅ **Permission System**: Users see only what they have access to
- ✅ **Theme Support**: Light/dark mode with glass morphism effects
- ✅ **Responsive Design**: Works on all device sizes

## 🧪 **Testing After Deployment**

### 1. **Test Authentication**
- [ ] Visit `https://your-domain.vercel.app/admin/login`
- [ ] Login with: `admin` / `admin123`
- [ ] Verify dashboard loads correctly
- [ ] Test logout functionality

### 2. **Test Permission System**
- [ ] Create users with different priority levels (1, 2, 3)
- [ ] Verify navigation shows appropriate items for each role
- [ ] Test API endpoints with different permission levels

### 3. **Test API Endpoints**
```bash
# Test public endpoint
curl -X POST https://your-domain.vercel.app/api/web \
  -H "User-Agent: Mozilla/5.0" \
  -H "Referer: https://your-domain.vercel.app"

# Test admin login
curl -X POST https://your-domain.vercel.app/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🔒 **Security Recommendations**

### 1. **Change Default Credentials**
- [ ] Login and change the default admin password immediately
- [ ] Create additional admin users as needed
- [ ] Set appropriate permission levels for each user

### 2. **Environment Security**
- [ ] Ensure JWT_SECRET is strong and unique
- [ ] Use MongoDB Atlas IP whitelisting if possible
- [ ] Enable MongoDB Atlas audit logging

### 3. **Domain Security**
- [ ] Update the referer validation in `/api/web` to your actual domain
- [ ] Consider adding rate limiting for production use

## 📊 **Monitoring & Maintenance**

### 1. **Vercel Dashboard**
- Monitor function execution times
- Check error logs in Functions tab
- Monitor bandwidth usage

### 2. **MongoDB Atlas**
- Monitor database performance
- Set up alerts for high usage
- Regular backup verification

## 🆘 **Troubleshooting**

### Common Issues:
1. **"MongoDB connection failed"**: Check MONGODB_URI format and network access
2. **"JWT_SECRET not configured"**: Ensure environment variable is set
3. **"Admin not found"**: Run the seed script to create initial admin
4. **"Permission denied"**: Check user priority level matches required permission

### Debug Steps:
1. Check Vercel function logs
2. Verify environment variables are set
3. Test MongoDB connection separately
4. Check API responses in browser dev tools

## 🎉 **You're Ready!**

Your admin panel is now fully functional with:
- Complete MongoDB backend
- All API endpoints implemented
- Role-based security system
- Production-ready deployment

**Default Login Credentials:**
- Username: `admin`
- Password: `admin123`
- Permission Level: Super Admin (Priority 3)

**Remember to change the default password after first login!**
