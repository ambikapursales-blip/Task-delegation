# 🎯 DELEGATION & PERFORMANCE MANAGEMENT SYSTEM

## Complete Project Functionality Overview

**Project Type:** Full-Stack Web Application  
**Backend:** Node.js + Express.js + MongoDB  
**Frontend:** Next.js + React + Tailwind CSS  
**Deployment:** Cloud-ready (MongoDB Atlas)

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Core Modules](#core-modules)
3. [User Roles & Access](#user-roles--access)
4. [Data Models](#data-models)
5. [API Endpoints](#api-endpoints)
6. [Key Workflows](#key-workflows)
7. [Background Jobs](#background-jobs)
8. [Technical Architecture](#technical-architecture)
9. [Security Features](#security-features)

---

## 🏗️ SYSTEM OVERVIEW

This is an **Enterprise Delegation & Performance Management System** that enables:

- **Task Management:** Create, assign, track recurring and one-time tasks
- **Daily Accountability:** Employees submit daily work reports (DWR) with manager approval
- **Attendance Tracking:** Automatic login/logout with GPS location logging
- **Performance Metrics:** Real-time performance scoring with A+-F grades
- **Team Oversight:** Managers monitor team productivity and performance
- **Compliance Audit Trail:** Complete activity logging for accountability
- **Event Management:** Schedule meetings, trainings, team building events
- **Analytics & Reporting:** Comprehensive reports on tasks, attendance, performance

---

## 📦 CORE MODULES

### 1. 👤 USER MANAGEMENT

**Purpose:** Manage users, roles, permissions, and team hierarchy

**Features:**

- Multi-role system (Admin, HR, Manager, Sales Executive, Coordinator, IT)
- User profiles with department, location, performance score
- Manager hierarchy for team organization
- Password reset capability
- Last login tracking

**Data Stored:**

- Name, email, password (bcrypt hashed)
- Role, department, phone, avatar
- Employee ID, manager reference
- Performance score, grade (A+ to F)
- Join date, active status
- Location (lat/lng/address)

---

### 2. 📋 TASK MANAGEMENT

**Purpose:** Create, assign, track tasks with support for recurring tasks

**Features:**

- Create single or recurring tasks (Daily/Weekly/Biweekly/Monthly)
- Priority levels: Low, Medium, High, Critical
- Status tracking: Pending → In Progress → Completed (or Cancelled/On Hold)
- Bulk task creation and assignment
- Task reassignment and escalation
- Comments and discussion threads
- Time tracking: Estimated hours vs actual hours
- Overdue task detection
- Task history and status change tracking
- Attachments support

**Recurring Task Automation:**

- Parent task creates child instances automatically
- Cron job runs nightly at 2 AM to generate instances
- Automatic generation on task completion
- Ends when recurrence end date is reached
- Full audit trail of all instances

**Data Stored:**

- Title, description, priority, status
- Deadline, assigned users, assigning manager
- Department, tags, attachments
- Estimated/actual hours, remarks
- Comments thread with user discussions
- Recurrence pattern, frequency, end date
- Parent task reference (for child tasks)
- Completed timestamp

---

### 3. 📝 DAILY WORK REPORT (DWR)

**Purpose:** Track daily employee productivity and accountability

**Features:**

- Employees submit daily summaries of work
- List completed tasks with hours spent
- List pending tasks with reasons for delay
- Write work summary and challenges
- Document next day's plan
- Automatic location tracking
- Late submission tracking (after 8 PM)
- Manager review and approval workflow
- Approval/rejection with feedback
- Performance scoring integration

**DWR Structure:**

```
- Date
- Completed Tasks (array with task IDs and hours)
- Pending Tasks (array with reasons and estimated completion)
- Work Summary (text)
- Challenges/Blockers (text)
- Next Day Plan (text)
- Location (lat/lng/address)
- Submission Time
- Late Flag (if submitted after 8 PM)
- Review Status: Pending Review / Approved / Rejected
- Manager Note (optional feedback)
```

**Manager Review Process:**

- View pending DWRs in queue
- Read employee's daily report
- Check for late submissions
- Approve/Reject with feedback
- Auto-updates employee performance score

---

### 4. 🕐 ATTENDANCE TRACKING

**Purpose:** Monitor employee work hours and location

**Features:**

- Automatic login/logout tracking
- Manual attendance override capability
- Working hours calculation
- Location tracking (GPS coordinates & address)
- IP address and device information logging
- Attendance status: Present, Absent, Leave, Holiday
- Remarks field for notes
- Attendance reports and analytics

**Data Tracked:**

- Login time, logout time
- Working hours calculated
- Date, location
- IP address, device info
- Remarks, status

---

### 5. 📅 EVENT MANAGEMENT

**Purpose:** Schedule and manage meetings, trainings, events

**Features:**

- Create events: Meetings, Training, Workshop, Conference, Team Building
- Virtual event support with meeting links
- Set event location and schedule
- Assign employees to events
- RSVP tracking per employee
- Employee remarks/feedback
- Event status: Upcoming, Ongoing, Completed, Cancelled
- Priority tagging

**Event Data:**

- Title, description, type
- Start date, end date, location
- Virtual meeting link
- Assigned employees with RSVP status
- Created by (manager)
- Priority, tags, attachments

---

### 6. ⭐ PERFORMANCE TRACKING

**Purpose:** Monitor and rank employee performance

**Features:**

- Performance scoring based on:
  - Task completion rate
  - On-time completion percentage
  - Task priority weighted scoring
- Grade system: A+, A, B+, B, C+, C, D, F
- Performance leaderboard (ranked by department)
- Employee comparison metrics
- Performance trends over time
- Real-time score updates

**Scoring Logic:**

- Completed tasks add points
- Late completions deduct points
- Priority level weighted (Critical > High > Medium > Low)
- Recalculated on DWR approval

---

### 7. 🔔 NOTIFICATIONS

**Purpose:** Keep users informed of important actions

**Types of Notifications:**

- **Task Assigned** → Sent to assigned employee
- **DWR Submitted** → Sent to manager for review
- **DWR Approved/Rejected** → Sent to employee with feedback
- **Performance Updated** → Sent when score/grade changes
- **Task Escalated** → Sent to assigned employee about priority increase
- **Task Reassigned** → Sent to both old and new assignee

**Notification Features:**

- Read/unread status tracking
- Action URLs for quick navigation
- Priority levels
- Sender information
- Entity references (linked to Task/DWR/etc)

---

### 8. 📍 ACTIVITY LOGGING

**Purpose:** Complete audit trail of all system activities

**Activity Types Logged:**

- User login/logout
- Task creation/update/completion/deletion
- DWR submission/approval/rejection
- Event creation/participation
- Performance score updates
- User role changes
- Attendance changes

**Data Captured:**

- User who performed action
- Action type/description
- Entity ID and type (Task, DWR, Event, etc)
- Timestamp
- IP address
- User agent/device info
- Metadata (additional context)

---

### 9. 📊 REPORTS & ANALYTICS

**Purpose:** Provide insights into organizational performance

**Report Types:**

#### Task Report

- Total tasks created/completed
- Task completion rate (%)
- Overdue tasks count
- Tasks by priority
- Tasks by department
- Completion time statistics

#### DWR Report

- Daily submission rate (%)
- Late submission percentage
- Approval rate (%)
- Average tasks completed per day
- Common challenges identified
- Trend analysis

#### Attendance Report

- Total working hours by employee
- Attendance percentage
- Leave usage
- Average daily hours
- Location patterns
- Device/IP changes

#### Performance Report

- Employee rankings
- Performance trends (30/60/90 days)
- Grade distribution
- Top/bottom performers
- Department comparisons
- Performance improvement tracking

#### Activity Report

- User activity timeline
- Action frequency analysis
- Peak activity times
- IP address tracking
- Device usage patterns
- Security audit trail

---

## 👥 USER ROLES & ACCESS

### Role Hierarchy & Permissions

| Role            | Dashboard     | Tasks       | DWR           | Events           | Attendance   | Team        | Performance | Reports | Users        | Notes          |
| --------------- | ------------- | ----------- | ------------- | ---------------- | ------------ | ----------- | ----------- | ------- | ------------ | -------------- |
| **Admin**       | ✅ Full       | ✅ All      | ✅ Review All | ✅ Create/Manage | ✅ All       | ✅ All      | ✅ Full     | ✅ Full | ✅ Manage    | Super user     |
| **HR**          | ✅ Full       | ✅ All      | ✅ Review All | ✅ Create/Manage | ✅ All       | ✅ All      | ✅ Full     | ✅ Full | ❌ No Delete | HR functions   |
| **Manager**     | ✅ Team Stats | ✅ Own+Team | ✅ Team Only  | ✅ Create/Manage | ✅ Team Only | ✅ Own Team | ✅ Team     | ✅ Team | ❌ Limited   | Team lead      |
| **Sales Exec**  | ✅ Own        | ✅ Own      | ✅ Own        | ✅ View/RSVP     | ✅ Own       | ❌ No       | ✅ Own      | ❌ No   | ❌ No        | Individual     |
| **Coordinator** | ✅ Own        | ✅ Own      | ✅ Own        | ✅ View/RSVP     | ✅ Own       | ❌ No       | ✅ Own      | ❌ No   | ❌ No        | Support staff  |
| **IT**          | ✅ Own        | ❌ No       | ❌ No         | ✅ View/RSVP     | ✅ Own       | ❌ No       | ✅ Own      | ❌ No   | ❌ No        | Limited access |

### Access Control

- **Frontend:** Protected routes check user role before rendering
- **Backend:** All API routes require JWT authentication + role authorization
- **Middleware:**
  - `auth.js` - Verifies JWT token
  - `authorize.js` - Checks role permissions
  - `errorHandler.js` - Catches and formats errors

---

## 💾 DATA MODELS

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  role: Enum ['ADMIN', 'HR', 'MANAGER', 'SALES_EXEC', 'COORDINATOR', 'IT'],
  department: String,
  phone: String,
  avatar: String,
  employeeId: String,
  managerId: ObjectId (ref: User),
  isActive: Boolean,
  lastLogin: Date,
  lastActive: Date,
  location: { lat, lng, address },
  performanceScore: Number,
  grade: String,
  joinDate: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model

```javascript
{
  title: String,
  description: String,
  priority: Enum ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  status: Enum ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'],
  deadline: Date,
  assignedTo: [ObjectId] (refs: User),
  assignedBy: ObjectId (ref: User),
  department: String,
  tags: [String],
  attachments: [String],
  completedAt: Date,
  remarks: String,
  isOverdue: Boolean,
  estimatedHours: Number,
  actualHours: Number,
  comments: [{
    user: ObjectId (ref: User),
    text: String,
    createdAt: Date
  }],
  history: [{
    status: String,
    changedAt: Date,
    changedBy: ObjectId (ref: User)
  }],
  isRecurring: Boolean,
  recurrencePattern: {
    frequency: Enum ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'],
    interval: Number,
    daysOfWeek: [Number],
    endDate: Date
  },
  parentTaskId: ObjectId (ref: Task),
  lastGeneratedDate: Date,
  nextOccurrenceDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### DWR Model

```javascript
{
  employee: ObjectId (ref: User),
  date: Date,
  completedTasks: [{
    taskId: ObjectId (ref: Task),
    hoursSpent: Number
  }],
  pendingTasks: [{
    taskId: ObjectId (ref: Task),
    reason: String,
    estimatedCompletion: Date
  }],
  workSummary: String,
  challenges: String,
  nextDayPlan: String,
  totalHoursWorked: Number,
  submittedAt: Date,
  isLate: Boolean (submitted after 8 PM),
  reviewedBy: ObjectId (ref: User),
  reviewNote: String,
  reviewStatus: Enum ['PENDING_REVIEW', 'APPROVED', 'REJECTED'],
  location: { lat, lng, address },
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Model

```javascript
{
  employee: ObjectId (ref: User),
  date: Date,
  loginTime: Time,
  logoutTime: Time,
  status: Enum ['PRESENT', 'ABSENT', 'LEAVE', 'HOLIDAY'],
  workingHours: Number,
  remarks: String,
  location: { lat, lng, address },
  ipAddress: String,
  deviceInfo: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Event Model

```javascript
{
  title: String,
  description: String,
  type: Enum ['MEETING', 'TRAINING', 'WORKSHOP', 'CONFERENCE', 'TEAM_BUILDING', 'OTHER'],
  startDate: Date,
  endDate: Date,
  location: String,
  isVirtual: Boolean,
  meetingLink: String,
  createdBy: ObjectId (ref: User),
  assignedTo: [{
    employee: ObjectId (ref: User),
    status: Enum ['PENDING', 'ATTENDING', 'NOT_ATTENDING', 'MAYBE'],
    remarks: String
  }],
  status: Enum ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
  priority: String,
  tags: [String],
  attachments: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Activity Model

```javascript
{
  user: ObjectId (ref: User),
  type: String (login, logout, task_created, dwr_submitted, etc),
  description: String,
  metadata: Mixed,
  entityId: ObjectId,
  entityType: Enum ['TASK', 'DWR', 'EVENT', 'USER', 'ATTENDANCE', 'PERFORMANCE'],
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

### Notification Model

```javascript
{
  recipient: ObjectId (ref: User),
  sender: ObjectId (ref: User),
  type: String (task_assigned, dwr_reminder, etc),
  title: String,
  message: String,
  data: Mixed,
  entityId: ObjectId,
  entityType: String,
  isRead: Boolean,
  readAt: Date,
  actionUrl: String,
  priority: Enum ['LOW', 'MEDIUM', 'HIGH'],
  createdAt: Date
}
```

---

## 🔗 API ENDPOINTS

### Authentication Routes (`/api/auth`)

- `POST /login` - Login with email/password → Returns JWT token
- `POST /register` - Create new user (Admin only)
- `GET /me` - Get current user profile
- `POST /logout` - Logout and record logout time
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /location` - Update current location

### Task Routes (`/api/tasks`)

- `GET /` - List tasks (filters: status, priority, assignedTo, search, overdue)
- `GET /stats` - Get task statistics
- `POST /` - Create new task (supports recurring)
- `GET /:id` - Get single task
- `PUT /:id` - Update task
- `DELETE /:id` - Delete task
- `POST /bulk` - Create multiple tasks at once
- `POST /bulk-assign` - Assign tasks to multiple users
- `PUT /:id/reassign` - Reassign task to different user
- `PUT /:id/escalate` - Escalate task priority
- `POST /:id/comments` - Add comment to task

### DWR Routes (`/api/dwr`)

- `GET /` - List user's DWRs
- `POST /` - Submit new DWR
- `GET /:id` - Get single DWR
- `PUT /:id` - Update DWR
- `GET /pending-review` - Get DWRs awaiting review (Manager/HR/Admin)
- `PUT /:id/approve` - Approve DWR with optional note
- `PUT /:id/reject` - Reject DWR with feedback

### Attendance Routes (`/api/attendance`)

- `GET /` - List attendance records (filters available)
- `POST /` - Mark attendance (login/logout)
- `GET /:id` - Get single attendance record

### Event Routes (`/api/events`)

- `GET /` - List all events
- `POST /` - Create new event
- `GET /:id` - Get single event
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event
- `PUT /:id/rsvp` - Update RSVP status

### Team Routes (`/api/team`)

- `GET /members` - Get team members (filtered by manager)
- `GET /stats` - Get team statistics
- `GET /:userId/tasks` - Get employee's assigned tasks
- `GET /:userId/activity` - Get employee's activity log
- `GET /:userId/dwr` - Get employee's DWR submissions
- `GET /:userId/performance` - Get employee's performance data

### Performance Routes (`/api/performance`)

- `GET /` - List performance data
- `PUT /:userId` - Update performance score
- `GET /leaderboard` - Get performance leaderboard
- `GET /compare` - Compare multiple employees
- `GET /:userId/trends` - Get performance trends

### Report Routes (`/api/reports`)

- `GET /tasks` - Task completion report
- `GET /dwr` - DWR submission report
- `GET /attendance` - Attendance report
- `GET /performance` - Performance report
- `GET /activity` - Activity audit trail
- `GET /dashboard-analytics` - Dashboard analytics

### User Routes (`/api/users`)

- `GET /` - List all users (Admin/HR/Manager only)
- `GET /:id` - Get single user
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user
- `GET /:id/team` - Get team members under a manager

### Dashboard Routes (`/api/dashboard`)

- `GET /stats` - Get dashboard statistics
- `GET /user/:userId` - Get user-specific stats

### Notification Routes (`/api/notifications`)

- `GET /` - List notifications
- `PUT /:id/read` - Mark notification as read
- `DELETE /:id` - Delete notification

### Activity Routes (`/api/activity`)

- `GET /` - Get activity log (with filters)

---

## 🔄 KEY WORKFLOWS

### 1. Employee Daily Workflow

```
Login → Auto-mark attendance
→ View assigned tasks
→ Update task status (Pending → In Progress → Completed)
→ Add comments to tasks
→ Submit end-of-day DWR
  ├─ Select completed tasks
  ├─ List pending tasks
  ├─ Write work summary
  ├─ Document challenges
  └─ Plan next day tasks
→ Check if late submission (after 8 PM)
→ Logout → Auto-mark logout
→ Manager review next day
```

### 2. Manager Oversight Workflow

```
Dashboard overview
→ Create & assign tasks (single or recurring)
→ Bulk assign tasks to team
→ Track task progress in real-time
→ Monitor team attendance
→ Review pending DWRs from team
  ├─ Approve → Increment performance score
  └─ Reject → Employee resubmits
→ View team performance metrics
→ Compare employee performance
→ Generate reports
→ Escalate or reassign critical tasks
```

### 3. Recurring Task Workflow

```
Manager creates recurring task
→ Set recurrence: Daily/Weekly/Biweekly/Monthly
→ Set end date
→ Assign to employees
→ Cron job runs nightly at 2 AM
  ├─ Query all recurring tasks
  ├─ Calculate next deadline
  ├─ Generate new child task instance
  └─ Notify assigned employees
→ Employee completes task
→ On completion, check if parent is recurring
  ├─ If yes → Auto-generate next instance
  └─ Notify employee
→ Process continues until end date
→ Parent task marked as no longer recurring
```

### 4. DWR Submission & Approval

```
Employee submits DWR
→ Record submitted time
→ Check if after 8 PM (late flag)
→ Create activity log entry
→ Notify manager
→ Manager reviews DWR
  ├─ Read completed tasks
  ├─ Review pending reasons
  ├─ Check challenges
  └─ Make decision
→ If Approved:
  ├─ Update performance score
  ├─ Recalculate grade (A+ to F)
  ├─ Update leaderboard
  └─ Notify employee
→ If Rejected:
  ├─ Add feedback
  ├─ Employee resubmits next day
  └─ Notify employee
```

### 5. Performance Tracking

```
Task completed
→ Manager approves DWR with completed task
→ Calculate performance points:
  ├─ Base points for completion
  ├─ Priority multiplier (Critical = x2)
  ├─ On-time bonus
  └─ Deduct for late completion
→ Update employee performance score
→ Recalculate grade
→ Update leaderboard ranking
→ Notify employee of new score
→ Store in performance trends
```

---

## ⏰ BACKGROUND JOBS

### Recurring Task Generation (cronJobs.js)

**Schedule:** Daily at 2:00 AM

**Process:**

1. Query all tasks where `isRecurring = true`
2. For each recurring task:
   - Check if already generated for today
   - Verify end date not reached
   - Calculate next deadline based on pattern
   - Create new child task instance
   - Update parent's `lastGeneratedDate`
   - Notify assigned employees

**Recurrence Patterns:**

- Daily: +1 day
- Weekly: +7 days
- Biweekly: +14 days
- Monthly: +1 month (same date)

### Task Completion Notification

**Trigger:** When task marked as completed

**Process:**

1. Create notification for task creator/manager
2. If parent task is recurring:
   - Calculate next instance date
   - Generate new child task
   - Notify employee of next instance
3. Update activity log

### Overdue Task Detection

**Trigger:** Implicit via queries in dashboard/reports

**Process:**

- Flag tasks where deadline < now and status ≠ Completed/Cancelled
- Highlight in UI
- Include in reports
- Consider in performance scoring

---

## 🏗️ TECHNICAL ARCHITECTURE

### Frontend Architecture (Next.js)

```
pages/
├── auth/login → Authentication
├── dashboard → Dashboard with stats
├── tasks → Task management
├── dwr → Daily work reports
├── attendance → Attendance tracking
├── events → Event management
├── team → Team view (Manager)
├── performance → Leaderboard
├── profile → User profile
└── users → User management

lib/
├── api.js → Axios instance with JWT interceptor
└── auth-context.js → Global auth state

components/
├── header.js → Navigation
├── sidebar.js → Left menu (role-based)
├── stat-card.js → Reusable stats card
└── ui/ → Base UI components
```

### Backend Architecture (Express.js)

```
routes/ → API endpoints
controllers/ → Business logic
models/ → MongoDB schemas
middleware/ → Auth, authorization, errors
utils/ → Cron jobs, helpers
db/ → Database connection
scripts/ → Seed data
```

### Data Flow

```
Frontend (Next.js React)
    ↓ (HTTP requests with JWT)
Express.js API (Node.js)
    ↓ (Auth middleware → Authorization → Controller)
Controller Logic
    ↓ (Business logic)
Mongoose Models
    ↓ (ORM queries)
MongoDB Atlas (Cloud Database)
```

### Authentication Flow

1. User login with email/password
2. Backend verifies and returns JWT token
3. Frontend stores token in localStorage
4. axios interceptor auto-adds JWT to all requests
5. Backend verifies JWT on each request
6. Protected routes check user role

**Token Details:**

- JWT with 7-day expiry (configurable)
- Payload includes: userId, email, role
- Signed with secret key

---

## 🔒 SECURITY FEATURES

### Authentication & Authorization

- **JWT Tokens:** All API calls require valid JWT
- **Password Hashing:** Bcrypt with 12 rounds
- **Role-Based Access Control:** 6 roles with specific permissions
- **Route Protection:** Auth middleware verifies JWT
- **Authorization Checks:** Routes verify user role
- **Inactive Users:** Blocked from login

### Data Protection

- **Secure Database:** MongoDB Atlas with credentials
- **Helmet.js:** Security headers
- **CORS:** Cross-origin protection configured
- **Rate Limiting:** 15-minute window, 100 requests per IP

### Audit Trail

- **Activity Logging:** All user actions tracked
- **IP Tracking:** Record IP address for each action
- **Device Info:** Capture user agent/device
- **Timestamp:** All activities timestamped
- **Change History:** Task status changes tracked

### Attendance Verification

- **Location Tracking:** GPS coordinates logged
- **IP Address:** Verify consistent login location
- **Device Info:** Detect unauthorized access
- **Manual Override:** Admin can override attendance

---

## 📊 REPORTING & ANALYTICS

### Available Reports

1. **Task Performance:** Completion rate, overdue, priority analysis
2. **DWR Analytics:** Submission rate, approval rate, trends
3. **Attendance Report:** Working hours, leave usage, trends
4. **Performance Report:** Rankings, grades, trends, comparisons
5. **Activity Audit:** User actions, security trail

### Dashboard Metrics

- Total tasks (created, completed, overdue)
- Team completion rate
- Employee rankings
- Upcoming events
- DWR submission status
- Attendance overview
- Performance trends

---

## 🚀 PROJECT SCALABILITY

**Current Capacity:**

- Supports small to medium organizations
- Handles multiple teams and departments
- Real-time notifications
- Historical data tracking

**Performance Optimizations:**

- MongoDB indexing on frequently queried fields
- Pagination on large datasets
- Caching for leaderboards
- Efficient query filters

**Future Enhancements:**

- Email notifications integration
- SMS alerts for urgent tasks
- Mobile app version
- Real-time WebSocket updates
- Advanced analytics dashboard
- Team collaboration tools
- Resource allocation planning
- Gantt chart visualization
- Integration with external calendar services

---

## 📝 SETUP & DEPLOYMENT

### Requirements

- Node.js 14+
- MongoDB Atlas cluster
- Environment variables configured
- JWT secret key
- Email service (optional)

### Environment Variables

```
MONGODB_URI=<connection_string>
JWT_SECRET=<secret_key>
JWT_EXPIRE=7d
NODE_ENV=production
PORT=5000
FRONTEND_URL=<frontend_url>
```

### Deployment

- Backend: Can deploy to Heroku, AWS, Google Cloud, Azure
- Frontend: Can deploy to Vercel, Netlify, AWS S3
- Database: MongoDB Atlas (managed cloud)

---

## 🎯 KEY FEATURES SUMMARY

✅ Multi-role access control (6 roles)  
✅ Task management with recurring automation  
✅ Daily work report submission & approval  
✅ Real-time attendance tracking with GPS  
✅ Performance scoring & leaderboard  
✅ Event management & RSVP  
✅ Comprehensive reporting & analytics  
✅ Activity audit trail for compliance  
✅ Notification system  
✅ Email integration ready  
✅ Mobile responsive design  
✅ JWT authentication with bcrypt  
✅ Role-based API authorization  
✅ MongoDB data persistence  
✅ Scalable architecture

---

## 📞 SYSTEM STATISTICS

- **6 User Roles** with hierarchical permissions
- **8 Data Models** (User, Task, DWR, Attendance, Event, Activity, Notification, Performance)
- **11 API Route Groups** (Auth, Tasks, DWR, Attendance, Events, Team, Performance, Reports, Users, Dashboard, Notifications)
- **50+ API Endpoints** for comprehensive functionality
- **10+ Pages** in frontend application
- **3 Scheduled Background Jobs** (Recurring task generation, completion handling, overdue detection)
- **5 Report Types** available
- **Complete Audit Trail** of all user activities

---

_This documentation reflects the complete functionality as of April 20, 2026_
