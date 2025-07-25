# MenteeMatch

A comprehensive mentorship platform that connects mentees with experienced mentors in the tech industry. Built with Next.js, TypeScript, Prisma, and PostgreSQL.

## 🚀 Core Features

### 1. User Authentication & Profiles
- **Dual Role System**: Users can register as either mentors or mentees
- **Comprehensive Profiles**: Detailed user profiles with skills, experience, bio, and preferences
- **Profile Pictures**: Avatar support with fallback initials
- **Role-based Access**: Different features and permissions based on user role

### 2. Intelligent Mentor Matching
- **AI-Powered Recommendations**: Smart matching algorithm using Intersection over Union (IoU) for skill-based recommendations
- **Skill-Based Filtering**: Advanced filtering by skills, experience level, location, and availability
- **Search & Discovery**: Browse mentors with real-time search and filtering capabilities
- **Recommended vs All Mentors**: Personalized recommendations alongside comprehensive mentor directory

### 3. Mentorship Request System
- **Request Management**: Mentees can send detailed mentorship requests to mentors
- **Multiple Offering Types**: 
  - 1-on-1 Sessions
  - Career Guidance
  - Skill Development
  - Interview Preparation
  - Portfolio Review
  - Networking Guidance
- **Status Tracking**: Real-time status updates (Pending, Accepted, Rejected)
- **Automatic Relationship Creation**: Accepted requests automatically create mentorship relationships

### 4. Session Scheduling & Management
- **Interactive Scheduling Modal**: Book sessions with preferred mentors
- **Multiple Duration Options**: 30 minutes to 2 hours
- **Session Types**: Different types of mentoring sessions
- **Booking Management**: Track pending, confirmed, and completed sessions
- **Mentor Availability**: Integration with mentor availability preferences

### 5. Real-Time Messaging System
- **Secure Conversations**: Only established mentorship pairs can message each other
- **Conversation Management**: Automatic conversation creation for mentorship relationships
- **Message History**: Persistent chat history with timestamps
- **User Verification**: Relationship verification before enabling messaging

### 6. Comprehensive Dashboard System

#### Mentor Dashboard
- **Mentorship Requests**: View and manage pending requests
- **Active Mentees**: List of current mentees with quick actions
- **Session Management**: Upcoming and completed sessions overview
- **Analytics**: Performance metrics and mentorship statistics

#### Mentee Dashboard
- **Mentor Information**: Details about assigned mentor
- **Task Management**: Track goals and assignments
- **Session History**: View past and upcoming sessions
- **Progress Tracking**: Visual progress indicators
- **Goal Management**: Set and update career goals

### 7. Task & Goal Management
- **Goal Setting**: Mentees can set and update career goals from predefined categories:
  - Get Into Tech
  - Career Transition
  - Build Projects
  - Interview Preparation
  - Resume Review
  - And more...
- **Task Assignment**: Mentors can assign tasks to mentees
- **Progress Tracking**: Visual progress indicators and completion status
- **Due Date Management**: Task scheduling with deadline tracking

### 8. Advanced User Experience
- **Responsive Design**: Mobile-first approach with full responsive support
- **Loading States**: Comprehensive loading indicators and skeleton screens
- **Error Handling**: Graceful error handling with user-friendly messages
- **Real-time Updates**: Dynamic content updates without page refreshes
- **Interactive Modals**: Smooth modal interactions for forms and actions

## 🛠 Technical Architecture

### Backend (API Routes)
- **RESTful API Design**: Clean, organized API endpoints
- **Database Integration**: Prisma ORM with PostgreSQL
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error responses and logging
- **Data Validation**: Input validation and sanitization

### Frontend (React/Next.js)
- **Component Architecture**: Reusable, modular components
- **State Management**: React hooks for local state management
- **UI Components**: Shadcn/ui component library for consistent design
- **Client-Side Routing**: Next.js App Router for seamless navigation
- **Form Handling**: Advanced form validation and submission

### Database Schema
- **User Management**: Flexible user system supporting multiple roles
- **Mentorship Relationships**: Robust relationship modeling
- **Session Management**: Comprehensive booking and session tracking
- **Message System**: Secure conversation management
- **Task & Goal Tracking**: Structured progress management

## 📁 Key Components

### Core Pages
- `/` - Landing page with mentor discovery
- `/mentor-profile` - Detailed mentor profiles with action buttons
- `/dashboard` - Role-based dashboard (mentor/mentee)
- `/messages` - Real-time messaging interface

### Essential Components
- `MentorCard` - Mentor display with quick actions
- `MentorshipRequestForm` - Request submission form
- `SessionSchedulingModal` - Session booking interface
- `MentorshipList` - Active relationships display
- `MentorshipRequests` - Request management for mentors
- `RecommendedMentors` - AI-powered mentor suggestions

### API Endpoints
- `/api/mentors` - Mentor discovery and filtering
- `/api/mentorship-request` - Request creation and management
- `/api/mentorships` - Active relationship management
- `/api/sessions` - Session booking and management
- `/api/messages` - Messaging system
- `/api/match` - AI-powered mentor matching
- `/api/dashboard` - Dashboard data aggregation

## 🎯 User Workflows

### For Mentees
1. **Discovery**: Browse and filter mentors based on skills and preferences
2. **Request**: Send personalized mentorship requests
3. **Connect**: Engage with matched mentors through messaging
4. **Schedule**: Book sessions for guidance and learning
5. **Track**: Monitor progress through tasks and goals

### For Mentors
1. **Profile Setup**: Create comprehensive mentor profile
2. **Request Management**: Review and respond to mentorship requests
3. **Mentee Management**: Manage relationships with active mentees
4. **Session Delivery**: Conduct and track mentoring sessions
5. **Progress Monitoring**: Assign tasks and monitor mentee progress

## 🔐 Security Features
- **Relationship Verification**: Messaging restricted to established mentorships
- **Role-based Access**: Feature access based on user permissions
- **Data Validation**: Server-side input validation and sanitization
- **Secure Sessions**: Protected API endpoints and user sessions

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access Application**
   Open [http://localhost:3000](http://localhost:3000)

## 🔮 Future Enhancements
- Video calling integration for sessions
- Payment processing for premium mentoring
- Advanced analytics and reporting
- Mobile app development
- Integration with external calendars
- Automated session reminders
- Mentor verification system
- Achievement badges and gamification

---

Built with ❤️ for connecting mentors and mentees in the tech industry.
