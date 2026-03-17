# CampusHire Frontend

React-based frontend application for the CampusHire campus placement system.

## Tech Stack

- **React 19.2.4** - UI library with functional components and hooks
- **React Router v6.21.0** - Client-side routing
- **Axios 1.6.5** - HTTP client with interceptors
- **Context API** - Global state management
- **Custom CSS** - Pure CSS with CSS variables (no Bootstrap/Tailwind)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build

# Run tests
npm test
```

Frontend will run on: **http://localhost:3000**

## Project Structure

```
src/
├── components/
│   ├── common/              # Reusable components
│   │   ├── Navbar.jsx       # Top navigation
│   │   ├── Sidebar.jsx      # Side navigation
│   │   ├── Footer.jsx       # Footer
│   │   ├── Card.jsx         # Card container
│   │   ├── Modal.jsx        # Modal dialog
│   │   └── ProtectedRoute.jsx
│   ├── student/             # Student components
│   ├── tpo/                 # TPO components
│   └── recruiter/           # Recruiter components
│
├── pages/
│   ├── auth/                # Login & Register
│   ├── student/             # 6 student pages
│   ├── tpo/                 # 6 TPO pages
│   └── recruiter/           # 5 recruiter pages
│
├── context/
│   └── AuthContext.jsx      # Global auth state
│
├── services/
│   └── api.js               # API integration
│
├── styles/
│   └── global.css           # Global theme
│
├── App.jsx                  # Main router
└── index.js                 # Entry point
```

## Key Features

### Authentication
- Location: `src/context/AuthContext.jsx`
- Login/Register with role selection
- localStorage persistence
- Auto-login on refresh
- useAuth custom hook

### Routing
- Location: `src/App.jsx`
- Protected routes with role checking
- 3 role domains: Student, TPO, Recruiter
- Organized 17+ routes

### Styling
- Global CSS with variables
- Responsive breakpoints (1024px, 768px, 480px)
- Black & white minimalist theme
- Utility classes for spacing and layout

### API Integration
- Location: `src/services/api.js`
- Axios with request interceptors
- Organized by role (authAPI, studentAPI, tpoAPI, recruiterAPI)
- Auto token injection

## Components Overview

### Common Components

| Component | Purpose |
|-----------|---------|
| Navbar | Top navigation with user info |
| Sidebar | Role-based side menu |
| Footer | Application footer |
| Card | Reusable card container |
| Modal | Dialog overlay |
| ProtectedRoute | Route protection wrapper |

### Student Pages (6)

1. **StudentDashboard** - Stats and overview
2. **StudentProfile** - Profile management
3. **StudentJobListings** - Job browsing
4. **StudentApplications** - Application tracking
5. **StudentResumeInsights** - ATS score analysis
6. **StudentPreparation** - Preparation tracking

### TPO Pages (6)

1. **TPODashboard** - Analytics overview
2. **TPOStudents** - Student management
3. **TPOJobs** - Job monitoring
4. **TPOEligibility** - Eligibility rules
5. **TPOApplications** - Application tracking
6. **TPOAnalytics** - Analytics dashboard

### Recruiter Pages (5)

1. **RecruiterDashboard** - Recruitment overview
2. **RecruiterPostJob** - Job posting
3. **RecruiterJobs** - Job management
4. **RecruiterApplicants** - Applicant management
5. **RecruiterOffers** - Offer tracking

## Available Scripts

### `npm start`
Runs app in development mode. Open [http://localhost:3000](http://localhost:3000).
- Page reloads on changes
- Errors shown in console

### `npm test`
Launches test runner in watch mode.

### `npm build`
Builds for production in `build/` folder.

### `npm eject`
Exposes webpack config (one-way operation).

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student@example.com | student123 |
| TPO | tpo@example.com | tpo123 |
| Recruiter | recruiter@example.com | recruiter123 |

Click demo buttons on login page to auto-fill credentials!

## CSS Architecture

### Global Variables
```css
:root {
  --primary-color: #000;
  --secondary-color: #333;
  --background-color: #f5f5f5;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --danger-color: #f44336;
  --info-color: #2196f3;
}
```

### Responsive Breakpoints
- **Desktop**: 1024px+ (full sidebar)
- **Tablet**: 768px - 1023px (adapted)
- **Mobile**: <768px (bottom bar)

### Utility Classes
- `.flex` - Flexbox
- `.gap-*`, `.p-*`, `.m-*` - Spacing
- `.btn` - Buttons
- `.badge` - Badges
- `.table` - Tables

## Using Context API

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return <div>{user?.name}</div>;
}
```

## API Integration

```jsx
import { studentAPI } from '../services/api';

const data = await studentAPI.getDashboard();
const applied = await studentAPI.getApplications();
```

## Troubleshooting

**Can't connect to backend?**
- Ensure backend running on http://localhost:8000
- Check browser console for CORS errors

**localStorage not working?**
- Make sure localStorage isn't disabled
- Try incognito mode
- Clear cache and try again

**Styles not applying?**
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
- Clear browser cache

## Environment Variables

Create `.env` in frontend folder:
```
REACT_APP_API_URL=http://localhost:8000
```

Access in code:
```jsx
const apiUrl = process.env.REACT_APP_API_URL;
```

## Production Build

```bash
npm build
```

Deploy `build/` folder to:
- Vercel (recommended)
- Netlify
- GitHub Pages
- Any static server

## Dependencies

- react (19.2.4)
- react-dom (19.2.4)
- react-router-dom (6.21.0)
- axios (1.6.5)

## Learn More

- [React Documentation](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
