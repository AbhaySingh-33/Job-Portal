# 🚀 Job Portal

A modern, full-stack job portal application built with microservices architecture, featuring AI-powered job recommendations, real-time application tracking, and integrated payment systems.


## ✨ Features

### For Job Seekers
- 🔍 **Smart Job Search** - Find jobs based on skills, location, and preferences
- 🤖 **AI-Powered Recommendations** - Get personalized job suggestions using semantic search
- 📊 **Application Tracking** - Track your application status in real-time with detailed history
- 💼 **Profile Management** - Create and manage your professional profile
- 📧 **Email Notifications** - Receive updates on application status changes
- 💳 **Premium Features** - Access advanced features with integrated payment options

### For Recruiters
- 📝 **Job Posting** - Create and manage job listings
- 👥 **Applicant Management** - Review and track applications
- 🔄 **Status Updates** - Update application statuses with automatic notifications
- 📈 **Analytics Dashboard** - Track recruitment metrics

### Technical Features
- 🏗️ **Microservices Architecture** - Scalable and maintainable service-based design
- 🔐 **Secure Authentication** - JWT-based auth with Redis session management
- 📨 **Event-Driven Communication** - Kafka-based messaging between services
- 🤖 **Machine Learning** - Semantic job recommendations using sentence transformers
- ☁️ **Cloud Storage** - Cloudinary integration for file uploads
- 💰 **Payment Integration** - Stripe and Razorpay support

## 🏗️ Architecture

This project follows a microservices architecture with the following services:

```
Job-Portal/
├── frontend/           # Next.js 16 frontend application
└── services/
    ├── auth/          # Authentication & authorization service
    ├── user/          # User profile management service
    ├── job/           # Job posting & management service
    ├── payments/      # Payment processing service
    ├── utils/         # Utility services (email, file upload, AI)
    └── ml-recommendation/ # ML-based job recommendation engine
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI, Framer Motion
- **State Management:** React Hooks
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast

### Backend Services
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon)
- **Caching:** Redis/Upstash
- **Message Queue:** Kafka
- **Authentication:** JWT, bcrypt

### ML Recommendation Service
- **Language:** Python 3.10
- **Framework:** FastAPI
- **ML Libraries:** 
  - Sentence Transformers (all-MiniLM-L6-v2)
  - PyTorch
  - scikit-learn
  - pandas

### Infrastructure & DevOps
- **Database:** PostgreSQL with PL/pgSQL triggers
- **Cloud Storage:** Cloudinary
- **Payment Gateways:** Stripe, Razorpay
- **Email Service:** Nodemailer
- **AI Integration:** Google Generative AI

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.10+
- PostgreSQL
- Redis
- Kafka (optional, for event-driven features)

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

**Auth Service:**
```bash
cd services/auth
npm install
# Configure .env file with your credentials
npm run dev
```

**User Service:**
```bash
cd services/user
npm install
# Configure .env file
npm run dev
```

**Job Service:**
```bash
cd services/job
npm install
# Configure .env file
npm run dev
```

**Payment Service:**
```bash
cd services/payments
npm install
# Configure .env file with Stripe/Razorpay keys
npm run dev
```

**Utils Service:**
```bash
cd services/utils
npm install
# Configure .env file with email and cloud storage credentials
npm run dev
```

#### 4. Set up ML Recommendation Service
```bash
cd services/ml-recommendation
pip install -r requirements.txt

# Train the model from your database
python src/train_from_db.py

# Start the API server
uvicorn src.api:app --host 0.0.0.0 --port 9001
```

#### 5. Database Setup
```bash
# Run the database migration
psql -d your_database -f services/database_migration.sql
```

## 📝 Environment Variables

Each service requires its own `.env` file. Here are the key variables:

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_SERVICE=http://localhost:8001
NEXT_PUBLIC_USER_SERVICE=http://localhost:8002
NEXT_PUBLIC_JOB_SERVICE=http://localhost:8003
```

### Backend Services
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
KAFKA_BROKER=localhost:9092
PORT=8001
```

### Utils Service
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_AI_API_KEY=your_google_ai_key
```

### Payment Service
```env
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### ML Service
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

## 📚 API Documentation

### Key Endpoints

#### Authentication Service (Port 8001)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

#### Job Service (Port 8003)
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job (recruiter only)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/apply` - Apply to a job
- `PATCH /api/applications/:id/status` - Update application status

#### ML Recommendation Service (Port 9001)
- `POST /recommend` - Get job recommendations
  ```json
  {
    "skills": ["React", "Node.js"],
    "num_recommendations": 5,
    "threshold": 0.3
  }
  ```

## 🔄 Application Tracking System

The application tracking system provides:
- **Real-time Status Updates** - Track applications through various stages
- **Status History** - Complete audit trail of status changes
- **Email Notifications** - Automatic notifications on status changes
- **Recruiter Notes** - Add context to status updates

Status Flow: `Pending → Reviewing → Shortlisted → Interviewed → Offered/Rejected`

See [APPLICATION_TRACKING_FEATURES.md](./APPLICATION_TRACKING_FEATURES.md) for detailed documentation.

## 🤖 ML Recommendation Engine

The recommendation system uses semantic search with sentence transformers to provide intelligent job matching:

- **Model:** all-MiniLM-L6-v2 (sentence-transformers)
- **Approach:** Cosine similarity on semantic embeddings
- **Features:**
  - Understands job descriptions semantically
  - Matches based on skills, role, and requirements
  - Configurable similarity threshold
  - Real-time recommendations

### Training the Model
```bash
cd services/ml-recommendation
python src/train_from_db.py
```

### Testing Recommendations
```bash
python test_api.py
```

## 📊 Database Schema

Key tables:
- `users` - User profiles and authentication
- `jobs` - Job postings
- `applications` - Job applications
- `application_status_history` - Application status tracking
- `payments` - Payment transactions

## 🧪 Testing

### Test Application Email System
```bash
# See TEST_APPLICATION_EMAIL.md for testing instructions
```

## 🚀 Deployment

### Frontend (Vercel)
The frontend is deployed on Vercel. Connect your GitHub repository and configure environment variables.

### Backend Services
Deploy each microservice independently using:
- Docker containers
- Kubernetes
- Cloud platforms (AWS, GCP, Azure)

### ML Service
The ML service can be deployed on:
- Railway
- Render
- AWS Lambda
- Google Cloud Run

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Abhay Singh**
- GitHub: [@AbhaySingh-33](https://github.com/AbhaySingh-33)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Sentence Transformers for the ML models
- All open-source contributors

## 📞 Support

For support, email abhaysingh957152@gmail.com or open an issue in the repository.

---

⭐ If you find this project helpful, please give it a star!
