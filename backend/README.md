# Delegation & DWR Management System - Backend

A comprehensive Node.js/Express backend for managing delegations, daily work reports (DWR), tasks, events, and employee performance.

## Prerequisites

- **Node.js** v16+
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

## Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env` and update with your MongoDB URI and other settings
   - Key variables:
     - `MONGODB_URI` - MongoDB connection string
     - `JWT_SECRET` - Secret key for JWT tokens
     - `PORT` - Server port (default: 5000)

3. **Start the server:**

   ```bash
   npm start       # Production mode
   npm run dev     # Development mode (requires nodemon)
   ```

   The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin/HR only)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/location` - Update user location

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user (Admin/HR)
- `DELETE /api/users/:id` - Delete user (Admin)
- `GET /api/users/:id/team` - Get team members

### Tasks

- `GET /api/tasks` - Get tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Daily Work Reports (DWR)

- `GET /api/dwr` - Get DWRs
- `POST /api/dwr` - Submit DWR
- `GET /api/dwr/:id` - Get single DWR
- `PUT /api/dwr/:id` - Update DWR

### Attendance

- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/:id` - Get single attendance

### Events

- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get single event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Performance

- `GET /api/performance` - Get performance data
- `PUT /api/performance/:userId` - Update performance

### Notifications

- `GET /api/notifications` - Get notifications
- `GET /api/notifications/:id` - Get single notification
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Activity Logs

- `GET /api/activity` - Get activity logs
- `GET /api/activity/:id` - Get single activity

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/user/:userId` - Get user statistics

## Health Check

- `GET /api/health` - API health status

## Project Structure

```
backend/
├── controllers/          # Controller functions (route handlers)
├── db/                  # Database configuration
├── middleware/          # Authentication & error handling
├── models/              # Mongoose schemas
├── routes/              # Express route definitions
├── utils/               # Utility functions & cron jobs
├── .env                 # Environment variables
├── server.js            # Express app setup
└── package.json         # Dependencies
```

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **cors** - CORS middleware
- **helmet** - Security headers
- **morgan** - HTTP request logging
- **express-rate-limit** - Rate limiting
- **dotenv** - Environment variable management

## Development

To enable hot reload during development:

```bash
npm install -D nodemon
npm run dev
```

## Notes

- All timestamps are in UTC
- JWT tokens expire after 7 days (configurable)
- Role-based access control (Admin, HR, Manager, Sales Executive, Coordinator)
- Password hashing using bcryptjs
- Comprehensive activity logging
- Attendance tracking with automatic login/logout

## Security

- JWT-based authentication
- Password encryption with bcryptjs
- Rate limiting on API endpoints
- CORS configuration
- Helmet for security headers
- Input validation on all routes

## Future Enhancements

- Email notifications
- Real-time updates (WebSocket)
- Advanced reporting
- Mobile app integration
- Analytics dashboard
