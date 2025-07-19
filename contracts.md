# ProjectTest Backend Integration Contracts

## Overview
This document outlines the integration plan for converting the frontend-only ProjectTest gaming community website to a full-stack application with MongoDB backend, user authentication, and complete API integration.

## Current State Analysis

### Mock Data Currently Used
1. **User Authentication** - Frontend-only login with mock user objects
2. **Announcements** - Static list in `/src/data/mock.js` (5 announcements)
3. **User Reviews** - Static review data with ratings and comments (4 reviews)
4. **Discord Integration** - Mock Discord server data and activity
5. **Social Media Stats** - Static follower counts and links
6. **Team Members** - Static team profile data
7. **FAQ Data** - Static questions and answers
8. **Community Stats** - Hardcoded member counts and statistics

### Theme System
✅ **Already Implemented** - Complete theme system with 4 themes, localStorage persistence, no backend integration needed

## Database Schema Design

### User Model
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  avatar: String (URL or base64),
  role: String (enum: ['user', 'moderator', 'admin'], default: 'user'),
  joinDate: Date (default: now),
  lastActive: Date,
  profile: {
    bio: String,
    steamId: String,
    discordId: String,
    preferences: {
      theme: String (default: 'darkNeon'),
      notifications: Boolean (default: true)
    }
  },
  stats: {
    commentsCount: Number (default: 0),
    reviewsCount: Number (default: 0),
    reputation: Number (default: 0)
  },
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Announcement Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  content: String (required),
  type: String (enum: ['maintenance', 'tournament', 'update', 'event', 'security']),
  author: {
    id: ObjectId (ref: User),
    username: String,
    role: String
  },
  pinned: Boolean (default: false),
  tags: [String],
  metadata: {
    priority: String (enum: ['low', 'normal', 'high', 'critical']),
    category: String
  },
  engagement: {
    views: Number (default: 0),
    likes: Number (default: 0),
    comments: Number (default: 0)
  },
  isPublished: Boolean (default: true),
  publishDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Review Model
```javascript
{
  _id: ObjectId,
  user: {
    id: ObjectId (ref: User),
    username: String,
    avatar: String
  },
  rating: Number (1-5, required),
  comment: String (required),
  category: String (enum: ['general', 'servers', 'community', 'events']),
  metadata: {
    gameMode: String,
    serverName: String,
    platform: String
  },
  engagement: {
    likes: Number (default: 0),
    helpful: Number (default: 0),
    reports: Number (default: 0)
  },
  moderation: {
    isApproved: Boolean (default: true),
    moderatedBy: ObjectId (ref: User),
    moderatedAt: Date,
    moderationReason: String
  },
  isVisible: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Contact/Ticket Model
```javascript
{
  _id: ObjectId,
  ticketId: String (generated, unique),
  user: {
    name: String (required),
    email: String (required),
    userId: ObjectId (ref: User, optional)
  },
  subject: String (required),
  message: String (required),
  category: String (enum: ['general', 'technical', 'account', 'report', 'appeal', 'suggestion']),
  priority: String (enum: ['low', 'normal', 'high', 'urgent']),
  status: String (enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open'),
  assignedTo: {
    id: ObjectId (ref: User),
    username: String,
    role: String
  },
  responses: [{
    author: {
      id: ObjectId (ref: User),
      username: String,
      role: String
    },
    message: String,
    isStaffResponse: Boolean,
    createdAt: Date
  }],
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: String (default: 'website')
  },
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date
}
```

### Settings Model (Site-wide settings)
```javascript
{
  _id: ObjectId,
  key: String (unique, required),
  value: Schema.Types.Mixed,
  category: String,
  description: String,
  isPublic: Boolean (default: false),
  updatedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints Structure

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout  
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Announcement Endpoints
- `GET /api/announcements` - Get all announcements (with pagination)
- `GET /api/announcements/:id` - Get specific announcement
- `POST /api/announcements` - Create announcement (admin/moderator only)
- `PUT /api/announcements/:id` - Update announcement (admin/moderator only)
- `DELETE /api/announcements/:id` - Delete announcement (admin only)
- `POST /api/announcements/:id/like` - Like/unlike announcement
- `GET /api/announcements/pinned` - Get pinned announcements

### Review Endpoints
- `GET /api/reviews` - Get all reviews (with filtering and pagination)
- `GET /api/reviews/:id` - Get specific review
- `POST /api/reviews` - Create new review (authenticated users)
- `PUT /api/reviews/:id` - Update review (own review only)
- `DELETE /api/reviews/:id` - Delete review (own review or admin)
- `POST /api/reviews/:id/like` - Like/unlike review
- `POST /api/reviews/:id/helpful` - Mark review as helpful
- `GET /api/reviews/stats` - Get review statistics

### Contact/Support Endpoints
- `POST /api/contact/tickets` - Create new support ticket
- `GET /api/contact/tickets` - Get user's tickets (authenticated)
- `GET /api/contact/tickets/:id` - Get specific ticket details
- `POST /api/contact/tickets/:id/response` - Add response to ticket
- `PUT /api/contact/tickets/:id/status` - Update ticket status (staff only)

### User Management Endpoints
- `GET /api/users/profile/:username` - Get public user profile
- `GET /api/users/stats` - Get community statistics
- `PUT /api/users/preferences` - Update user preferences (theme, notifications)
- `GET /api/users/activity/:id` - Get user activity feed

### Settings Endpoints
- `GET /api/settings/public` - Get public site settings
- `GET /api/settings/community-stats` - Get real-time community stats
- `PUT /api/settings/:key` - Update setting (admin only)

## Authentication Implementation

### JWT Token Strategy
- Access tokens (15 minutes expiry)
- Refresh tokens (7 days expiry)
- Secure HTTP-only cookies for token storage
- Role-based access control (RBAC)

### Middleware Stack
1. **CORS** - Cross-origin resource sharing
2. **Body Parsing** - JSON and URL-encoded data
3. **Rate Limiting** - API request limits
4. **Auth Middleware** - JWT verification
5. **Role Middleware** - Permission checking
6. **Validation** - Request data validation
7. **Error Handling** - Centralized error responses

## Frontend Integration Changes

### Remove Mock Data
1. Delete `/src/data/mock.js`
2. Update all components to use API calls
3. Add loading states and error handling
4. Implement proper form submissions

### API Service Layer
Create `/src/services/api.js` with:
- Axios instance with base configuration
- Request/response interceptors
- Auth token management
- Error handling utilities
- API endpoint methods

### State Management
Implement React Context for:
- User authentication state
- Global loading states
- Error message handling
- Community statistics

### Updated Components Integration

#### Navigation Component
- Real user authentication
- Profile dropdown with user data
- Logout functionality
- Dynamic user avatar

#### HomePage Component
- Real announcements from API
- Live community statistics
- Actual Discord integration data
- Real user reviews with API data

#### Contact Page
- Submit real support tickets
- Form validation and submission
- Success/error feedback
- Ticket status tracking

#### User Profile Features
- Theme preferences saved to database
- User profile management
- Activity history
- Personal statistics

## Security Considerations

### Input Validation
- All user inputs validated and sanitized
- XSS prevention measures
- SQL injection protection (NoSQL injection for MongoDB)
- File upload restrictions

### Authentication Security
- Password hashing with bcrypt
- JWT secret management
- Rate limiting on auth endpoints
- Account lockout policies

### API Security
- Request rate limiting
- Input size limits
- CORS properly configured
- Sensitive data protection

## Database Indexing Strategy

### User Collection
- Username (unique)
- Email (unique)  
- Role + isActive (compound)
- createdAt (for statistics)

### Announcements Collection
- publishDate + isPublished (compound)
- type + pinned (compound)
- createdAt (for pagination)

### Reviews Collection
- userId + createdAt (compound)
- rating + isVisible (compound)
- createdAt (for pagination)

## Implementation Phases

### Phase 1: Core Backend Setup
1. Express.js server with MongoDB connection
2. User authentication system
3. Basic CRUD for users
4. JWT implementation

### Phase 2: Content Management
1. Announcements CRUD
2. Reviews system
3. Contact/Support tickets
4. Settings management

### Phase 3: Frontend Integration
1. Remove mock data
2. API service implementation
3. Authentication flow
4. Real-time data integration

### Phase 4: Advanced Features
1. Real-time notifications
2. Enhanced search and filtering
3. Admin dashboard
4. Advanced user profiles

## Testing Strategy

### Backend Testing
- Unit tests for models
- Integration tests for API endpoints
- Authentication flow testing
- Database operation testing

### Frontend Integration Testing
- API integration testing
- Authentication state management
- Error handling verification
- User flow testing

## Performance Optimization

### Database
- Proper indexing strategy
- Query optimization
- Connection pooling
- Caching for frequently accessed data

### API
- Response caching
- Pagination implementation
- Data compression
- Rate limiting

This comprehensive plan ensures a smooth transition from frontend-only to a full-stack application while maintaining all existing functionality and adding robust backend features.