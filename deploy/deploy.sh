#!/bin/bash
# =============================================================================
# 🎯 Bingo Party Enterprise - Deployment Script
# =============================================================================
# โดย: เม (DevOps Engineer)
# วันที่: 12 มกราคม 2026
# คำอธิบาย: Deploy to Production/Staging
# =============================================================================

set -e  # Exit on error

# =============================================================================
# Configuration
# =============================================================================
APP_DIR="/opt/bingo-party"
ENVIRONMENT="${1:-production}"  # production | staging | development

# =============================================================================
# Functions
# =============================================================================
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

# =============================================================================
# Validation
# =============================================================================
if [[ ! "$ENVIRONMENT" =~ ^(production|staging|development)$ ]]; then
    error_exit "Invalid environment. Usage: ./deploy.sh [production|staging|development]"
fi

log "🚀 Starting Deployment to $ENVIRONMENT..."

# =============================================================================
# Pre-Deployment
# =============================================================================
log "📋 Pre-Deployment Checks..."

# 1. Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    error_exit "App directory not found: $APP_DIR"
fi

cd "$APP_DIR"

# 2. Create Backup
log "💾 Creating pre-deployment backup..."
./deploy/backup.sh || error_exit "Backup failed"

# 3. Pull Latest Code (if using Git)
if [ -d ".git" ]; then
    log "📥 Pulling latest code from Git..."
    git pull origin main || error_exit "Git pull failed"
fi

# =============================================================================
# Build & Deploy
# =============================================================================
log "🏗️  Building and deploying..."

# 1. Pull Latest Docker Images
log "📦 Pulling latest Docker images..."
docker-compose pull || error_exit "Docker pull failed"

# 2. Build Images (if needed)
if [ "$BUILD_IMAGES" = "true" ]; then
    log "🔨 Building Docker images..."
    docker-compose build || error_exit "Docker build failed"
fi

# 3. Stop Old Containers (Graceful Shutdown)
log "🛑 Stopping old containers..."
docker-compose down --remove-orphans || log "WARNING: Failed to stop containers gracefully"

# 4. Run Database Migrations
log "🗄️  Running database migrations..."
cd bingo-backend
npx prisma migrate deploy || error_exit "Database migration failed"
cd ..

# 5. Start New Containers
log "🚀 Starting new containers..."
docker-compose up -d || error_exit "Failed to start containers"

# =============================================================================
# Post-Deployment
# =============================================================================
log "📋 Post-Deployment Checks..."

# 1. Wait for Services to Start
log "⏳ Waiting for services to start..."
sleep 15

# 2. Health Check
log "🏥 Running health check..."
HEALTH_URL="http://localhost:8001/health"

RETRY_COUNT=0
MAX_RETRIES=5

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

    if [ "$HEALTH_STATUS" = "200" ]; then
        log "✅ Health check passed (HTTP 200)"
        break
    else
        log "⚠️  Health check failed (HTTP $HEALTH_STATUS) - Retry $((RETRY_COUNT + 1))/$MAX_RETRIES"
        RETRY_COUNT=$((RETRY_COUNT + 1))
        sleep 5
    fi
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    log "❌ Health check failed after $MAX_RETRIES retries"
    log "🔄 Rolling back..."
    ./deploy/rollback.sh
    error_exit "Deployment failed - rolled back"
fi

# 3. Clean Up
log "🧹 Cleaning up old Docker resources..."
docker system prune -f || log "WARNING: Docker cleanup failed"

# 4. Notify Team
if [ -n "$SLACK_WEBHOOK" ]; then
    log "📢 Sending notification to Slack..."
    curl -X POST "$SLACK_WEBHOOK" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"✅ Bingo Party deployed successfully to $ENVIRONMENT\"}"
fi

# =============================================================================
# Summary
# =============================================================================
log "📊 Deployment Summary:"
log "   - Environment: $ENVIRONMENT"
log "   - Timestamp: $(date)"
log "   - Backend: http://localhost:8001"
log "   - Frontend: http://localhost:3000"

log "✅ Deployment completed successfully!"

exit 0

# =============================================================================
# Usage
# =============================================================================
# 1. Deploy to Production:
#    ./deploy.sh production
#
# 2. Deploy to Staging:
#    ./deploy.sh staging
#
# 3. Deploy to Development:
#    ./deploy.sh development
#
# 4. Build Images Before Deploy:
#    BUILD_IMAGES=true ./deploy.sh production
#
# 5. Environment Variables:
#    export SLACK_WEBHOOK=your_webhook_url
# =============================================================================
