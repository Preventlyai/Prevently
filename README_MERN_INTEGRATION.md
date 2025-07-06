# 🚀 Prevently AI - MERN Stack Integration

## 🌟 Enhanced Architecture Overview

This document outlines the complete MERN (MongoDB, Express, React, Node.js) stack integration that transforms the original Prevently prototype into a production-ready, AI-powered health platform.

## 📁 Project Structure

```
prevently-app/
├── server/                     # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/    # Route handlers and business logic
│   │   │   ├── middlewares/    # Authentication, CORS, error handling
│   │   │   ├── models/         # MongoDB models with Mongoose
│   │   │   └── routes/         # API route definitions
│   │   ├── config/            # Database and app configuration
│   │   ├── utils/             # Helper functions and utilities
│   │   └── server.ts          # Main server entry point
│   ├── package.json           # Backend dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   └── .env                   # Environment variables
│
├── src/                       # Frontend React App (TypeScript)
│   ├── store/                 # Redux Toolkit state management
│   │   ├── slices/            # Redux slices (auth, symptoms, ui)
│   │   ├── hooks.ts           # Typed Redux hooks
│   │   └── store.ts           # Store configuration
│   ├── services/              # API service layer
│   │   └── api.ts             # Axios configuration and API calls
│   ├── PreventlyApp.tsx       # Main app component
│   └── App.tsx                # Root component with providers
│
├── package.json               # Frontend dependencies
└── README.md                  # Main documentation
```

## 🔧 Backend Features

### 🗄️ **Database Models (MongoDB + Mongoose)**

#### User Model
- **Complete Health Profile**: Height, weight, medical history, allergies
- **Gamification System**: XP, levels, achievements, streaks
- **Family Management**: Family member connections and roles
- **Preferences**: Notifications, privacy, accessibility settings
- **Subscription Management**: Free/Premium/Family tiers

#### Symptom Log Model
- **Comprehensive Tracking**: Severity, duration, frequency, impact
- **Contextual Data**: Weather, location, activity, mood, lifestyle
- **AI Analysis**: Pattern recognition, trend analysis, risk assessment
- **Advanced Features**: Tags, linked symptoms, follow-up tracking

### 🔐 **Authentication & Security**
- **JWT-based Authentication**: Secure token-based auth with refresh
- **Password Security**: bcrypt hashing with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Secure cross-origin resource sharing
- **Helmet Security**: HTTP security headers
- **Input Validation**: Zod schema validation

### 🚀 **API Endpoints**

#### Authentication Routes (`/api/auth`)
```typescript
POST /register          // User registration with health profile
POST /login            // User login with XP rewards
GET  /logout           // Secure logout
GET  /me               // Get current user with family data
PUT  /updatedetails    // Update user profile and preferences
PUT  /updatepassword   // Secure password update
DELETE /deleteaccount  // Account deactivation
POST /family/add       // Add family member
```

#### Symptom Routes (`/api/symptoms`)
```typescript
POST /                 // Create symptom log with AI analysis
GET  /                 // Get paginated symptoms with filters
GET  /:id              // Get single symptom with details
PUT  /:id              // Update symptom log
DELETE /:id            // Delete symptom log
GET  /analytics        // Get comprehensive health analytics
GET  /insights         // Get AI-powered health insights (Premium)
```

### 🤖 **AI Integration**
- **Pattern Recognition**: Automatic symptom pattern detection
- **Trend Analysis**: Severity progression over time
- **Risk Assessment**: Health risk level calculation
- **Personalized Recommendations**: AI-generated health tips
- **Trigger Identification**: Environmental and lifestyle correlations

## 🎨 Frontend Enhancements

### 🔄 **State Management (Redux Toolkit)**

#### Auth Slice
- User authentication state
- Profile management
- Family member operations
- Subscription handling

#### Symptom Slice
- Symptom CRUD operations
- Analytics and insights
- Filtering and pagination
- Real-time updates

#### UI Slice
- Theme and accessibility preferences
- Modal and notification management
- Loading states and sync status
- Voice interaction controls

### 📡 **API Integration (Axios)**
- **Automatic Token Management**: JWT token attachment
- **Error Handling**: Comprehensive error responses
- **Offline Support**: Queue actions when offline
- **Real-time Updates**: Live data synchronization
- **Toast Notifications**: User feedback for all operations

### 🎯 **Enhanced Features**

#### Authentication Flow
```typescript
// Register new user
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'securePassword',
  healthProfile: {
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male',
    height: 180,
    weight: 75
  }
};
dispatch(registerUser(userData));

// Login existing user
dispatch(loginUser({ email: 'john@example.com', password: 'securePassword' }));
```

#### Symptom Logging
```typescript
// Log comprehensive symptom
const symptomData = {
  symptomName: 'Headache',
  category: 'physical',
  severity: 7,
  impact: {
    daily_activities: 6,
    work_productivity: 8,
    social_interactions: 4,
    sleep_quality: 5
  },
  duration: 120, // minutes
  frequency: 'sometimes',
  description: 'Throbbing headache on left side',
  context: {
    mood: { stress: 8, anxiety: 6, happiness: 3, energy: 2 },
    lifestyle: { sleepHours: 5, waterIntake: 1500, medicationTaken: false }
  },
  tags: ['work-stress', 'sleep-deprivation']
};
dispatch(createSymptom(symptomData));
```

#### Analytics Dashboard
```typescript
// Get health analytics
dispatch(getSymptomAnalytics('30')); // Last 30 days

// Get AI insights (Premium feature)
dispatch(getSymptomInsights());
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or cloud)
- Git for version control

### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: Strong secret for JWT tokens
# - PORT: Server port (default: 5001)

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to root directory
cd ..

# Install dependencies
npm install

# Create environment file (optional)
echo "REACT_APP_API_URL=http://localhost:5001/api" > .env.local

# Start development server
npm start
```

### Database Setup
```bash
# Start MongoDB locally (if using local instance)
mongod

# Or use MongoDB Atlas for cloud database
# Update MONGO_URI in server/.env
```

## 🌐 Production Deployment

### Backend Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# Environment variables for production:
# - NODE_ENV=production
# - MONGO_URI=<production_mongodb_url>
# - JWT_SECRET=<strong_production_secret>
# - CLIENT_URL=<your_frontend_url>
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to your hosting platform
# - Vercel, Netlify, AWS S3, etc.
```

## 🔐 Environment Variables

### Backend (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017/prevently

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d

# Server
NODE_ENV=development
PORT=5001

# CORS
CLIENT_URL=http://localhost:3000

# External APIs (Optional)
OPENAI_API_KEY=your_openai_key
HEALTH_API_KEY=your_health_api_key
```

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_APP_NAME=Prevently AI
REACT_APP_VERSION=2.0.0
```

## 🚀 Advanced Features

### 1. **Real-time Health Monitoring**
- Live data synchronization
- Automatic pattern detection
- Instant AI insights
- Real-time family updates

### 2. **AI-Powered Analytics**
- Symptom trend analysis
- Risk level assessment
- Personalized recommendations
- Predictive health modeling

### 3. **Family Health Management**
- Multi-user support
- Permission-based sharing
- Family challenges
- Collective insights

### 4. **Gamification System**
- XP and level progression
- Achievement unlocking
- Streak tracking
- Social challenges

### 5. **Advanced Privacy & Security**
- HIPAA-compliant data handling
- Granular privacy controls
- Data export capabilities
- Anonymous mode

## 📊 API Usage Examples

### Health Analytics API
```javascript
// Get comprehensive health analytics
const analytics = await symptomsAPI.getAnalytics('30');
console.log(analytics.data.analytics);
// Output:
// {
//   totalLogs: 45,
//   averageSeverity: 6.2,
//   categoryBreakdown: { physical: 30, mental: 15 },
//   severityDistribution: { mild: 10, moderate: 25, severe: 10 },
//   trendData: [...],
//   mostCommonSymptoms: [...],
//   riskAssessment: { low: 30, moderate: 10, high: 5 }
// }
```

### AI Insights API
```javascript
// Get AI-powered health insights
const insights = await symptomsAPI.getInsights();
console.log(insights.data.insights);
// Output:
// {
//   patterns: ["Headaches occur more frequently on Mondays"],
//   recommendations: ["Consider stress management techniques"],
//   alerts: ["Sleep deprivation pattern detected"],
//   trends: {
//     improving: ["Back pain"],
//     worsening: ["Anxiety levels"],
//     stable: ["Digestive issues"]
//   }
// }
```

## 🔮 Future Enhancements

### Planned Features
- **Telemedicine Integration**: Video consultations with healthcare providers
- **Advanced AI Diagnostics**: Machine learning-based health assessment
- **Wearable Device Integration**: Support for Apple Watch, Fitbit, etc.
- **Community Features**: User forums and support groups
- **Voice AI Assistant**: Natural language health interactions

### Technical Roadmap
- **Microservices Architecture**: Split into specialized services
- **GraphQL API**: More efficient data fetching
- **Real-time Notifications**: WebSocket-based updates
- **Mobile Apps**: React Native iOS/Android apps
- **Advanced Analytics**: Big data processing with Apache Kafka

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Jest for testing
- Conventional commits for git messages

## 📞 Support & Documentation

- **API Documentation**: `/api` endpoint provides interactive docs
- **Health Check**: `/health` endpoint for system status
- **Support Email**: support@prevently.ai
- **GitHub Issues**: For bug reports and feature requests

---

**Ready to transform healthcare with AI? Start your Prevently journey today! 🚀**