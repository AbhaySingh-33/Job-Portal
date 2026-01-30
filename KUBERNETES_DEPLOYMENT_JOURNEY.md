# Kubernetes Deployment Journey & Troubleshooting Log

This document serves as a comprehensive record of the steps taken to deploy the **Job Portal** microservices application to Kubernetes, the challenges faced during the process, and the specific resolutions applied.

## 1. Architecture Overview

The application was deployed with the following components:

*   **Cluster**: Local Kubernetes (Minikube).
*   **Frontend**: Next.js application (Port 3000 -> Ingress 80).
*   **Backend Services**: 7 Node.js/Python microservices (Auth, User, Job, Payment, Utils, Interview, ML).
*   **Infrastructure**:
    *   **Ingress Controller**: Nginx (routing traffic to services).
    *   **ConfigMap**: Non-sensitive environment variables (Service URLs).
    *   **Secrets**: Sensitive credentials (DB, Redis, API Keys).

---

## 2. Deployment Steps Implemented

1.  **Cleanup**: Created `cleanup.ps1` to wipe previous deployments and ensure a clean slate.
2.  **Manifest Creation**:
    *   `00-namespace.yaml`: Isolated environment (`job-portal`).
    *   `01-configmap.yaml`: Centralized service discovery URLs.
    *   `02-secrets.yaml`: secure storage for API keys and DB credentials.
    *   `03-backend-services.yaml`: Standard Deployments & Services for all APIs.
    *   `04-frontend.yaml`: Deployment for the Next.js UI.
    *   `10-ingress.yaml`: Routing rules map `http://localhost/something` to the correct service.
3.  **Automation**: Created `deploy-k8s.ps1` to automate the application of all manifests.
4.  **Frontend Rebuild Strategy**: Created `rebuild-frontend.ps1` to handle build-time environment variable injection.

---

## 3. Issues Encountered & Resolutions

### Issue 1: Missing Namespace
*   **Error**: `Namespace 'job-portal' does not exist` during cleanup.
*   **Cause**: First-time run; no resources existed yet.
*   **Resolution**: Created `00-namespace.yaml` to ensure the namespace is always created first.

### Issue 2: Frontend "Undefined" API URLs
*   **Error**: Browser console showed `undefined/api/auth/login`.
*   **Cause**: Docker build for Next.js (Frontend) did not receive `NEXT_PUBLIC_` environment variables. These are baked in at **build time**, not runtime.
*   **Resolution**:
    1.  Updated `frontend/Dockerfile` to accept `ARG` variables.
    2.  Created `rebuild-frontend.ps1` to pass these args (e.g., `--build-arg NEXT_PUBLIC_API_URL=...`) during `docker build`.

### Issue 3: Ingress Path Duplication (404 Not Found)
*   **Error**: APIs were failing with 404s. Request URLs looked like `http://localhost/api/job/api/job/all`.
*   **Cause**:
    *   Frontend code: Appends `/api/job` to the base URL.
    *   ConfigMap: Base URL was set to `http://localhost/api/job`.
    *   Result: Double path (`/api/job` + `/api/job`).
*   **Resolution**: Updated **ConfigMap** and **Rebuild Script** to set base URLs to the root `http://localhost`.
    *   Now: `http://localhost` + `/api/job/all` = Correct Path.

### Issue 4: Database Connection Failure (`auth-service`)
*   **Error**: `No database connection string was provided to neon()`.
*   **Cause**: The application code expected the environment variable `DB_URL`, but the secret provided `DATABASE_URL`.
*   **Resolution**: Updated `02-secrets.yaml` to include **both** keys pointing to the same connection string.

### Issue 5: Redis Authentication Failed
*   **Error**: `WRONGPASS invalid or missing auth token`.
*   **Cause**: The Auth service code uses `@upstash/redis` which looks for `UPSTASH_REDIS_REST_TOKEN`. The secret only provided `REDIS_TOKEN`.
*   **Resolution**: Added `UPSTASH_REDIS_REST_TOKEN` to `02-secrets.yaml` with the correct value.

### Issue 6: SMTP Email Failure
*   **Error**: `Missing credentials for "PLAIN"`.
*   **Cause**: `nodemailer` configuration requires a user for authentication. The code looked for `SMTP_USER`, but the secret only had `SMTP_MAIL`.
*   **Resolution**: Added `SMTP_USER` to `02-secrets.yaml`, matching the `SMTP_MAIL` value.

### Issue 7: Ingress Path Type Error (ML Service)
*   **Error**: Validation webhook denied request for path `/api/ml(/|$)(.*)` with `Prefix` type.
*   **Resolution**: Changed path type to `ImplementationSpecific` in `11-ingress-ml.yaml` to allow regex rewriting for the Python/FastAPI service.

---

## 4. Current Status

*   **Frontend**: Accessible at [http://localhost/](http://localhost/)
    *   Build Tag: `abhay33/job-portal-frontend:03`
*   **Backend**: All services are **Running** and healthy.
*   **Data Flow**: Frontend -> Ingress (Port 80) -> Cluster Services -> DB/Redis/Kafka/External APIs.

## 5. How to Run

1.  **Start Minikube Tunnel** (Must remain open in a separate Admin terminal):
    ```powershell
    minikube tunnel
    ```

2.  **Deploy/Update** (If you make changes to manifests):
    ```powershell
    .\deploy-k8s.ps1
    ```

3.  **Rebuild Frontend** (If you change frontend code or .env variables):
    ```powershell
    .\rebuild-frontend.ps1
    ```

4.  **Check Status**:
    ```powershell
    kubectl get pods -n job-portal
    ```
