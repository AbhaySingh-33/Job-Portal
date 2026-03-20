# 🚀 Job Portal

A modern, full-stack job portal application built with microservices architecture, featuring AI-powered job recommendations, real-time application tracking, AI-powered interviews, and integrated payment systems.

## ✨ Features

### For Job Seekers
- 🔍 **Smart Job Search** - Find jobs based on skills, location, and preferences
- 🤖 **AI-Powered Recommendations** - Personalized job suggestions using semantic search with sentence transformers
- 📊 **Application Tracking** - Track application status in real-time with full status history
- 💼 **Profile Management** - Manage professional profile, profile picture, resume, and skills
- 📧 **Email Notifications** - Automatic notifications on application status changes via Kafka events
- 💳 **Premium Subscription** - Access advanced features with Razorpay payment integration
- 🎤 **AI-Powered Interviews** - Voice-based interviews with AI-generated questions and feedback
- 📄 **Resume Analyzer** - AI-powered ATS score and resume improvement suggestions
- 🧭 **Career Guide** - AI-generated career path suggestions based on your skills

### For Recruiters
- 🏢 **Company Management** - Create and manage company profiles
- 📝 **Job Posting** - Create and manage job listings
- 👥 **Applicant Management** - Review applications with full status history
- 🔄 **Status Updates** - Update application statuses with automatic email notifications

### Technical Features
- 🏗️ **Microservices Architecture** - 7 independent services with shared metrics library
- 🔐 **Secure Authentication** - JWT-based auth with OTP login, email verification, password reset
- 📨 **Event-Driven Communication** - Aiven Kafka-based messaging between services
- 🤖 **Machine Learning** - Semantic job recommendations using sentence transformers
- ☁️ **Cloud Storage** - Cloudinary integration for file uploads
- 💰 **Payment Integration** - Razorpay payment gateway
- 🗄️ **Modern Database** - Neon PostgreSQL (Serverless)
- 📈 **Observability** - Prometheus metrics + Grafana dashboards for all services

## 🏗️ Architecture

```
Job-Portal/
├── frontend/                  # Next.js 16 frontend application
├── services/
│   ├── auth/                  # Authentication & authorization (Port 5000)
│   ├── utils/                 # File upload, email, AI utilities (Port 5001)
│   ├── user/                  # User profile management (Port 5002)
│   ├── job/                   # Job posting & management (Port 5003)
│   ├── payments/              # Razorpay payment processing (Port 5004)
│   ├── interview/             # AI-powered interview service (Port 5005)
│   ├── ml-recommendation/     # ML-based job recommendation engine (Port 8000)
│   └── shared/                # Shared Prometheus metrics library
├── k8s/
│   ├── job-portal/            # Helm chart (v0.2.0)
│   └── manifests/             # Raw Kubernetes manifests (incl. monitoring)
└── docs/                      # Deployment scripts & comprehensive guides
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI, Shadcn/ui, Framer Motion, Lucide React
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Voice Integration:** VAPI Web SDK (`@vapi-ai/web`)
- **Theme:** next-themes (dark/light mode)

### Backend Services
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js 5
- **Database:** Neon PostgreSQL (`@neondatabase/serverless`)
- **Caching:**  Redis (`redis`)
- **Message Queue:** Aiven Kafka (`kafkajs`)
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer + Cloudinary
- **Metrics:** `prom-client` (shared library)

### ML Recommendation Service
- **Language:** Python 3.10
- **Framework:** FastAPI + uvicorn
- **ML Libraries:** Sentence Transformers, PyTorch, pandas, joblib
- **Database:** PostgreSQL (`psycopg2-binary`)
- **Metrics:** `prometheus-fastapi-instrumentator`

### Observability
- **Metrics:** Prometheus (scrapes all 7 services)
- **Dashboards:** Grafana (pre-configured, accessible at `/grafana`)

### Infrastructure
- **Container Orchestration:** Kubernetes (Minikube for local) + Helm chart
- **Database:** Neon PostgreSQL (Serverless)
- **Cache/Session:**  Redis
- **Message Broker:** Aiven Kafka
- **Cloud Storage:** Cloudinary
- **Payment Gateway:** Razorpay
- **Email:** Gmail SMTP via Nodemailer
- **AI:** Google Generative AI (Gemini 2.5 Flash)
- **Voice:** VAPI

## 📚 Documentation

Detailed documentation available in the `docs/` directory:

- **Deployment Guides**
  - [`DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Main deployment guide
  - [`KUBERNETES_DEPLOYMENT_JOURNEY.md`](docs/KUBERNETES_DEPLOYMENT_JOURNEY.md) — Kubernetes setup details
  - [`COMMANDS.md`](docs/COMMANDS.md) — Quick command reference

- **Monitoring & ML**
  - [`MONITORING_SUMMARY.md`](docs/MONITORING_SUMMARY.md) — Observability stack details
  - [`ML_SEMANTIC_SEARCH_GUIDE.md`](docs/ML_SEMANTIC_SEARCH_GUIDE.md) — Semantic search implementation

- **Azure & Image Pipeline**
  - [`build-images.ps1`](docs/build-images.ps1) — Build all service images for ACR
  - [`push-images.ps1`](docs/push-images.ps1) — Push images to Azure Container Registry
  - [`create-acr-secret.ps1`](docs/create-acr-secret.ps1) — Create Kubernetes pull secret for ACR

## 📌 Current Project Status (March 2026)

### Implemented and Working
- ✅ Full microservices architecture with 7 services + 1 frontend
- ✅ Helm-based Kubernetes deployment (`k8s/job-portal`)
- ✅ Azure Container Registry image naming and tagging integrated in manifests and Helm values
- ✅ Centralized configuration via ConfigMap + Secrets templates
- ✅ Monitoring stack deployed (Prometheus + Grafana)
- ✅ Metrics successfully available for 6/7 services (all Node.js services)

### Partially Complete
- ⚠️ ML metrics endpoint integration is pending in the Python service (service runs, monitoring endpoint needs finalization)

### Deployment Readiness Summary
- ✅ Local Kubernetes deployment is stable (Minikube + Helm)
- ✅ Cloud image pipeline is prepared for Azure (ACR registry, push scripts, image pull secret script)
- ✅ Ingress routing and path handling issues have documented fixes

## ☁️ Azure Deployment Journey (From Start to Current State)

### Phase 1: Local Containers
- Built Dockerfiles for frontend + all services
- Added build and push automation scripts
- Standardized image tags and service-wise image naming

### Phase 2: Kubernetes with Raw Manifests
- Created namespace, configmap, secrets, services, frontend, monitoring, and ingress manifests
- Validated full application deployment using `kubectl apply`

### Phase 3: Helm Migration
- Converted repeated manifests into reusable templates
- Centralized environment and image values in one file: `k8s/job-portal/values.yaml`
- Added separate templates for backend loop, frontend, ML service, and ingress variants

### Phase 4: Azure Registry Integration
- Switched image repositories to ACR format (`jobportalacr123.azurecr.io/<service>:v1`)
- Added script to create Kubernetes docker-registry secret from Azure token
- Added script-driven build/push flow for all services to the same registry

### Phase 5: Monitoring & Reliability Hardening
- Added Prometheus scraping + Grafana dashboards
- Validated metrics pipeline and service health checks
- Documented known failures and fix procedures in docs

## 🚀 Azure Deployment Runbook (ACR + AKS)

Use this when deploying beyond local Minikube to Azure Kubernetes Service.

### Prerequisites
- Azure CLI logged in (`az login`)
- AKS cluster and ACR created
- `kubectl` context set to AKS
- Helm installed

### 1. Build and Push Images to ACR
```powershell
.\docs\build-images.ps1 -Registry jobportalacr123.azurecr.io -Tag v1
.\docs\push-images.ps1 -Registry jobportalacr123.azurecr.io -Tag v1
```

### 2. Allow AKS to Pull from ACR
Recommended (managed identity attach):
```powershell
az aks update -n <aks-cluster-name> -g <resource-group> --attach-acr jobportalacr123
```

Alternative (token-based pull secret):
```powershell
.\docs\create-acr-secret.ps1
```

### 3. Deploy with Helm
```powershell
helm upgrade --install job-portal .\k8s\job-portal --namespace job-portal --create-namespace
kubectl get pods -n job-portal
```

### 4. Validate Ingress and Services
```powershell
kubectl get svc -n job-portal
kubectl get ingress -n job-portal
kubectl logs -n job-portal -l app=auth-service --tail=100
```

## 🛠 Deployment Problems Faced and Solutions

| Problem | Root Cause | Solution Implemented |
| :--- | :--- | :--- |
| Namespace apply failures | Namespace missing at initial deploy | Added explicit namespace manifest + Helm `--create-namespace` |
| Frontend API URLs undefined | Next.js `NEXT_PUBLIC_*` variables required at build time | Added dedicated frontend rebuild flow with build args |
| API path duplication (`/api/job/api/job/...`) | Incorrect base URL strategy with ingress rewrite | Set base URLs to root host and let ingress manage path prefixes |
| DB connection string missing in service | Different env var naming across services | Mapped both `DB_URL` and `DATABASE_URL` to same secret value |
| Redis `WRONGPASS` with Upstash | REST-token based client used by service | Added `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` |
| ML ingress validation failures | Regex/pathType mismatch for Python route handling | Split ML ingress into dedicated manifest/template with compatible path handling |
| Image pull failures in cluster | Registry/repository mismatch and pull auth not configured | Standardized ACR image names, created ACR pull secret, re-deployed |
| Monitoring targets down | Missing `/metrics` exposure or stale images | Rebuilt services with metrics and corrected scrape configs |

## ✅ Current Azure Deployment Status

- ACR registry integration: **Implemented**
- Helm deployment architecture: **Implemented**
- Kubernetes manifests fallback: **Available**
- Monitoring stack: **Implemented (6/7 targets up)**
- Production AKS rollout path: **Documented and ready**

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.10+
- Neon PostgreSQL account
- Upstash Redis account
- Aiven Kafka account
- Cloudinary account
- Razorpay account
- Google AI API key (Gemini)
- VAPI account

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/AbhaySingh-33/Job-Portal.git
cd Job-Portal
```

#### 2. Database Setup
```bash
psql -d your_neon_database -f services/database_migration.sql
```

#### 3. Frontend
```bash
cd frontend
npm install
# Create .env.local with variables listed below
npm run dev
```

#### 4. Backend Services
Each service follows the same pattern:
```bash
cd services/<service-name>
npm install
# Create .env with variables listed below
npm run dev
```

Services: `auth` (5000), `utils` (5001), `user` (5002), `job` (5003), `payments` (5004), `interview` (5005)

#### 5. ML Recommendation Service
```bash
cd services/ml-recommendation
pip install -r requirements.txt
python src/train_from_db.py        # Train model from DB
uvicorn src.api:app --host 0.0.0.0 --port 8000
```

## 📝 Environment Variables

> **Note:** The variables below are for local development (`npm run dev`). For Kubernetes deployment, configuration is managed via `k8s/manifests/01-configmap.yaml` and `02-secrets.yaml`.

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_UTILS_SERVICE=http://localhost:5001
NEXT_PUBLIC_AUTH_SERVICE=http://localhost:5000
NEXT_PUBLIC_USER_SERVICE=http://localhost:5002
NEXT_PUBLIC_JOB_SERVICE=http://localhost:5003
NEXT_PUBLIC_PAYMENT_SERVICE=http://localhost:5004
NEXT_PUBLIC_INTERVIEW_SERVICE=http://localhost:5005
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
```

### Auth Service (`services/auth/.env`)
```env
PORT=5000
DB_URL=postgresql://username:password@host/database?sslmode=require
UPLOAD_SERVICE=http://localhost:5001
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
Frontend_Url=http://localhost:3000
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
KAFKA_BROKER=your-kafka-host:port
KAFKA_USERNAME=your_kafka_username
KAFKA_PASSWORD=your_kafka_password
```

### Utils Service (`services/utils/.env`)
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

### User Service (`services/user/.env`)
```env
PORT=5002
DB_URL=postgresql://username:password@host/database?sslmode=require
UPLOAD_SERVICE=http://localhost:5001
JWT_SECRET=your_jwt_secret
Frontend_Url=http://localhost:3000
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### Job Service (`services/job/.env`)
```env
PORT=5003
DB_URL=postgresql://username:password@host/database?sslmode=require
UPLOAD_SERVICE=http://localhost:5001
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
JWT_SECRET=your_jwt_secret
Frontend_Url=http://localhost:3000
ML_SERVICE_URL=http://localhost:8000
KAFKA_BROKER=your-kafka-host:port
KAFKA_USERNAME=your_kafka_username
KAFKA_PASSWORD=your_kafka_password
```

### Payment Service (`services/payments/.env`)
```env
PORT=5004
DB_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Interview Service (`services/interview/.env`)
```env
PORT=5005
DB_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your_jwt_secret
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
```

### ML Service (`services/ml-recommendation/.env`)
```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

## 📚 API Reference

### Auth Service (Port 5000) — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user (with profile pic upload) |
| GET | `/verify-email/:token` | Verify email address |
| POST | `/login` | Login with email/password |
| POST | `/verify-otp` | Verify OTP and complete login |
| POST | `/forgot-password` | Request password reset email |
| POST | `/reset-password/:token` | Reset password with token |

### User Service (Port 5002) — `/api/user`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get own profile |
| GET | `/:userId` | Get public user profile |
| PUT | `/update/profile` | Update profile details |
| PUT | `/update/profile-pic` | Update profile picture |
| PUT | `/update/resume` | Upload/update resume |
| POST | `/add/skills` | Add skills to profile |
| PUT | `/delete/skills` | Remove skills from profile |
| POST | `/apply/job` | Apply for a job |
| GET | `/application/all` | Get all own applications |
| GET | `/application/history/:applicationId` | Get application status history |

### Job Service (Port 5003) — `/api/job`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/company/create` | Create company (recruiter) |
| DELETE | `/company/delete/:companyId` | Delete company |
| GET | `/company/all` | Get all companies |
| GET | `/company/:id` | Get company details |
| POST | `/create` | Create job posting |
| PUT | `/update/:jobId` | Update job posting |
| GET | `/all` | List all active jobs |
| GET | `/:jobId` | Get single job details |
| GET | `/applications/:jobId` | Get all applications for a job |
| PUT | `/application/status/:id` | Update application status |
| POST | `/recommend` | Get ML-powered job recommendations |

### Utils Service (Port 5001) — `/api`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload file to Cloudinary |
| POST | `/career` | AI career path suggestions (Gemini) |
| POST | `/resume-analyser` | ATS resume analysis (Gemini) |

### Payment Service (Port 5004) — `/api/payment`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/checkout` | Create Razorpay order |
| POST | `/verify` | Verify payment signature |

### Interview Service (Port 5005) — `/api/interview`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate` | Generate AI interview questions |
| POST | `/feedback` | Generate AI interview feedback |
| GET | `/my-interviews` | Get all user interviews |
| GET | `/:id` | Get interview by ID |
| DELETE | `/:id` | Delete interview |

### ML Recommendation Service (Port 8000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/recommend` | Get job recommendations by skills |
| GET | `/health` | Health check |
| GET | `/metrics` | Prometheus metrics |

**Recommendation request:**
```json
{
  "skills": ["React", "Node.js", "TypeScript"],
  "num_recommendations": 5,
  "threshold": 0.3
}
```

## 🔄 Application Status Flow

`Pending → Reviewing → Shortlisted → Interviewed → Offered / Rejected`

Full audit trail stored in `application_status_history` with timestamps and recruiter notes.

## 🤖 ML Recommendation Engine

- **Model:** `all-MiniLM-L6-v2` (sentence-transformers)
- **Approach:** Cosine similarity on semantic embeddings
- **Training:** Pulls job data directly from PostgreSQL via `train_from_db.py`

## 🎤 AI Interview System

- **Question Generation:** Google Generative AI (Gemini 2.5 Flash)
- **Voice Interface:** VAPI Web SDK
- **Feedback:** AI-evaluated responses with structured scoring

## 📈 Monitoring

Prometheus scrapes metrics from all 7 services. Grafana dashboards are pre-provisioned.

- **Prometheus:** `http://localhost/prometheus`
- **Grafana:** `http://localhost/grafana` (Login: `admin` / `admin123`)

*Note: Requires `minikube tunnel` to be running.*

## 🚢 Kubernetes Deployment

### Prerequisites
- Docker Desktop, Minikube, kubectl

### Deploy
```powershell
# From docs/ directory (Choose one)

# Option 1: Full Deployment (Recommended) - Includes Prometheus & Grafana
.\deploy-with-monitoring.ps1

# Option 2: Basic Deployment - Core services only
.\deploy-k8s.ps1
```

### Access
```powershell
minikube tunnel
# App available at http://localhost/
```

### Rebuild frontend after changes
```powershell
.\rebuild-frontend.ps1
```

Helm chart version: `0.2.0` — located in `k8s/job-portal/`

For detailed deployment notes see [`docs/KUBERNETES_DEPLOYMENT_JOURNEY.md`](docs/KUBERNETES_DEPLOYMENT_JOURNEY.md).

## 📊 Database Schema

Key tables:
- `users` — profiles and authentication
- `jobs` — job postings
- `applications` — job applications with status
- `application_status_history` — full audit trail
- `payments` — Razorpay transactions
- `interviews` — AI interview sessions and evaluations

Migration file: `services/database_migration.sql`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License

## 👨‍💻 Author

**Abhay Singh**
- GitHub: [@AbhaySingh-33](https://github.com/AbhaySingh-33)
- Email: abhaysingh957152@gmail.com
