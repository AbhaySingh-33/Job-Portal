# 🚀 Job Portal

A modern, full-stack job portal application built with microservices architecture, featuring AI-powered job recommendations, real-time application tracking, AI-powered interviews, and integrated payment systems.

## ✨ Features

### For Job Seekers
- 🔍 **Smart Job Search** - Find jobs based on skills, location, and preferences
- 🤖 **AI-Powered Recommendations** - Get personalized job suggestions using semantic search with sentence transformers
- 📊 **Application Tracking** - Track your application status in real-time with detailed history
- 💼 **Profile Management** - Create and manage your professional profile with file uploads
- 📧 **Email Notifications** - Receive updates on application status changes via Kafka events
- 💳 **Premium Features** - Access advanced features with Razorpay payment integration
- 🎤 **AI-Powered Interviews** - Conduct voice-based interviews using VAPI and Deepgram integration

### For Recruiters
- 📝 **Job Posting** - Create and manage job listings with rich descriptions
- 👥 **Applicant Management** - Review and track applications with status history
- 🔄 **Status Updates** - Update application statuses with automatic email notifications
- 📈 **Analytics Dashboard** - Track recruitment metrics and application insights
- 🎯 **AI Interview Analysis** - Leverage Google Generative AI for interview evaluation

### Technical Features
- 🏗️ **Microservices Architecture** - Scalable and maintainable service-based design
- 🔐 **Secure Authentication** - JWT-based auth with Upstash Redis session management
- 📨 **Event-Driven Communication** - Aiven Kafka-based messaging between services
- 🤖 **Machine Learning** - Semantic job recommendations using sentence transformers
- ☁️ **Cloud Storage** - Cloudinary integration for file uploads and management
- 💰 **Payment Integration** - Razorpay payment gateway integration
- 🗄️ **Modern Database** - Neon PostgreSQL with advanced triggers and functions

## 🏗️ Architecture

This project follows a microservices architecture with the following services:

```
Job-Portal/
├── frontend/              # Next.js 16 frontend application
└── services/
    ├── auth/             # Authentication & authorization service (Port 5000)
    ├── user/             # User profile management service (Port 5002)
    ├── job/              # Job posting & management service (Port 5003)
    ├── payments/         # Razorpay payment processing service (Port 5004)
    ├── interview/        # AI-powered interview service (Port 5005)
    ├── utils/            # Utility services (email, file upload, AI) (Port 5001)
    └── ml-recommendation/ # ML-based job recommendation engine (Port 8000)
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI, Framer Motion, Shadcn/ui
- **State Management:** React Hooks
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Voice Integration:** VAPI Web SDK, Deepgram API

### Backend Services
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js 5
- **Database:** Neon PostgreSQL (Serverless)
- **Caching:** Upstash Redis
- **Message Queue:** Aiven Kafka
- **Authentication:** JWT with bcrypt
- **File Upload:** Multer with Cloudinary

### ML Recommendation Service
- **Language:** Python 3.10
- **Framework:** FastAPI
- **ML Libraries:** 
  - Sentence Transformers (semantic search)
  - PyTorch
  - pandas, joblib
- **Database:** PostgreSQL with psycopg2

### Infrastructure & Third-Party Services
- **Database:** Neon PostgreSQL (Serverless)
- **Cache/Session Store:** Upstash Redis
- **Message Broker:** Aiven Kafka
- **Cloud Storage:** Cloudinary
- **Payment Gateway:** Razorpay
- **Email Service:** Gmail SMTP via Nodemailer
- **AI Services:** Google Generative AI (Gemini)
- **Voice Services:** VAPI, Deepgram

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.10+
- Neon PostgreSQL account
- Upstash Redis account
- Aiven Kafka account
- Cloudinary account
- Razorpay account
- Google AI API key

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/AbhaySingh-33/Job-Portal.git
cd Job-Portal
```

#### 2. Set up the Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # Configure your environment variables
npm run dev
```

The frontend will be available at `http://localhost:3000`

#### 3. Set up Backend Services

**Auth Service (Port 5000):**
```bash
cd services/auth
npm install
npm run dev
```

**Utils Service (Port 5001):**
```bash
cd services/utils
npm install
npm run dev
```

**User Service (Port 5002):**
```bash
cd services/user
npm install
npm run dev
```

**Job Service (Port 5003):**
```bash
cd services/job
npm install
npm run dev
```

**Payment Service (Port 5004):**
```bash
cd services/payments
npm install
npm run dev
```

**Interview Service (Port 5005):**
```bash
cd services/interview
npm install
npm run dev
```

#### 4. Set up ML Recommendation Service
```bash
cd services/ml-recommendation
pip install -r requirements.txt

# Train the model from your database
python src/train_from_db.py

# Start the API server
uvicorn src.api:app --host 0.0.0.0 --port 8000
```

#### 5. Database Setup
```bash
# Run the database migration
psql -d your_neon_database -f services/database_migration.sql
```

## 📝 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_UTILS_SERVICE=http://localhost:5001
NEXT_PUBLIC_AUTH_SERVICE=http://localhost:5000
NEXT_PUBLIC_USER_SERVICE=http://localhost:5002
NEXT_PUBLIC_JOB_SERVICE=http://localhost:5003
NEXT_PUBLIC_PAYMENT_SERVICE=http://localhost:5004
NEXT_PUBLIC_INTERVIEW_SERVICE=http://localhost:5005
NEXT_PUBLIC_API_URL=http://localhost:5005/api
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_key
```

### Auth Service (.env)
```env
PORT=5000
DB_URL=postgresql://username:password@host/database?sslmode=require
UPLOAD_SERVICE=http://localhost:5001
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
Frontend_Url=http://localhost:3000
REDIS_URL=rediss://default:token@host:6379
UPSTASH_REDIS_REST_URL=https://your-redis-host.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
KAFKA_BROKER=your-kafka-host:port
KAFKA_USERNAME=your_kafka_username
KAFKA_PASSWORD=your_kafka_password
```

### Job Service (.env)
```env
PORT=5003
DB_URL=postgresql://username:password@host/database?sslmode=require
UPLOAD_SERVICE=http://localhost:5001
JWT_SECRET=your_jwt_secret
Frontend_Url=http://localhost:3000
ML_SERVICE_URL=http://localhost:8000
KAFKA_BROKER=your-kafka-host:port
KAFKA_USERNAME=your_kafka_username
KAFKA_PASSWORD=your_kafka_password
```

### Utils Service (.env)
```env
PORT=5001
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
API_KEY_GEMINI=your_google_ai_api_key
KAFKA_BROKER=your-kafka-host:port
KAFKA_USERNAME=your_kafka_username
KAFKA_PASSWORD=your_kafka_password
```

### Payment Service (.env)
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=5004
DB_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your_jwt_secret
```

### Interview Service (.env)
```env
PORT=5005
DB_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your_jwt_secret
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
```

### ML Service (.env)
```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

## 📚 API Documentation

### Key Endpoints

#### Authentication Service (Port 5000)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

#### Job Service (Port 5003)
- `GET /api/jobs` - List all jobs with pagination
- `POST /api/jobs` - Create new job (recruiter only)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/apply` - Apply to a job
- `PATCH /api/applications/:id/status` - Update application status
- `GET /api/applications/:id/history` - Get application status history

#### ML Recommendation Service (Port 8000)
- `POST /recommend` - Get job recommendations
  ```json
  {
    "skills": ["React", "Node.js", "TypeScript"],
    "num_recommendations": 5,
    "threshold": 0.3
  }
  ```
- `GET /health` - Health check endpoint

#### Interview Service (Port 5005)
- `POST /api/interviews` - Create interview session
- `GET /api/interviews/:id` - Get interview details
- `POST /api/interviews/:id/evaluate` - AI-powered interview evaluation

#### Payment Service (Port 5004)
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment signature
- `GET /api/payments/history` - Get payment history

## 🔄 Application Tracking System

The application tracking system provides:
- **Real-time Status Updates** - Track applications through various stages
- **Status History** - Complete audit trail with timestamps and notes
- **Email Notifications** - Automatic notifications via Kafka events
- **Recruiter Notes** - Add context to status updates

Status Flow: `Pending → Reviewing → Shortlisted → Interviewed → Offered/Rejected`

## 🤖 ML Recommendation Engine

The recommendation system uses semantic search with sentence transformers:

- **Model:** all-MiniLM-L6-v2 (sentence-transformers)
- **Approach:** Cosine similarity on semantic embeddings
- **Features:**
  - Semantic understanding of job descriptions
  - Skills-based matching with configurable threshold
  - Real-time recommendations via FastAPI

### Training the Model
```bash
cd services/ml-recommendation
python src/train_from_db.py
```

### Testing Recommendations
```bash
python test_api.py
```

## 🎤 AI-Powered Interview System

The interview system leverages:
- **VAPI Web SDK** - Real-time voice interactions
- **Deepgram API** - Speech-to-text conversion
- **Google Generative AI** - Interview analysis and evaluation
- **Real-time Processing** - Live interview feedback

## 📊 Database Schema

Key tables with enhanced tracking:
- `users` - User profiles and authentication
- `jobs` - Job postings with rich metadata
- `applications` - Job applications with status tracking
- `application_status_history` - Complete audit trail
- `payments` - Razorpay payment transactions
- `interviews` - AI interview sessions and evaluations

## 🧪 Testing

### Test ML Recommendations
```bash
cd services/ml-recommendation
python test_api.py
```

### Test Application Email System
The system uses Kafka events for real-time email notifications on status changes.

## 🚀 Deployment

### Frontend
Deploy on Vercel with environment variables configured.

### Backend Services
Each microservice can be deployed independently using:
- Docker containers
- Railway/Render for individual services
- Kubernetes for orchestration

### ML Service
Deploy the FastAPI service on:
- Railway (recommended)
- Render
- Google Cloud Run

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨💻 Author

**Abhay Singh**
- GitHub: [@AbhaySingh-33](https://github.com/AbhaySingh-33)
- Email: abhaysingh957152@gmail.com

## 🙏 Acknowledgments

- Next.js team for the amazing React framework
- Sentence Transformers for semantic search capabilities
- Aiven for managed Kafka services
- Upstash for serverless Redis
- Neon for serverless PostgreSQL
- All open-source contributors

## 📞 Support

For support, email abhaysingh957152@gmail.com or open an issue in the repository.

---

⭐ If you find this project helpful, please give it a star!