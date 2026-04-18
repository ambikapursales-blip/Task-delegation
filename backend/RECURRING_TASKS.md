# Recurring Tasks Feature Documentation

## Overview

The Delegation system now supports recurring tasks, allowing you to automatically generate task instances based on specified patterns (daily, weekly, monthly, etc.).

## Features

### Task Types Supported

- **One-time**: Single task (default)
- **Daily**: Task repeats every day
- **Weekly**: Task repeats every week
- **Monthly**: Task repeats on the same day each month
- **Custom**: Custom recurrence patterns

### How Recurring Tasks Work

1. **Create a Recurring Task**: When creating a task, select the task type and configure recurrence settings
2. **Automatic Generation**: New task instances are automatically created when:
   - A previous instance is marked as "Completed" (immediate generation)
   - The scheduled cron job runs (daily at 2 AM for time-based generation)
3. **Instance Creation**: New task instances are automatically created and assigned to the same users
4. **End Date Support**: Optionally specify when recurrence should stop
5. **Smart Generation**: System checks if an active instance already exists before generating a new one

## API Usage

### Create a Recurring Task

**Endpoint**: `POST /api/tasks`

**Request Body**:

```json
{
  "title": "Weekly Status Report",
  "description": "Submit weekly status report",
  "priority": "Medium",
  "deadline": "2026-04-25",
  "assignedTo": ["userId1", "userId2"],
  "taskType": "Weekly",
  "isRecurring": true,
  "recurrencePattern": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 3, 5] // Monday, Wednesday, Friday (0=Sunday)
  },
  "recurrenceEndDate": "2026-12-31" // Optional
}
```

### Recurrence Pattern Options

#### Daily Task

```json
{
  "taskType": "Daily",
  "isRecurring": true,
  "recurrencePattern": {
    "frequency": "daily",
    "interval": 1 // Repeat every 1 day
  }
}
```

#### Weekly Task

```json
{
  "taskType": "Weekly",
  "isRecurring": true,
  "recurrencePattern": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 3, 5] // Monday, Wednesday, Friday
  }
}
```

#### Bi-weekly Task

```json
{
  "taskType": "Weekly",
  "isRecurring": true,
  "recurrencePattern": {
    "frequency": "biweekly",
    "interval": 1
  }
}
```

#### Monthly Task

```json
{
  "taskType": "Monthly",
  "isRecurring": true,
  "recurrencePattern": {
    "frequency": "monthly",
    "interval": 1,
    "dayOfMonth": 15 // Repeat on the 15th of each month
  }
}
```

### Manually Trigger Recurring Task Generation

**Endpoint**: `POST /api/tasks/generate/recurring`

**Headers**:

```
Authorization: Bearer <admin-token>
```

**Response**:

```json
{
  "success": true,
  "message": "Recurring tasks generated successfully"
}
```

## Cron Job Details

### Dual-Trigger Generation System

The system uses **two methods** to generate recurring task instances:

#### Trigger 1: Completion-Based (Immediate)

When a user marks a recurring task instance as **"Completed"**, the system:

1. Checks if the completed task has a `parentTaskId` (is a child task)
2. If yes, immediately generates the next instance
3. New task appears in the task list instantly
4. **Result**: Users see the next task right after completing the current one

#### Trigger 2: Time-Based (Scheduled)

The cron job runs daily at 2:00 AM to handle edge cases:

1. Finds all parent recurring tasks
2. Checks if enough time has passed since last generation
3. Verifies no active instance exists yet
4. Creates new instance if needed
5. **Result**: Backup system ensures tasks are always available even if completion trigger fails

### Schedule

- **Frequency**: Daily at 2:00 AM (UTC)
- **Cron Expression**: `0 2 * * *`
- **Time-based intervals**: Daily, Weekly, Bi-weekly, Monthly

### What It Does

**Completion-Based Trigger**:

1. User completes a task instance
2. System checks for `parentTaskId`
3. Generates next instance immediately

**Time-Based Trigger**:

1. Finds all active recurring tasks
2. Checks if a new instance should be generated based on the recurrence pattern
3. Verifies no active/pending instance exists
4. Creates new task instances if needed
5. Updates the parent task's `lastGeneratedDate` and `nextOccurrenceDate`

### Configuration

To change the schedule, edit `utils/cronJobs.js`:

```javascript
// Change the schedule from daily to hourly:
cron.schedule("0 * * * *", async () => {
  await generateRecurringTasks();
});
```

### Smart Generation Logic

The system prevents duplicate tasks by:

- Checking if an active/pending instance exists before generating
- Only creating next instance when current one is Completed/Cancelled
- Respecting recurrence end dates
- Tracking `lastGeneratedDate` and `nextOccurrenceDate`

## Frontend Usage

### Create a Recurring Task

1. Go to **Tasks** page
2. Click **Create Task** tab
3. Fill in basic task details (title, description, priority, deadline)
4. Select **Task Type**: Choose "Daily", "Weekly", "Monthly", or "Custom"
5. Configure **Recurrence Settings**:
   - Select frequency (daily, weekly, bi-weekly, monthly)
   - Set repeat interval
   - Optionally set an end date
6. Click **Create Task**

### View Recurring Tasks

- In the tasks table, recurring tasks will show their type and frequency
- Example: "Weekly (weekly)" or "Daily (daily)"
- Parent recurring tasks are marked as "Recurring"
- Generated instances will be marked as "One-time" (since instances themselves don't recur)

## Database Schema

### New Task Fields

```javascript
{
  taskType: String,              // "One-time", "Daily", "Weekly", "Monthly", "Custom"
  isRecurring: Boolean,          // true for parent recurring tasks
  parentTaskId: ObjectId,        // Reference to parent task (for instances)
  recurrencePattern: {
    frequency: String,           // "daily", "weekly", "biweekly", "monthly"
    daysOfWeek: [Number],       // 0-6 (0=Sunday)
    dayOfMonth: Number,         // 1-31
    interval: Number,           // Repeat every X days/weeks/months
    customDays: [Number]        // For custom patterns
  },
  recurrenceEndDate: Date,       // When to stop generating instances
  nextOccurrenceDate: Date,      // Calculated next scheduled instance
  lastGeneratedDate: Date        // When the last instance was created
}
```

## Examples

### Example 1: Daily Task at 9 AM

```json
{
  "title": "Team Stand-up",
  "taskType": "Daily",
  "isRecurring": true,
  "recurrencePattern": {
    "frequency": "daily",
    "interval": 1
  }
}
```

### Example 2: Bi-weekly Monday & Thursday

```json
{
  "title": "Performance Review",
  "taskType": "Weekly",
  "isRecurring": true,
  "recurrencePattern": {
    "frequency": "biweekly",
    "interval": 1,
    "daysOfWeek": [1, 4] // Monday, Thursday
  }
}
```

### Example 3: Monthly on the 1st

```json
{
  "title": "Monthly Report",
  "taskType": "Monthly",
  "isRecurring": true,
  "recurrencePattern": {
    "frequency": "monthly",
    "interval": 1,
    "dayOfMonth": 1
  },
  "recurrenceEndDate": "2027-12-31"
}
```

## Practical Example: Weekly Task Flow

### Scenario: "Weekly Status Report"

**Setup**:

- Created: Monday, April 15
- Type: Weekly
- Frequency: Every 1 week
- Assigned to: John

**Week 1 Flow**:

```
Monday, April 15 - Initial task created
  └─ Deadline: Friday, April 18
  └─ Status: Pending

Wednesday, April 17 - John completes the task
  ├─ Marks as "Completed" ✅
  └─ System immediately generates Week 2
      └─ New task created for next week
      └─ Deadline: Friday, April 25
      └─ Status: Pending

Friday, April 18 - Original deadline passes
  └─ Cron job runs at 2 AM (backup check)
  └─ Verifies next instance exists ✓
  └─ No duplicate created (smart logic)

Friday, April 25 - Week 2 task due
  └─ John completes it ✅
  └─ System immediately generates Week 3
  └─ Next instance created for April 30
```

**Key Points**:

- User sees next week's task **immediately** after marking complete
- Even if user forgets to mark complete, cron job at 2 AM ensures tasks are always ready
- System prevents duplicate tasks automatically

## Troubleshooting

### Next Instance Not Created When Task Completed

1. **Check server logs** for "⚡ Generating next instance" message
2. **Verify task has `parentTaskId`** - Only child tasks trigger generation
3. **Verify parent task has `isRecurring: true`** - Parent must be marked as recurring
4. **Check if there's already an active instance** - System won't create duplicate if one exists
5. **Try the cron job backup** - Next generation happens at 2 AM automatically

### Tasks Not Being Generated

1. Check if cron job is running: Check server logs for "Running recurring task generation"
2. Verify task has `isRecurring: true`
3. Verify `recurrenceEndDate` (if set) is in the future
4. Manually trigger generation: `POST /api/tasks/generate/recurring`
5. Check server logs for "⚡ Generating next instance" for completion-triggered generation

### Tasks Generated Too Frequently

- Check the `interval` in `recurrencePattern`
- Verify the cron schedule in `utils/cronJobs.js`
- Verify child task has correct `parentTaskId`

### Missing Dependencies

```bash
cd backend
npm install node-cron
npm start
```

## Future Enhancements

- [ ] Support for custom day patterns (e.g., "every 3rd Friday")
- [ ] UI for editing recurring task patterns
- [ ] Notifications before recurring task deadlines
- [ ] Bulk operations on recurring tasks
- [ ] Pause/resume recurring tasks
- [ ] Task series templates
