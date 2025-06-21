# MongoDB Backend Setup Documentation

This document provides comprehensive information about the MongoDB backend implementation for the Admire Next.js educational institution website.

## Overview

The MongoDB backend setup includes:
- Connection management with pooling and caching for serverless environments
- Comprehensive Mongoose schemas for all data models
- TypeScript type definitions for type safety
- Utility functions for common database operations
- Example API routes demonstrating CRUD operations
- Robust error handling and validation

## File Structure

```
src/
├── db/
│   └── models.ts              # Mongoose schemas and models
├── lib/
│   ├── mongodb.ts             # Database connection utility
│   └── db-utils.ts            # Database utility functions
├── types/
│   └── database.ts            # TypeScript type definitions
└── pages/api/                 # API routes
    ├── health.ts              # Database health check
    ├── admin/
    │   └── auth.ts            # Admin authentication
    ├── teachers/
    │   ├── index.ts           # Teachers CRUD operations
    │   └── [id].ts            # Individual teacher operations
    └── content/
        └── web.ts             # Web content management
```

## Environment Configuration

### Required Environment Variables

Add these variables to your `.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/admire_education
MONGODB_DB=admire_education

# For MongoDB Atlas (cloud)
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_ACCESS_TIME=1d
JWT_REFRESH_TIME=7d
BCRYPT_SALT=10
```

### Local Development Setup

1. **Install MongoDB locally** or use MongoDB Atlas
2. **Start MongoDB service** (if using local installation)
3. **Update environment variables** in `.env`
4. **Install dependencies**: `npm install mongoose bcryptjs @types/bcryptjs`

## Data Models

### Core Models

1. **Admin** - System administrators with role-based permissions
2. **Teacher** - Teaching staff with skills and experience data
3. **Student** - Student profiles with achievement records
4. **Web** - Main site configuration and content
5. **Media** - Images and videos for gallery
6. **Message** - Contact form submissions
7. **Phone** - Contact phone numbers
8. **Social** - Social media links
9. **Icon** - Icon resources

### Model Relationships

- **Web** contains references to teachers, students, media, phones, and socials
- **WebMedia** links media items to the web configuration
- **Social** references icons for display
- **Message** tracks which admin last updated it

## API Endpoints

### Health Check
- `GET /api/health` - Check database connection status

### Authentication
- `POST /api/admin/auth` - Admin login with JWT tokens

### Teachers Management
- `GET /api/teachers` - List teachers with pagination and search
- `POST /api/teachers` - Create new teacher
- `GET /api/teachers/[id]` - Get specific teacher
- `PUT /api/teachers/[id]` - Update teacher
- `DELETE /api/teachers/[id]` - Delete teacher

### Content Management
- `GET /api/content/web` - Get site configuration
- `PUT /api/content/web` - Update site configuration
- `POST /api/content/web` - Create initial configuration

## Usage Examples

### Connecting to Database

```typescript
import connectDB from '@/lib/mongodb';

// In API routes
export default async function handler(req, res) {
  await connectDB();
  // Your API logic here
}

// Or use the withDatabase wrapper
import { withDatabase } from '@/lib/db-utils';

export default withDatabase(async (req, res) => {
  // Your API logic here
});
```

### Using Models

```typescript
import { Teacher, Student } from '@/db/models';

// Create a new teacher
const teacher = new Teacher({
  name: 'John',
  surname: 'Doe',
  about: 'Experienced English teacher',
  // ... other fields
});
await teacher.save();

// Find teachers with pagination
const teachers = await Teacher.find()
  .sort({ createdAt: -1 })
  .limit(10)
  .skip(0);
```

### Error Handling

```typescript
import { handleApiError, createSuccessResponse } from '@/lib/db-utils';

try {
  const result = await someOperation();
  return res.json(createSuccessResponse(result, 'Operation successful'));
} catch (error) {
  return handleApiError(error, res, 'Operation failed');
}
```

## Security Features

### Password Hashing
- Automatic password hashing using bcrypt
- Configurable salt rounds via environment variable
- Password comparison method on Admin model

### Input Validation
- Mongoose schema validation
- Custom validation functions
- Input sanitization utilities
- Required field validation

### Authentication
- JWT-based authentication
- HTTP-only cookies for refresh tokens
- Role-based access control (Admin priority levels)
- Secure token generation and verification

## Performance Optimizations

### Connection Management
- Connection pooling with configurable pool size
- Connection caching for serverless environments
- Automatic connection reuse
- Graceful connection handling

### Database Indexes
- Optimized indexes for common queries
- Unique indexes for usernames and emails
- Compound indexes for search functionality
- Performance monitoring capabilities

### Query Optimization
- Lean queries for better performance
- Pagination support
- Search functionality with regex
- Efficient filtering and sorting

## Error Handling

### Comprehensive Error Types
- Mongoose validation errors
- Duplicate key errors
- Cast errors (invalid ObjectIds)
- Custom application errors
- Network and connection errors

### Consistent Error Responses
- Standardized error response format
- Appropriate HTTP status codes
- Detailed error messages for development
- Sanitized error messages for production

## Testing

### Health Check Endpoint
Test database connectivity:
```bash
curl http://localhost:3000/api/health
```

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Create a teacher
curl -X POST http://localhost:3000/api/teachers \
  -H "Content-Type: application/json" \
  -d '{"name":"John","surname":"Doe",...}'

# Get teachers
curl http://localhost:3000/api/teachers?page=1&limit=10
```

## Deployment Considerations

### Production Environment
- Use MongoDB Atlas for cloud deployment
- Set appropriate connection pool sizes
- Configure proper indexes
- Enable MongoDB monitoring
- Set up backup strategies

### Environment Variables
- Use secure JWT secrets
- Configure appropriate timeouts
- Set production-ready CORS policies
- Enable SSL/TLS for database connections

## Troubleshooting

### Common Issues
1. **Connection Timeout**: Check MongoDB URI and network connectivity
2. **Authentication Failed**: Verify MongoDB credentials
3. **Schema Validation**: Check required fields and data types
4. **Memory Issues**: Adjust connection pool size

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=mongoose:*
```

## Next Steps

1. **Implement remaining API endpoints** for all models
2. **Add authentication middleware** for protected routes
3. **Set up data seeding** for initial development data
4. **Add comprehensive testing** with Jest and MongoDB Memory Server
5. **Implement caching** with Redis for better performance
6. **Add monitoring** and logging for production use
