# Content Management System Documentation

This document describes the comprehensive content management interface for the landing page within the admin panel.

## Overview

The Content Management System allows authorized administrators to edit all landing page content through a user-friendly interface without needing to modify code. The system includes content editing, preview functionality, and automatic saving with proper validation.

## Features

### 1. **Landing Page Content Editor**
- **Hero Section**: Main heading, subtitle, call-to-action button text and links
- **About Section**: Description paragraphs, statistics/metrics, images
- **Contact Section**: Address, email, working hours, location coordinates

### 2. **Content Preview**
- Real-time preview of how the landing page will look
- Language toggle (Uzbek/English) for multilingual content
- Responsive preview layout

### 3. **Save/Publish System**
- Automatic draft saving with change detection
- Visual indicators for unsaved changes
- API integration with automatic token refresh
- Comprehensive validation and error handling

### 4. **Permission Integration**
- Requires `canModifyContent` permission (Priority 2 or higher)
- Proper authentication and authorization checks
- Graceful permission error handling

### 5. **UI/UX Features**
- Glass morphism styling consistent with admin panel design
- Full theme system support (light/dark mode)
- Loading states and error handling
- Responsive design for all screen sizes
- Intuitive tabbed interface (Editor/Preview)

## File Structure

```
src/
├── pages/
│   ├── api/admin/web/
│   │   └── index.ts                 # Web content API endpoints
│   └── admin/content/
│       ├── index.tsx                # Main content management page
│       └── Content.module.scss      # Page-specific styles
├── components/Admin/
│   ├── ContentEditor/
│   │   ├── index.tsx                # Main editor component
│   │   ├── HeroSection.tsx          # Hero section editor
│   │   ├── AboutSection.tsx         # About section editor
│   │   ├── ContactSection.tsx       # Contact section editor
│   │   ├── ContentEditor.module.scss
│   │   └── SectionEditor.module.scss
│   ├── ContentPreview/
│   │   ├── index.tsx                # Preview component
│   │   └── ContentPreview.module.scss
│   └── FormField/
│       ├── index.tsx                # Reusable form field component
│       └── FormField.module.scss
└── docs/
    └── content-management-system.md # This documentation
```

## API Endpoints

### GET /api/admin/web
- **Purpose**: Retrieve current web content
- **Permission**: Content Access or higher
- **Response**: Complete web content object with populated references

### PUT /api/admin/web
- **Purpose**: Update web content
- **Permission**: Content Access or higher
- **Validation**: Required fields, email format, numeric constraints
- **Response**: Updated web content object

## Data Structure

The system uses the existing `IWeb` interface from the database schema, which includes:

### Hero Section Fields
- `headerImg`: Header image URL
- `headerH1Uz/En`: Main heading (bilingual)
- `headerPUz/En`: Subtitle (bilingual)
- `headerButtonUz/En`: Button text (bilingual)
- `headerButtonLink`: Button destination URL

### About Section Fields
- `aboutP1Uz/En`: First paragraph (bilingual)
- `aboutP2Uz/En`: Second paragraph (bilingual)
- `aboutImg`: About section image URL
- `totalStudents`: Student count statistic
- `bestStudents`: Best students statistic
- `totalTeachers`: Teacher count statistic
- `yearsOfExperience`: Experience years statistic

### Contact Section Fields
- `email`: Contact email address
- `addressUz/En`: Address (bilingual)
- `latitude/longitude`: Map coordinates
- `workingHoursUz/En`: Working hours (bilingual)
- `website`: Website URL
- `contactFormEndpoint`: Contact form API endpoint

## Component Architecture

### ContentEditor
- **Purpose**: Main editing interface with tabbed sections
- **Features**: Section navigation, error handling, saving indicators
- **Sections**: Hero, About, Contact (Gallery and Teachers planned for future)

### FormField
- **Purpose**: Reusable form input component
- **Types**: text, email, url, number, textarea
- **Features**: Validation, theming, responsive design, accessibility

### ContentPreview
- **Purpose**: Real-time preview of landing page content
- **Features**: Language switching, responsive layout, styled preview

## Usage Guide

### For Content Managers

1. **Access**: Navigate to `/admin/content` (requires Content Manager privileges)
2. **Edit Content**: Use the Editor tab to modify content by section
3. **Preview Changes**: Switch to Preview tab to see how changes will look
4. **Save Changes**: Click "Save Changes" button when ready to publish
5. **Language Support**: All text fields support both Uzbek and English

### For Developers

1. **Adding New Sections**: Create new section components in `ContentEditor/`
2. **Extending Fields**: Add new fields to the `IWeb` interface and update forms
3. **Customizing Validation**: Modify validation rules in the API endpoint
4. **Styling Updates**: Use the existing SCSS modules and theme system

## Security Features

- **Permission-based Access**: Only users with Content Manager privileges can access
- **Input Validation**: Server-side validation for all content fields
- **XSS Protection**: Proper input sanitization and validation
- **CSRF Protection**: Uses existing authentication middleware
- **Rate Limiting**: Inherits from existing API rate limiting

## Performance Optimizations

- **Lazy Loading**: Components load only when needed
- **Debounced Saving**: Prevents excessive API calls during editing
- **Cached Content**: Uses React state management for smooth editing
- **Optimized Rendering**: Efficient re-rendering with proper dependencies

## Responsive Design

### Desktop (1200px+)
- Full-width layout with side-by-side editor sections
- Large form fields and preview areas
- Complete navigation and action buttons

### Tablet (768px - 1199px)
- Stacked layout for better readability
- Adjusted form field sizes
- Responsive grid layouts for statistics

### Mobile (< 768px)
- Single-column layout
- Touch-friendly form controls
- Simplified navigation
- Optimized preview layout

## Error Handling

### Client-Side
- Form validation with real-time feedback
- Network error handling with retry options
- Loading states for all async operations
- User-friendly error messages

### Server-Side
- Comprehensive input validation
- Database error handling
- Authentication/authorization checks
- Detailed error logging

## Future Enhancements

1. **Gallery Management**: Image upload and gallery content editing
2. **Teachers Section**: Teacher profile management interface
3. **Media Library**: Centralized media management system
4. **Content Versioning**: Track and revert content changes
5. **Bulk Operations**: Import/export content functionality
6. **Advanced Preview**: Mobile/tablet preview modes
7. **Content Scheduling**: Schedule content updates
8. **Collaboration**: Multi-user editing with conflict resolution

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure user has Content Manager privileges (Priority 2+)
2. **Save Failures**: Check network connection and server logs
3. **Preview Not Updating**: Refresh the preview tab or check for JavaScript errors
4. **Validation Errors**: Review required fields and format requirements

### Debug Mode

Enable detailed logging by adding console.log statements in:
- API endpoints for server-side debugging
- Component lifecycle methods for client-side debugging
- Form validation functions for input debugging

## Testing

The system includes comprehensive testing capabilities:

1. **Manual Testing**: Use the preview functionality to verify changes
2. **API Testing**: Test endpoints directly with tools like Postman
3. **Permission Testing**: Verify access controls with different user roles
4. **Responsive Testing**: Test on various screen sizes and devices

## Maintenance

### Regular Tasks
- Monitor API performance and error rates
- Review and update validation rules as needed
- Update documentation when adding new features
- Backup content data regularly

### Updates
- Follow semantic versioning for API changes
- Test thoroughly before deploying content updates
- Maintain backward compatibility when possible
- Document breaking changes clearly
