# Delegation Frontend

A modern, beautiful, and fully functional Next.js frontend for the Delegation & DWR Management System.

## Features

✨ **Modern UI/UX**

- Beautiful gradient designs
- Smooth animations and transitions
- Responsive layout (mobile, tablet, desktop)
- Dark/Light mode ready

👤 **Authentication**

- JWT-based authentication
- Protected routes
- Session management
- Login/Logout functionality

📊 **Dashboard**

- Real-time statistics
- Task analytics with charts
- Performance metrics
- Quick overview cards

✅ **Task Management**

- Create, read, update, delete tasks
- Filter by status and priority
- Task assignment tracking
- Deadline management

📝 **Daily Work Reports (DWR)**

- Submit daily work summaries
- Track completed/pending tasks
- Work hour logging
- Review status tracking

📅 **Events Management**

- View upcoming events
- Event details and descriptions
- Virtual event support with meeting links
- Event statuses

👥 **User Management**

- View team members
- User profiles
- Role-based access control
- Employee information

📊 **Performance Tracking**

- Performance scores and grades
- Performance charts and analytics
- Grade distribution visualization
- Individual performance tracking

⏰ **Attendance**

- Mark attendance
- View attendance history
- Attendance statistics
- Login/logout time tracking

👤 **User Profile**

- View and edit profile information
- Change password
- Update location
- Personal settings

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Authentication**: JWT Tokens

## Project Structure

```
frontend/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.js              # Dashboard layout
│   │   ├── dashboard/
│   │   │   └── page.js            # Dashboard page
│   │   ├── tasks/
│   │   │   └── page.js            # Tasks page
│   │   ├── dwr/
│   │   │   └── page.js            # DWR page
│   │   ├── events/
│   │   │   └── page.js            # Events page
│   │   ├── attendance/
│   │   │   └── page.js            # Attendance page
│   │   ├── users/
│   │   │   └── page.js            # Users page
│   │   ├── performance/
│   │   │   └── page.js            # Performance page
│   │   └── profile/
│   │       └── page.js            # Profile page
│   ├── auth/
│   │   └── login/
│   │       └── page.js            # Login page
│   ├── layout.js                  # Root layout
│   └── globals.css                # Global styles
├── components/
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.js
│   │   ├── card.js
│   │   ├── input.js
│   │   ├── label.js
│   │   ├── badge.js
│   │   └── alert.js
│   ├── sidebar.js                 # Navigation sidebar
│   ├── header.js                  # Header component
│   ├── stat-card.js               # Statistics card
│   └── loading.js                 # Loading spinner
├── lib/
│   ├── api.js                     # API integration
│   └── auth-context.js            # Auth context provider
├── .env.local                     # Environment variables
├── next.config.js                 # Next.js config
├── tailwind.config.js             # Tailwind config
├── postcss.config.js              # PostCSS config
├── package.json                   # Dependencies
└── README.md                      # Documentation
```

## Installation

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running on `http://localhost:5000`

### Setup Steps

1. **Install dependencies** (when ready):

   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.local` and update if needed
   - Default backend URL: `http://localhost:5000/api`

3. **Run development server**:

   ```bash
   npm run dev
   ```

4. **Open in browser**:
   ```
   http://localhost:3000
   ```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Note**: Only `NEXT_PUBLIC_*` variables are exposed to browser. Use this prefix for frontend-accessible environment variables.

## Pages & Routes

### Public Routes

- `/auth/login` - Login page

### Protected Routes (require authentication)

- `/(dashboard)/dashboard` - Dashboard
- `/(dashboard)/tasks` - Tasks management
- `/(dashboard)/dwr` - Daily work reports
- `/(dashboard)/events` - Events
- `/(dashboard)/attendance` - Attendance tracking
- `/(dashboard)/users` - User management
- `/(dashboard)/performance` - Performance analytics
- `/(dashboard)/profile` - User profile

## Key Components

### Layout Components

- **Sidebar**: Navigation menu with responsive mobile toggle
- **Header**: Top navigation with user menu and notifications
- **Dashboard Layout**: Protected layout that requires authentication

### Page Components

- **Dashboard**: Overview with stats and charts
- **Tasks**: Create, view, and manage tasks
- **DWR**: Submit and track daily work reports
- **Events**: View upcoming events
- **Attendance**: Mark and view attendance
- **Users**: View team members
- **Performance**: Performance metrics and analytics
- **Profile**: User profile and settings

### UI Components

All built from scratch with Tailwind CSS:

- Button (variants: default, secondary, destructive, outline, ghost, link)
- Card (full, header, footer, title, description, content)
- Input (text inputs with validation)
- Label (form labels)
- Badge (status badges)
- Alert (error/info messages)
- Loading Spinner

## API Integration

All API calls are centralized in `lib/api.js`:

```javascript
// Authentication
authAPI.login(email, password)
authAPI.register(data)
authAPI.getMe()
authAPI.logout()
authAPI.updateProfile(data)
authAPI.changePassword(current, new)

// Tasks
tasksAPI.getAll(filters)
tasksAPI.getById(id)
tasksAPI.create(data)
tasksAPI.update(id, data)
tasksAPI.delete(id)

// And more for other resources...
```

## Authentication Flow

1. User navigates to `/auth/login`
2. Enters email and password
3. System makes API call to `/api/auth/login`
4. Token and user data stored in localStorage
5. User redirected to dashboard
6. Protected routes check for token and user
7. Token automatically added to API requests
8. On logout, token and user cleared from localStorage

## State Management

Using React Context API for:

- **AuthContext**: User authentication state, login/logout functions
- **Token Management**: JWT token storage and retrieval

```javascript
const { user, token, login, logout } = useAuth();
```

## Styling

### Tailwind CSS

- Utility-first CSS framework
- Custom color scheme defined in `tailwind.config.js`
- Pre-defined spacing, shadows, and animations
- Responsive design with breakpoints (sm, md, lg, xl, 2xl)

### Custom Styles

- Global styles in `app/globals.css`
- CSS variables for theme colors
- Component-specific styles with Tailwind classes

## Building & Deployment

### Build for Production

```bash
npm run build
```

### Run Production Server

```bash
npm run start
```

### Export Static Site (optional)

```bash
npm run build
# Then serve the `.next/static` folder with a static server
```

## Common Tasks

### Add a New Page

1. Create folder structure: `app/(dashboard)/newfeature/`
2. Create `page.js` file
3. Add to sidebar navigation in `components/sidebar.js`
4. Create API calls in `lib/api.js` if needed

### Add a New UI Component

1. Create in `components/ui/component-name.js`
2. Export the component
3. Import and use in pages

### Customize Colors

1. Edit `app/globals.css` CSS variables (--primary, --secondary, etc.)
2. Or modify `tailwind.config.js` theme colors

### Add Protected Routes

1. Use the existing `(dashboard)` layout
2. Automatic protection via layout.js auth check
3. Redirects to login if not authenticated

## Performance Optimization

- **Image Optimization**: Next.js Image component (future implementation)
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Dynamic imports for heavy components
- **Caching**: API response caching via localStorage

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Troubleshooting

### "API Connection Failed"

- Ensure backend is running on `http://localhost:5000`
- Check `.env.local` API URL
- Verify backend CORS configuration

### "Token Expired"

- Page will redirect to login
- User will need to log in again

### "Styles Not Loading"

- Run `npm install` to ensure Tailwind dependencies
- Clear `.next` folder and rebuild

### Port 3000 Already in Use

```bash
# Use a different port
npm run dev -- -p 3001
```

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Real-time notifications with WebSocket
- [ ] File uploads for tasks/DWR
- [ ] Role-specific views
- [ ] Advanced filtering and search
- [ ] Export reports to PDF
- [ ] Mobile app with React Native
- [ ] Internationalization (i18n)
- [ ] Advanced analytics dashboard
- [ ] Timezone support

## Environment Files

### .env.local (Development)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### .env.production (Production)

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## Support

For issues and questions:

1. Check existing documentation
2. Review API error messages
3. Check browser console for errors
4. Verify backend is running and accessible

## License

This project is part of the Delegation & DWR Management System.
