# MongoDB Migration Guide

## Overview

The admin panel has been successfully migrated from local data storage to MongoDB with comprehensive API endpoints and role-based access control.

## Migration Summary

### ✅ Phase 1: Removed Local Backend Infrastructure

- Removed localStorage-based authentication from `useAuth` hook
- Eliminated mock data from admin components
- Cleaned up client-side credential validation

### ✅ Phase 2: Enhanced MongoDB Integration

- Verified existing MongoDB schemas and models
- Ensured production-ready error handling
- Confirmed proper connection pooling

### ✅ Phase 3: Implemented API Endpoints

- Created all endpoints as specified in `api-endpoints.txt`
- Added authentication middleware with JWT tokens
- Implemented proper request validation and error responses

### ✅ Phase 4: Role-Based Access Control

- Implemented hierarchical admin permission system
- Created permission middleware for API routes
- Added frontend permission guards

### ✅ Phase 5: Frontend Migration

- Updated `useAuth` hook to use MongoDB APIs
- Added permission-based navigation filtering
- Implemented PermissionGuard component for page protection

## Permission System

### Priority Levels

- **Priority 0 (Blocked)**: No access to admin panel
- **Priority 1 (Messages Only)**: Can access messages section and toggle `is_checked` status
- **Priority 2 (Content Manager)**: Inherits Priority 1 + can modify content + delete messages
- **Priority 3 (Super Admin)**: Inherits Priority 1 & 2 + can manage other admins

### Permission Implementation

- **API Level**: Middleware checks admin priority before allowing access
- **Frontend Level**: Navigation items filtered based on permissions
- **Page Level**: PermissionGuard component protects individual pages

## API Endpoints

### Authentication

- `POST /api/admin/auth` - Login with username/password
- `GET /api/admin/logout` - Logout (clears refresh token)
- `GET /api/admin/refresh` - Refresh access token
- `GET /api/admin/verify` - Verify token and get admin data

### Admin Management (Super Admin only)

- `GET /api/admin/admins` - List all admins with pagination
- `POST /api/admin/admins` - Create new admin
- `GET /api/admin/admins/[id]` - Get specific admin
- `PUT /api/admin/admins/[id]` - Update admin
- `DELETE /api/admin/admins/[id]` - Delete admin

### Messages (Message Access or higher)

- `GET /api/admin/messages` - List messages with pagination
- `GET /api/admin/messages/[id]` - Get specific message
- `PUT /api/admin/messages/[id]` - Update message (is_checked: Message Access, others: Content Access)
- `DELETE /api/admin/messages/[id]` - Delete message (Content Access or higher)

### Teachers Management (Content Access or higher)

- `GET /api/admin/teachers` - List all teachers with pagination
- `POST /api/admin/teachers` - Create new teacher
- `GET /api/admin/teachers/[id]` - Get specific teacher
- `PUT /api/admin/teachers/[id]` - Update teacher
- `DELETE /api/admin/teachers/[id]` - Delete teacher

### Students Management (Content Access or higher)

- `GET /api/admin/students` - List all students with pagination
- `POST /api/admin/students` - Create new student
- `GET /api/admin/students/[id]` - Get specific student
- `PUT /api/admin/students/[id]` - Update student
- `DELETE /api/admin/students/[id]` - Delete student

### Media Management (Content Access or higher)

- `GET /api/admin/media` - List all media with pagination
- `POST /api/admin/media` - Create new media
- `GET /api/admin/media/[id]` - Get specific media
- `PUT /api/admin/media/[id]` - Update media
- `DELETE /api/admin/media/[id]` - Delete media

### Web Configuration (Content Access or higher)

- `GET /api/admin/web` - Get web configuration
- `PUT /api/admin/web` - Update web configuration

### Social Media Management (Content Access or higher)

- `GET /api/admin/socials` - List all social media links
- `POST /api/admin/socials` - Create new social media link
- `GET /api/admin/socials/[id]` - Get specific social media link
- `PUT /api/admin/socials/[id]` - Update social media link
- `DELETE /api/admin/socials/[id]` - Delete social media link

### Icons Management (Content Access or higher)

- `GET /api/admin/icons` - List all icons
- `POST /api/admin/icons` - Create new icon
- `GET /api/admin/icons/[id]` - Get specific icon
- `PUT /api/admin/icons/[id]` - Update icon
- `DELETE /api/admin/icons/[id]` - Delete icon

### Relationship Endpoints (Content Access or higher)

- `GET /api/admin/web-phones` - List web-phone relationships
- `POST /api/admin/web-phones` - Create web-phone relationship
- `GET /api/admin/web-phones/[id]` - Get specific web-phone relationship
- `PUT /api/admin/web-phones/[id]` - Update web-phone relationship
- `DELETE /api/admin/web-phones/[id]` - Delete web-phone relationship

- `GET /api/admin/web-media` - List web-media relationships
- `POST /api/admin/web-media` - Create web-media relationship
- `GET /api/admin/web-media/[id]` - Get specific web-media relationship
- `PUT /api/admin/web-media/[id]` - Update web-media relationship
- `DELETE /api/admin/web-media/[id]` - Delete web-media relationship

- `GET /api/admin/web-students` - List web-student relationships
- `POST /api/admin/web-students` - Create web-student relationship
- `DELETE /api/admin/web-students/[id]` - Delete web-student relationship

- `GET /api/admin/web-teachers` - List web-teacher relationships
- `POST /api/admin/web-teachers` - Create web-teacher relationship
- `DELETE /api/admin/web-teachers/[id]` - Delete web-teacher relationship

- `GET /api/admin/web-socials` - List web-social relationships
- `POST /api/admin/web-socials` - Create web-social relationship
- `DELETE /api/admin/web-socials/[id]` - Delete web-social relationship

### Public Endpoint

- `POST /api/web` - Get all landing page data (browser + referer validation)

## Setup Instructions

### 1. Environment Variables

Ensure these variables are set in your `.env` file:

```
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=admire
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_TIME=1d
JWT_REFRESH_TIME=7d
COOKIE_TIME=604800000
BCRYPT_SALT=10
```

### 2. Create Initial Admin User

Run the seed script to create the first admin:

```bash
npx ts-node src/scripts/seed-admin.ts
```

Default credentials:

- Username: `admin`
- Password: `admin123`
- Priority: `3` (Super Admin)

**⚠️ Change the default password after first login!**

### 3. Database Connection

The system uses connection pooling and caching for optimal performance in serverless environments.

## Security Features

### JWT Authentication

- Access tokens (short-lived, 1 day default)
- Refresh tokens (longer-lived, 7 days default, HTTP-only cookies)
- Automatic token refresh on API calls

### Password Security

- Bcrypt hashing with configurable salt rounds
- Password validation on login

### Permission Enforcement

- API middleware validates permissions before processing requests
- Frontend components respect permission levels
- Automatic redirects for insufficient permissions

## Frontend Components

### New Components

- `PermissionGuard` - Protects pages based on required permissions
- `usePermissions` hook - Provides permission checking utilities

### Updated Components

- `useAuth` - Now uses MongoDB APIs instead of localStorage
- `AdminSidebar` - Filters navigation based on user permissions
- All admin pages - Protected with PermissionGuard

## Error Handling

### API Responses

All API endpoints return consistent JSON responses:

```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}
```

### Frontend Error Handling

- Network errors handled gracefully
- Permission errors show appropriate messages
- Loading states during authentication checks

## Testing

### Manual Testing Steps

1. Create admin users with different priority levels
2. Test login/logout functionality
3. Verify permission-based navigation
4. Test API endpoints with different user roles
5. Verify token refresh mechanism

### API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Login
curl -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Access protected endpoint
curl -X GET http://localhost:3000/api/admin/admins \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection**: Verify MONGODB_URI is correct
2. **JWT Errors**: Ensure JWT_SECRET is set and consistent
3. **Permission Denied**: Check user priority level matches required permission
4. **Token Expired**: Refresh token should automatically handle this

### Logs

Check console logs for detailed error messages and connection status.

## Next Steps

1. **Change Default Password**: Update the default admin password
2. **Create Additional Admins**: Add users with appropriate permission levels
3. **Implement Remaining Endpoints**: Add other API endpoints as needed
4. **Add Content Management**: Build out the content management functionality
5. **Add Message Management**: Implement message viewing and management features
