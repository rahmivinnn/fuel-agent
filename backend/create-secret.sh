#!/bin/bash

# Load .env file
source .env

# Delete existing secret if exists
kubectl delete secret backend-secrets -n fuel-friend --ignore-not-found=true

# Create secret from environment variables
kubectl create secret generic backend-secrets -n fuel-friend \
  --from-literal=database-url="$DATABASE_URL" \
  --from-literal=jwt-secret="$JWT_SECRET" \
  --from-literal=google-client-id="$GOOGLE_CLIENT_ID" \
  --from-literal=google-client-secret="$GOOGLE_CLIENT_SECRET" \
  --from-literal=sendgrid-api-key="$SENDGRID_API_KEY" \
  --from-literal=twilio-account-sid="$TWILIO_ACCOUNT_SID" \
  --from-literal=twilio-auth-token="$TWILIO_AUTH_TOKEN"

echo "✅ Secret created from .env file"