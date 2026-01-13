#!/bin/bash
# =============================================================================
# 🎯 Bingo Party Enterprise - Rollback Script
# =============================================================================
# โดย: เม (DevOps Engineer)
# วันที่: 12 มกราคม 2026
# คำอธิบาย: Rollback to Previous Version
# =============================================================================

set -e  # Exit on error

# =============================================================================
# Configuration
# =============================================================================
APP_DIR="/opt/bingo-party"
BACKUP_DIR="/backups/bingo-party"

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
# Main Rollback Process
# =============================================================================
log "🔄 Starting Rollback Process..."

# 1. Stop Current Services
log "🛑 Stopping current services..."
cd "$APP_DIR"
docker-compose down || log "WARNING: Failed to stop services gracefully"

# 2. Restore Previous Docker Images
log "📦 Rolling back to previous Docker images..."
docker-compose pull --tag previous || error_exit "Failed to pull previous images"

# 3. Restore Database Backup (Optional - ใช้เฉพาะกรณี Migration ล้มเหลว)
if [ "$RESTORE_DATABASE" = "true" ]; then
    log "🗄️  Restoring database from latest backup..."

    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/bingo_party_*.sql.gz | head -1)

    if [ -z "$LATEST_BACKUP" ]; then
        error_exit "No backup file found in $BACKUP_DIR"
    fi

    log "   Using backup: $LATEST_BACKUP"

    # Decompress
    gunzip -c "$LATEST_BACKUP" > /tmp/restore.sql

    # Restore
    PGPASSWORD="${POSTGRES_PASSWORD}" psql \
        -h localhost \
        -U postgres \
        -d bingo_party \
        -f /tmp/restore.sql || error_exit "Database restore failed"

    rm /tmp/restore.sql
    log "✅ Database restored successfully"
fi

# 4. Start Previous Version
log "🚀 Starting previous version..."
docker-compose up -d || error_exit "Failed to start previous version"

# 5. Health Check
log "🏥 Running health check..."
sleep 10

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health)

if [ "$HEALTH_STATUS" = "200" ]; then
    log "✅ Health check passed - Rollback successful!"
else
    error_exit "Health check failed (HTTP $HEALTH_STATUS)"
fi

# 6. Notify Team
if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST "$SLACK_WEBHOOK" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"⚠️ Bingo Party rolled back to previous version\"}"
fi

log "✅ Rollback completed successfully!"

exit 0

# =============================================================================
# Usage
# =============================================================================
# 1. Rollback (без Database Restore):
#    ./rollback.sh
#
# 2. Rollback with Database Restore:
#    RESTORE_DATABASE=true ./rollback.sh
#
# 3. Environment Variables:
#    export POSTGRES_PASSWORD=your_password
#    export SLACK_WEBHOOK=your_webhook_url
# =============================================================================
