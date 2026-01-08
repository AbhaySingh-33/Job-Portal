# AI Interview Feature

## Overview
The AI Interview feature allows job seekers to practice technical interviews with AI-powered voice conversations. The system generates relevant questions based on job role, experience level, and tech stack, then provides detailed feedback after the interview.

## Architecture

### Backend Service (`services/interview`)
- **Port**: 5005
- **Database**: PostgreSQL table `interviews`
- **AI Integration**: Google Gemini for question generation and feedback
- **Voice Integration**: Vapi AI for voice conversations

### Frontend Integration
- **Pages**: `/interview`, `/interview/create`, `/interview/[id]`, `/interview/[id]/feedback`
- **Components**: `InterviewCard`, `Agent` (Vapi integration)
- **Navigation**: Added to main navbar for authenticated users

## Features

### 1. Interview Creation
- Job role specification
- Experience level selection (Entry, Mid, Senior, Lead)
- Tech stack customization
- Configurable number of questions (3-10)

### 2. AI Question Generation
- Context-aware questions based on role and tech stack
- Powered by Google Gemini AI
- Stored in database for consistency

### 3. Voice Interview
- Real-time voice conversation with AI interviewer
- Powered by Vapi AI platform
- Natural conversation flow with follow-up questions

### 4. AI Feedback
- Comprehensive performance analysis
- Technical and communication scores
- Strengths and improvement areas
- Overall rating (0-100)

## Database Schema

```sql
CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    tech_stack TEXT[],
    experience_level VARCHAR(50),
    questions JSONB,
    transcript TEXT,
    feedback_json JSONB,
    rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### POST `/api/interview/generate`
Generate interview questions
```json
{
  "role": "Frontend Developer",
  "level": "Mid",
  "techStack": ["React", "TypeScript", "Node.js"],
  "questionCount": 5
}
```

### POST `/api/interview/feedback`
Generate feedback from transcript
```json
{
  "interviewId": 1,
  "transcript": "interview conversation transcript..."
}
```

### GET `/api/interview/my-interviews`
Get user's interview history

### GET `/api/interview/:id`
Get specific interview details

## Environment Variables

### Backend (`services/interview/.env`)
```
PORT=5005
DB_URL=postgresql://username:password@localhost:5432/jobportal
JWT_SECRET=your_jwt_secret_here
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_INTERVIEW_SERVICE=http://localhost:5005
NEXT_PUBLIC_API_URL=http://localhost:5005/api
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_web_token_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id_here
```

## Setup Instructions

### 1. Install Dependencies
```bash
# Backend
cd services/interview
npm install

# Frontend (additional packages)
cd frontend
npm install @vapi-ai/web uuid @types/uuid
```

### 2. Configure Environment Variables
- Set up Google Gemini API key
- Configure Vapi AI credentials
- Update database connection string

### 3. Run Services
```bash
# Interview service
cd services/interview
npm run dev

# Frontend (if not already running)
cd frontend
npm run dev
```

### 4. Database Migration
The interview table will be created automatically when the service starts.

## Deployment

### Docker
```bash
# Build interview service image
docker build -t interview:latest ./services/interview
```

### Kubernetes
```bash
# Deploy interview service
kubectl apply -f k8s/manifests/interview-deployment.yaml
```

## Usage Flow

1. **Create Interview**: User specifies job role, experience level, and tech stack
2. **Question Generation**: AI generates relevant technical questions
3. **Voice Interview**: User conducts voice conversation with AI interviewer
4. **Feedback Generation**: AI analyzes transcript and provides detailed feedback
5. **Review Results**: User can view feedback and performance metrics

## Integration Points

- **Authentication**: Uses existing JWT-based auth system
- **Database**: Shares PostgreSQL instance with other services
- **Frontend**: Integrated into existing Next.js application
- **Navigation**: Added to main navbar for authenticated users

## Security Considerations

- All endpoints require authentication
- User can only access their own interviews
- Sensitive data (API keys) stored in Kubernetes secrets
- Transcript data is stored securely in database

## Future Enhancements

- Video interview support
- Multiple AI interviewer personalities
- Industry-specific question sets
- Interview scheduling and reminders
- Performance analytics and trends
- Integration with job applications