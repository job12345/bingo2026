#!/bin/bash
# =============================================================================
# 🎯 Bingo Party Enterprise - Database Backup Script
# =============================================================================
# โดย: เม (DevOps Engineer)
# วันที่: 12 มกราคม 2026
# คำอธิบาย: Backup PostgreSQL Database
# =============================================================================

set -e  # Exit on error

# =============================================================================
# Configuration
# =============================================================================
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/bingo-party"
DB_NAME="bingo_party"
DB_USER="postgres"
COMPOSE_FILE="docker-compose.app.yml"

# Backup Filename
BACKUP_FILE="${BACKUP_DIR}/bingo_party_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

# Retention (วันที่เก็บ Backup)
RETENTION_DAYS=30

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

compose() {
    if command -v docker-compose >/dev/null 2>&1; then
        docker-compose -f "$COMPOSE_FILE" "$@"
    else
        docker compose -f "$COMPOSE_FILE" "$@"
    fi
}

# =============================================================================
# Main Backup Process
# =============================================================================
log "🔄 Starting Database Backup..."

# 1. Create Backup Directory
mkdir -p "$BACKUP_DIR" || error_exit "Failed to create backup directory"

# 2. Run pg_dump
log "📦 Dumping database: $DB_NAME"
compose up -d postgres || error_exit "Failed to start postgres"

POSTGRES_CONTAINER_ID=$(compose ps -q postgres)
if [ -z "$POSTGRES_CONTAINER_ID" ]; then
    error_exit "Postgres container not found"
fi

docker exec -e PGPASSWORD="${POSTGRES_PASSWORD}" "$POSTGRES_CONTAINER_ID" \
    pg_dump -U "$DB_USER" -d "$DB_NAME" -F p > "$BACKUP_FILE" || error_exit "pg_dump failed"

# 3. Compress Backup
log "🗜️  Compressing backup..."
gzip "$BACKUP_FILE" || error_exit "Compression failed"

# 4. Verify Backup
if [ -f "$BACKUP_FILE_GZ" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
    log "✅ Backup completed: $BACKUP_FILE_GZ ($BACKUP_SIZE)"
else
    error_exit "Backup file not found after compression"
fi

# 5. Clean Old Backups (เก็บเฉพาะ 30 วันล่าสุด)
log "🧹 Cleaning old backups (retention: $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "bingo_party_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# 6. Upload to S3 (Optional)
if [ -n "$AWS_S3_BUCKET" ]; then
    log "☁️  Uploading to S3: s3://$AWS_S3_BUCKET/backups/"
    aws s3 cp "$BACKUP_FILE_GZ" "s3://$AWS_S3_BUCKET/backups/" || log "WARNING: S3 upload failed"
fi

# 7. Summary
log "📊 Backup Summary:"
log "   - Database: $DB_NAME"
log "   - File: $BACKUP_FILE_GZ"
log "   - Size: $BACKUP_SIZE"
log "   - Timestamp: $TIMESTAMP"

log "✅ Backup process completed successfully!"

exit 0

# =============================================================================
# Usage
# =============================================================================
# 1. Manual Backup:
#    ./backup.sh
#
# 2. Cron Job (Daily at 3 AM):
#    0 3 * * * /opt/bingo-party/deploy/backup.sh >> /var/log/bingo-backup.log 2>&1
#
# 3. Environment Variables:
#    export POSTGRES_PASSWORD=your_password
#    export AWS_S3_BUCKET=your-backup-bucket
# =============================================================================
