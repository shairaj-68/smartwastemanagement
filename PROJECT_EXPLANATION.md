# Smart Waste Management System

## Project Overview

The Smart Waste Management System is a full-stack web application designed to streamline waste complaint reporting, management, and resolution in urban environments. It enables citizens to report waste-related issues, workers to manage assignments, and administrators to oversee operations through a centralized dashboard.

### Key Features
- **Role-Based Access Control**: Supports citizen, worker, and admin roles with JWT authentication
- **Complaint Management**: Location-based complaint reporting with image uploads
- **Real-Time Notifications**: Socket.io-powered notifications for status updates
- **Bin Monitoring**: Track bin capacity, schedules, and collection status
- **Analytics Dashboard**: KPI tracking and data visualization
- **Geospatial Queries**: Location-based search and assignment

### Technology Stack
- **Backend**: Node.js, Express.js, MongoDB with Mongoose, JWT, Socket.io
- **Frontend**: React 18, React Router, Axios, Tailwind CSS, Recharts
- **Infrastructure**: Docker, Docker Compose, Nginx
- **External Services**: Cloudinary (image storage)

## Architecture

The application follows a layered architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ - Components    │    │ - Controllers   │    │ - Users         │
│ - Pages         │    │ - Services      │    │ - Complaints    │
│ - Context       │    │ - Models        │    │ - Bins          │
│ - Services      │    │ - Middleware    │    │ - Notifications │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Code Flow

### Backend Flow

#### 1. Application Startup (`server.js`)
```javascript
// Connect to MongoDB
await connectDatabase();

// Create HTTP server with Express app
const server = http.createServer(app);

// Initialize Socket.io for real-time features
initSocket(server);

// Start listening on configured port
server.listen(env.port);
```

#### 2. Request Processing (`app.js`)
```javascript
// Security middleware
app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));

// Request parsing
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Route mounting
app.use('/api', rootRoutes);
```

#### 3. Authentication Flow
```
Client Request → Auth Middleware → Token Verification → User Context → Controller
     ↓              ↓                    ↓              ↓            ↓
  JWT Token    verifyRefreshToken()   decode payload   req.user    Business Logic
```

#### 4. Complaint Creation Flow
```
1. Client uploads form data with image
2. Upload middleware processes file → Cloudinary
3. Validation middleware checks input
4. Controller creates complaint document
5. Notification service creates status update
6. Socket.io broadcasts to relevant users
7. Response sent with complaint data
```

#### 5. Analytics Flow
```
Admin Dashboard Request → Analytics Controller → Aggregation Pipeline
     ↓                        ↓                      ↓
  /admin/analytics     getAnalytics()        MongoDB $group
     ↓                        ↓                      ↓
  KPI Data          Format Response        Status counts, etc.
```

### Frontend Flow

#### 1. Application Initialization (`main.jsx`)
```javascript
// Wrap app with contexts
<AuthProvider>
  <NotificationProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </NotificationProvider>
</AuthProvider>
```

#### 2. Authentication Flow
```
Login Form → API Call → Token Storage → Context Update → Protected Route
     ↓          ↓            ↓              ↓              ↓
  User Input  /auth/login   localStorage   setUser()     Route Guard
```

#### 3. Dashboard Data Flow (`App.jsx`)
```javascript
// Fetch analytics on mount
useEffect(() => {
  // API calls for KPIs and chart data
  api.get('/admin/analytics').then(processData);
  api.get('/complaints', { params: { limit: 5 } }).then(setComplaints);
}, []);

// Render KPI cards and charts
return <AdminLayout>...</AdminLayout>;
```

#### 4. Real-Time Updates
```
Socket Connection → Notification Context → State Update → UI Re-render
     ↓                    ↓                  ↓              ↓
  Server Events     handleNotification   setNotifications  Badge/Toast
```

## Key Components

### Backend Components

#### Controllers
- **auth.controller.js**: Handles user registration, login, token refresh
- **complaint.controller.js**: CRUD operations for complaints with geospatial queries
- **admin.controller.js**: Analytics and user management
- **worker.controller.js**: Assignment management and status updates

#### Services
- **token.service.js**: JWT token generation and verification
- **notification.service.js**: Creates and manages notifications
- **analytics.service.js**: Aggregates dashboard metrics
- **cloudinary.service.js**: Image upload and management

#### Middleware
- **auth.middleware.js**: Verifies JWT tokens and attaches user context
- **role.middleware.js**: Enforces role-based access control
- **validate.middleware.js**: Input validation using Joi schemas
- **upload.middleware.js**: Handles multipart form data

### Frontend Components

#### Pages
- **Login/Register**: Authentication forms
- **Dashboard (App.jsx)**: Admin overview with KPIs and charts
- **Complaints**: List and manage complaints
- **CreateComplaint**: Form for new complaint submission
- **Worker**: Worker-specific dashboard
- **Admin**: Administrative controls

#### Context Providers
- **AuthContext**: Manages authentication state and user data
- **NotificationContext**: Handles real-time notifications

#### Layouts
- **AdminLayout**: Consistent layout with sidebar navigation
- **MainLayout**: Base layout wrapper

## Data Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['citizen', 'worker', 'admin'],
  phone: String,
  address: String,
  refreshTokenHash: String
}
```

### Complaint Model
```javascript
{
  user: ObjectId (ref: User),
  imageUrl: String,
  imagePublicId: String,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  description: String,
  type: ['overflow', 'missed_pickup', etc.],
  status: ['pending', 'assigned', 'in_progress', 'resolved'],
  assignedWorker: ObjectId (ref: User)
}
```

### Bin Model
```javascript
{
  location: Point,
  binId: String (unique),
  capacity: Number (0-100),
  assignedWorker: ObjectId,
  schedule: {
    frequency: ['daily', 'weekly'],
    preferredTime: String
  },
  status: ['active', 'maintenance', 'full'],
  lastCollected: Date
}
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/me` - Get current user

### Complaints
- `GET /api/v1/complaints` - List complaints (with filters)
- `POST /api/v1/complaints` - Create complaint
- `GET /api/v1/complaints/:id` - Get complaint details
- `PATCH /api/v1/complaints/:id` - Update complaint status
- `GET /api/v1/complaints/nearby` - Find nearby complaints

### Admin
- `GET /api/v1/admin/analytics` - Dashboard analytics
- `GET /api/v1/admin/users` - List all users
- `POST /api/v1/admin/assign` - Assign worker to complaint

### Worker
- `GET /api/v1/workers/complaints` - Get assigned complaints
- `PATCH /api/v1/workers/complaints/:id` - Update complaint status

## Deployment

### Development
```bash
# Start both frontend and backend
npm run dev

# Or run separately
npm run backend  # Terminal 1
npm run frontend # Terminal 2
```

### Production
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Environment Variables
```env
# Backend
MONGO_URI=mongodb://localhost:27017/smartwaste
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Development Workflow

1. **Setup**: Clone repo, install dependencies, create `.env`
2. **Seed Data**: Run `npm run seed` to create default users
3. **Development**: Use `npm run dev` for hot-reload
4. **Testing**: Run `npm test` and `npm run lint`
5. **Build**: Use Docker for production deployment

## Future Enhancements

- Mobile app development
- Advanced analytics with ML predictions
- IoT sensor integration for bins
- Multi-language support
- Push notifications
- Offline capability

This documentation provides a comprehensive overview of the Smart Waste Management System's architecture, code flow, and implementation details. The system is designed for scalability and maintainability with clear separation of concerns and modern development practices.