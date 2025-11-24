#!/bin/bash
# Add your current IP to Cloud SQL authorized networks

PROJECT_ID="destockify"
INSTANCE_NAME="destockify-db"

echo "🔍 Getting your current IP address..."
MY_IP=$(curl -s https://api.ipify.org)
echo "Your IP: $MY_IP"
echo ""

echo "📝 Adding your IP to authorized networks..."
gcloud sql instances patch $INSTANCE_NAME \
  --authorized-networks=$MY_IP/32 \
  --project=$PROJECT_ID

echo ""
echo "✅ IP added! You can now connect to the database."
echo ""
echo "⚠️  Note: It may take 1-2 minutes for changes to propagate."
echo ""
echo "Connection string:"
echo "postgresql://destockify_user:26OIEhNLgrJvwz40TASryE1rg@34.29.108.164:5432/destockify_prod"
