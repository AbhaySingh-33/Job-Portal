# Deploy Helm Chart
Write-Host "🚀 Deploying Job Portal via Helm..." -ForegroundColor Cyan

# Check if Release Exists
$release = helm list -q --filter 'job-portal'
if ($release) {
    Write-Host "Updating existing release..." -ForegroundColor Yellow
    helm upgrade job-portal ./k8s/job-portal
} else {
    Write-Host "Installing new release..." -ForegroundColor Green
    helm install job-portal ./k8s/job-portal --create-namespace --namespace job-portal
}

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
kubectl get pods -n job-portal
