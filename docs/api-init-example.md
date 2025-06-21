# Database Initialization API

## Endpoint

`POST /api/admin/init`

## Description

Initializes the database with pre-stored data structure. This endpoint requires **Full Access** permissions (priority level 3) and **no request body** - it uses pre-configured initialization data.

## Authentication

Requires a valid JWT token with Full Access permissions in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Request Body

**No request body required.** The endpoint uses pre-stored initialization data from `src/data/init-data.ts`.

## Pre-stored Data Structure

The initialization data includes:

- **Web Configuration**: Site content, contact info, statistics, gallery items
- **Teachers**: 3 qualified IELTS teachers (Sarah Johnson, Michael Brown, John Doe)
- **Students**: Empty array (can be populated later via admin panel)
- **Gallery**: 10 educational images with proper categorization
- **Social Media**: LinkedIn, Instagram, Telegram, Facebook links
- **Contact Info**: Phone numbers, addresses, work hours

## Response

### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "message": "Database initialized successfully with pre-stored data",
    "summary": {
      "web": 1,
      "teachers": 3,
      "students": 0,
      "phones": 1,
      "icons": 4,
      "socials": 4,
      "media": 10,
      "webMedia": 10
    }
  },
  "message": "Database initialization completed"
}
```

### Error Responses

#### 405 Method Not Allowed

```json
{
  "success": false,
  "error": "Method not allowed"
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "error": "No token provided"
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

#### 409 Conflict

```json
{
  "success": false,
  "error": "Database is already initialized"
}
```

## Features

1. **Validation**: Validates the input data structure and required fields
2. **Conflict Prevention**: Prevents re-initialization if data already exists
3. **Atomic Operations**: Creates all related data in the correct order
4. **Relationship Management**: Properly links all related entities
5. **Error Handling**: Comprehensive error handling with meaningful messages
6. **Permission Control**: Requires Full Access permissions

## Usage Examples

### cURL

```bash
curl -X POST http://localhost:3000/api/admin/init \
  -H "Authorization: Bearer your-jwt-token"
```

### PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/init" -Method Post -Headers @{
    "Authorization" = "Bearer your-jwt-token"
}
```

## Notes

- This endpoint should only be used once to initialize a fresh database
- **No request body required** - uses pre-stored data from `src/data/init-data.ts`
- The endpoint creates the following entities in order:
  1. Phone numbers
  2. Icons for social media
  3. Social media links
  4. Teachers (3 pre-configured teachers)
  5. Students (empty array initially)
  6. Media for gallery (10 educational images)
  7. Web configuration
  8. Web media (gallery items)
- If students_p_uz is empty in the data, a default value will be used
- Gallery items support both "1x1" and "1x2" sizes
- To modify the initialization data, edit `src/data/init-data.ts`
