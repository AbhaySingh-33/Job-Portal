# Job Portal - Kubernetes & Helm Deployment Guide

This document details our journey from local development to a production-ready Kubernetes architecture, specifically focusing on our **Helm Chart implementation**, the challenges we overcame, and how to operate the system.

## 🚀 Deployment Evolution

### Phase 1: Local Development (Docker Compose)
Initially, the project ran using Docker images and local scripts. While effective for individual testing, it lacked orchestration capabilities.

### Phase 2: Raw Kubernetes Manifests (`k8s/manifests/`)
We moved to Kubernetes to manage our **7+ microservices**.
**Approach:** Created static `.yaml` files for each resource (Deployment, Service, Ingress, ConfigMap).
*   **Pros:** Explicit and easy to read for beginners.
*   **Cons:** High redundancy (copy-pasting Deployment YAML for 7 services), difficult to change global values (like domain or image tags), and error-prone updates.

### Phase 3: Helm Chart Implementation (`k8s/job-portal/`)
To solve the redundancy and management issues, we migrated to **Helm**, the package manager for Kubernetes.
**Approach:** created a dynamic template system.
*   **Key Feature:** A single `deployment-backend.yaml` template iterates over all services defined in `values.yaml`, generating the necessary Kubernetes manifests automatically.
*   **Benefits:**
    *   **Single Source of Truth:** All configuration (image tags, ports, replicas) sits in `values.yaml`.
    *   **DRY (Don't Repeat Yourself):** One template covers Auth, User, Job, Payment, Interview, and Utils services.
    *   **Environment flexibility:** Easy to swap between Development and Production environments by changing values.

---

## 🛠 Helm Implementation Deep Dive

Our Helm chart is structured to maximize reusability.

### File Structure
```
k8s/job-portal/
├── Chart.yaml              # Metadata (version: 0.2.0)
├── values.yaml             # Central configuration (image tags, ports, secrets)
└── templates/
    ├── configmap.yaml      # Generates global env variables
    ├── secret.yaml         # Manages sensitive keys (DB, Redis, API Keys)
    ├── deployment-backend.yaml # LOOPs through 5+ services to create deployments
    ├── deployment-frontend.yaml # Specialized deployment for Next.js
    ├── deployment-ml.yaml  # Specialized deployment for Python/ML service w/ resource limits
    ├── ingress.yaml        # Main routing for web and standard APIs
    └── ingress-ml.yaml     # Specific routing for ML service (due to path handling differences)
```

### Key Technical Decisions

1.  **Dynamic Looping**:
    In `templates/deployment-backend.yaml`, we use Helm's range function:
    ```yaml
    {{- range $serviceName, $config := .Values }}
      ... generate deployment ...
    {{- end }}
    ```
    This means adding a new generic Node.js service only requires adding 5 lines of config to `values.yaml`, not creating new files.

2.  **Service-Specific Overrides**:
    While looping, we handle exceptions. For example, the **Interview Service** needs a specific Google AI key, and **Utils Service** needs Cloudinary credentials. These are injected conditionally within the loop.

3.  **Frontend Build Args vs Runtime Ops**:
    The Frontend (Next.js) requires specialized handling because `NEXT_PUBLIC_` variables are baked in at **build time**. Our Helm chart manages the runtime aspect (replicas, ports), but we rely on a specialized rebuild script (`rebuild-frontend.ps1`) to handle the image creation stage correctly.

---

## ⚠️ Challenges Faced & Resolutions

During our migration from Manifests to Helm, we encountered several critical issues. Here is how they were resolved:

| Issue | Description | Resolution |
| :--- | :--- | :--- |
| **Namespace Logic** | `job-portal` namespace didn't exist, causing initial apply to fail. | Created `00-namespace.yaml` and ensured Helm handles namespace creation automatically via `helm install --create-namespace`. |
| **Frontend "Undefined" APIs** | Next.js API calls failed because env vars weren't present in the browser. | Realized `NEXT_PUBLIC_` vars are needed at **compile time**. Created `rebuild-frontend.ps1` to pass `--build-arg` during Docker build. |
| **Ingress Path Duplication** | APIs received double paths (e.g., `/api/job/api/job/all`). | Adjusted ConfigMap base URLs to root (`http://localhost`) instead of full paths, letting Ingress handle the routing prefix transparently. |
| **DB Connection Strings** | `auth-service` failed with "No connection string". | Mapped both `DB_URL` (code expectation) and `DATABASE_URL` (external secret standard) to the same value in Secrets. |
| **Redis Auth Failure** | `WRONGPASS` error from Upstash Redis. | Discovered code used `@upstash/redis` (REST) vs standard Redis client. Added `UPSTASH_REDIS_REST_TOKEN` to secrets. |
| **ML Ingress Errors** | Nginx validation failed for Python service regex paths. | Separated ML ingress into `ingress-ml.yaml` with `pathType: ImplementationSpecific` to allow Nginx regex rewrites. |

---

## � Workflow: Making Changes & Updates

When you modify code or configuration, follow these steps to update the running cluster.

### Scenario A: I changed Backend Code (e.g., `auth-service`)
1.  **Rebuild Docker Image**:
    ```powershell
    # Navigate to service directory
    cd services/auth
    # Build with a new tag (e.g., v2)
    docker build -t auth-service:v2 .
    ```
2.  **Update Helm Values**:
    Open `k8s/job-portal/values.yaml` and update the tag:
    ```yaml
    auth:
      image:
        tag: "v2"
    ```
3.  **Apply Changes**:
    ```powershell
    .\deploy-helm.ps1
    ```

### Scenario B: I changed Frontend Code (Next.js)
Because the frontend requires build-time environment variables, use the dedicated script:
```powershell
# This rebuilds the image, injects env vars, and updates the Helm release
.\rebuild-frontend.ps1
```

### Scenario C: I changed Configuration (Env Vars, Replicas)
1.  **Modify `k8s/job-portal/values.yaml`**:
    Example: Change replicas from 1 to 3.
    ```yaml
    auth:
      replicas: 3
    ```
2.  **Apply Changes**:
    ```powershell
    .\deploy-helm.ps1
    ```

---

## �💻 Command Reference

### Prerequisites
*   Docker Desktop (Running)
*   Minikube (`minikube start`)
*   Helm (`choco install kubernetes-helm`)

### 1. The "Easy Button" (Recommended)
We have created automation scripts to handle the heavy lifting.

**Deploy Everything (Helm):**
```powershell
# Installs or Upgrades the Helm release
.\deploy-helm.ps1
```

**Rebuild Frontend (If you change .env):**
```powershell
# Rebuilds Docker image with new build-args and deletes old pod to force update
.\rebuild-frontend.ps1
```

### 2. Manual Commands (Under the Hood)

#### Helm (Modern)
These are the commands `deploy-helm.ps1` runs for you.
```powershell
# Install for the first time
helm install job-portal ./k8s/job-portal --namespace job-portal --create-namespace

# Update after changing values.yaml
helm upgrade job-portal ./k8s/job-portal --namespace job-portal

# View everything
kubectl get all -n job-portal
```

#### Manifests (Legacy)
If you want to use the raw files in `k8s/manifests/` instead of Helm, use the legacy script:
```powershell
.\docs\deploy-k8s.ps1
```

### 3. Debugging
If a pod crashes or acts weird:
```powershell
# Check logs of a specific service
kubectl logs -n job-portal -l app=auth-service

# Describe pod to see startup errors (CrashLoopBackOff)
kubectl describe pod -n job-portal -l app=auth-service

# Check Ingress IP
kubectl get ingress -n job-portal
```

---

## 🆚 Comparison: Helm vs. Manifests

| Feature | Raw Manifests (`k8s/manifests`) | Helm Chart (`k8s/job-portal`) |
| :--- | :--- | :--- |
| **Code Duplication** | High (Repeated YAML for every service) | Low (Templates reuse code) |
| **Configuration** | Scattered across multiple files | Centralized in `values.yaml` |
| **Scalability** | Hard (Must edit every file to change a label) | Easy (Change one variable) |
| **Learning Curve** | Low (What you see is what you get) | Medium (Requires understanding Go templating) |
| **Status** | 🛑 Deprecated | ✅ Production Standard |
