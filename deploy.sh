#!/bin/bash
# deploy.sh — GoalsTracker VPS deployment script.
# Usage: ./deploy.sh [domain]
# Example: ./deploy.sh goals.mysite.com

set -e

DOMAIN=${1:-localhost}
echo "=== GoalsTracker Deployment ==="
echo "Domain: $DOMAIN"

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "ERROR: Docker is not installed. Install it first:"
  echo "  curl -fsSL https://get.docker.com | sh"
  exit 1
fi

if ! command -v docker compose &> /dev/null; then
  echo "ERROR: Docker Compose is not installed."
  exit 1
fi

# Create .env if missing
if [ ! -f .env ]; then
  echo "Creating .env from template..."
  JWT_SECRET=$(openssl rand -base64 48)
  SA_PASSWORD="GoalsTracker$(openssl rand -hex 8)!"
  cat > .env <<EOF
SA_PASSWORD=$SA_PASSWORD
JWT_SECRET=$JWT_SECRET
DOMAIN=$DOMAIN
EOF
  echo "Generated .env with random secrets."
  echo "SA_PASSWORD=$SA_PASSWORD"
  echo "JWT_SECRET=$JWT_SECRET"
  echo ""
  echo "SAVE THESE VALUES — they won't be shown again."
  echo ""
fi

# Source env
source .env

# Build and start
echo "Building containers..."
docker compose build --no-cache

echo "Starting services..."
docker compose up -d

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: http://$DOMAIN"
echo "API:      http://$DOMAIN/api/health"
echo ""
echo "Check status: docker compose ps"
echo "View logs:    docker compose logs -f"
echo "Stop:         docker compose down"
