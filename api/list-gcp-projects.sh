#!/bin/bash

# Quick script to list your GCP projects and help you choose one for Destockify

echo "📋 Your Google Cloud Projects:"
echo ""
gcloud projects list --format="table(projectId,name,projectNumber)" || {
  echo "❌ Failed to list projects. Make sure you're authenticated:"
  echo "   gcloud auth login"
  exit 1
}

echo ""
echo "To use an existing project for Destockify, run:"
echo "  export GCP_PROJECT_ID=your-project-id"
echo "  ./setup-cloud-sql.sh"
echo ""
echo "Or create a new project:"
echo "  gcloud projects create destockify-prod --name='Destockify Production'"
echo "  gcloud billing projects link destockify-prod --billing-account=YOUR_BILLING_ACCOUNT_ID"

