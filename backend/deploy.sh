#!/bin/bash

# Build Docker image
echo "Building Docker image..."
docker build -t wasilahhadi/fuel-agent-backend:latest .

# Push to Docker Hub
echo "Pushing to Docker Hub..."
docker push wasilahhadi/fuel-agent-backend:latest

# Apply Kubernetes configuration
echo "Deploying to Kubernetes..."
kubectl apply -f k8s-deploy.yaml

# Wait for deployment
echo "Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/backend -n fuel-friend

# Show status
echo "Deployment status:"
kubectl get pods -n fuel-friend
kubectl get services -n fuel-friend
kubectl get ingress -n fuel-friend

echo "Backend deployed successfully!"
echo "API will be available at: https://api.kelolahrd.life"