# Unified Calendar Application

A modern calendar application built with React, TypeScript, and FullCalendar that integrates with Microsoft Graph API.

## Features

- Calendar view with day, week, and month options
- Microsoft 365 integration
- Modern UI with Tailwind CSS
- Responsive design
- Automated CI/CD pipeline

## Prerequisites

- Node.js 20 or higher
- Docker
- Kubernetes cluster
- kubectl configured to access your cluster
- Helm 3.x
- GitHub account with repository access

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Microsoft Graph API credentials:
```
VITE_CLIENT_ID=your_client_id
VITE_TENANT_ID=your_tenant_id
VITE_REDIRECT_URI=http://localhost:5173
```

3. Start development server:
```bash
npm run dev
```

## Building the Application

```bash
npm run build
```

## Docker Build

```bash
docker build -t unified-calendar:latest .
```

## Automated Deployment (CI/CD)

The application uses GitHub Actions for automated deployment. The workflow:
1. Builds and pushes the Docker image to GitHub Container Registry
2. Deploys the application to Kubernetes using Helm

### Setting Up CI/CD

1. Fork this repository to your GitHub account

2. Set up the following secrets in your GitHub repository:
   - `KUBE_CONFIG`: Your Kubernetes cluster configuration
   - `VITE_CLIENT_ID`: Your Azure AD application client ID
   - `VITE_TENANT_ID`: Your Azure AD tenant ID
   - `INGRESS_HOST`: Your domain name (e.g., calendar.example.com)

3. Push your code to the main branch:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

The CI/CD pipeline will automatically:
- Build the Docker image
- Push it to GitHub Container Registry
- Deploy to your Kubernetes cluster

### Manual Deployment

If you prefer manual deployment, follow these steps:

#### Option 1: Direct Kubernetes Deployment

1. Create a namespace:
```bash
kubectl create namespace calendar-app
```

2. Apply configurations:
```bash
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

#### Option 2: Helm Deployment

1. Install Helm:
```bash
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
sudo apt-get install apt-transport-https --yes
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm
```

2. Deploy using Helm:
```bash
helm install unified-calendar ./charts/unified-calendar -f values.yaml -n calendar-app
```

## Configuration

### Setting Up Microsoft Graph API

1. Register your application in Azure Portal
2. Configure the following environment variables:
   - `VITE_CLIENT_ID`: Your Azure AD application client ID
   - `VITE_TENANT_ID`: Your Azure AD tenant ID
   - `VITE_REDIRECT_URI`: The redirect URI for authentication (must match the registered URI)

### Custom Domain Configuration

1. Update the `VITE_REDIRECT_URI` in your Kubernetes secrets to match your domain
2. Configure your ingress to use your domain
3. Ensure your DNS records point to your Kubernetes cluster's ingress controller

## Troubleshooting

### Kubernetes Deployment
- Check pod logs: `kubectl logs -f deployment/unified-calendar -n calendar-app`
- Check pod status: `kubectl get pods -n calendar-app`
- Check service status: `kubectl get svc -n calendar-app`
- Check ingress status: `kubectl get ingress -n calendar-app`

### Helm Deployment
- List releases: `helm list -n calendar-app`
- Get release status: `helm status unified-calendar -n calendar-app`
- View release values: `helm get values unified-calendar -n calendar-app`
- Uninstall release: `helm uninstall unified-calendar -n calendar-app`

### CI/CD Pipeline
- Check GitHub Actions workflow runs in the Actions tab
- View workflow logs for detailed error information
- Verify Docker image was pushed to GitHub Container Registry
- Check Kubernetes deployment status after pipeline completion

## License

MIT

