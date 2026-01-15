# 🚀 Bingo Party Enterprise - Deployment Scripts

**โดย**: เม (DevOps Engineer)
**วันที่**: 12 มกราคม 2026

---

## 📁 โครงสร้างโฟลเดอร์

```
deploy/
├── backup.sh                      # Backup Database Script
├── rollback.sh                    # Rollback to Previous Version
├── deploy.sh                      # Deployment Script
├── docker-compose.monitoring.yml  # Monitoring Stack (Grafana + Prometheus)
├── prometheus/
│   └── prometheus.yml             # Prometheus Configuration
├── grafana/
│   └── provisioning/
│       └── datasources/
│           └── datasources.yml    # Grafana Data Sources
├── loki/
│   └── loki-config.yml            # Loki Configuration
└── promtail/
    └── promtail-config.yml        # Promtail Configuration
```

---

## 🛠️ Scripts Usage

> หมายเหตุ: สคริปต์ deploy ใช้ไฟล์ docker compose หลักคือ `docker-compose.app.yml` (อยู่ที่ root ของโปรเจค)

### 1. Deploy Script

**คำอธิบาย:** Deploy to Production/Staging/Development

```bash
# Deploy to Production
./deploy.sh production

# Deploy to Staging
./deploy.sh staging

# Deploy to Development
./deploy.sh development

# Build Images Before Deploy
BUILD_IMAGES=true ./deploy.sh production
```

**สิ่งที่ Script ทำ:**

1. ✅ Create Pre-deployment Backup
2. ✅ Pull Latest Code (if Git)
3. ✅ Pull Latest Docker Images (ถ้ามี)
4. ✅ Stop Old Containers (Graceful)
5. ✅ Run Database Migrations (รันใน container ของ backend)
6. ✅ Start New Containers
7. ✅ Health Check (5 retries)
8. ✅ Cleanup Old Docker Resources
9. ✅ Send Slack Notification

**หาก Health Check ล้มเหลว:**

- Auto Rollback to Previous Version

---

### 2. Backup Script

**คำอธิบาย:** Backup PostgreSQL Database

```bash
# Manual Backup
./backup.sh

# Automated Backup (Cron)
# ทุกวัน เวลา 03:00 น.
0 3 * * * /opt/bingo-party/deploy/backup.sh >> /var/log/bingo-backup.log 2>&1
```

**สิ่งที่ Script ทำ:**

1. ✅ Create Backup Directory
2. ✅ Run `pg_dump` (ภายใน postgres container)
3. ✅ Compress with `gzip`
4. ✅ Verify Backup File
5. ✅ Clean Old Backups (30 days)
6. ✅ Upload to S3 (Optional)

**Backup Location:**

- Local: `/backups/bingo-party/bingo_party_YYYYMMDD_HHMMSS.sql.gz`
- S3: `s3://your-bucket/backups/`

**Retention:** 30 วัน

---

### 3. Rollback Script

**คำอธิบาย:** Rollback to Previous Version

```bash
# Rollback (Without Database Restore)
./rollback.sh

# Rollback with Database Restore
RESTORE_DATABASE=true ./rollback.sh
```

**สิ่งที่ Script ทำ:**

1. ✅ Stop Current Services
2. ✅ Checkout last successful git commit (ถ้ามี)
3. ✅ Build Docker images
4. ✅ Restore Database (Optional)
5. ✅ Start Previous Version
6. ✅ Health Check
7. ✅ Send Slack Notification

**⚠️ คำเตือน:**

- Database Restore จะคืนค่าไปยัง Backup ล่าสุด
- ข้อมูลหลัง Backup จะหายไป

---

## 📊 Monitoring Setup

### เริ่มต้น Monitoring Stack

```bash
# เริ่มต้น Grafana + Prometheus + Loki
docker-compose -f docker-compose.monitoring.yml up -d

# ตรวจสอบสถานะ
docker-compose -f docker-compose.monitoring.yml ps

# ดู Logs
docker-compose -f docker-compose.monitoring.yml logs -f
```

### เข้าใช้งาน Dashboards

| Service | URL | Username | Password |
|---------|-----|----------|----------|
| **Grafana** | http://localhost:3001 | admin | admin123 |
| **Prometheus** | http://localhost:9090 | - | - |
| **Node Exporter** | http://localhost:9100 | - | - |

### Metrics ที่ Collect

1. ✅ **Server Metrics** (CPU, Memory, Disk, Network)
2. ✅ **Application Metrics** (HTTP Requests, Response Time)
3. ✅ **Database Metrics** (Connections, Query Time)
4. ✅ **Redis Metrics** (Operations, Memory Usage)
5. ✅ **WebSocket Metrics** (Connections, Events)

### Logs ที่ Collect

1. ✅ **System Logs** (`/var/log/`)
2. ✅ **Docker Container Logs**
3. ✅ **Backend Application Logs**

---

## 🔧 Environment Variables Required

### Deployment Scripts

```bash
# PostgreSQL
export POSTGRES_PASSWORD=your_password

# AWS S3 (for Backup)
export AWS_S3_BUCKET=your-backup-bucket
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key

# Slack Notifications
export SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK
```

---

## 📝 ตัวอย่างการใช้งาน

### Scenario 1: Deploy to Production (Manual)

```bash
# 1. SSH เข้า Production Server
ssh deploy@bingoparty.com

# 2. เข้าโฟลเดอร์โปรเจค
cd /opt/bingo-party

# 3. Pull Latest Code
git pull origin main

# 4. Deploy
./deploy/deploy.sh production

# 5. ตรวจสอบ Health
curl https://bingoparty.com/health
```

### Scenario 2: Automated Backup (Cron)

```bash
# 1. แก้ไข Crontab
crontab -e

# 2. เพิ่มบรรทัดนี้ (Backup ทุกวัน เวลา 03:00 น.)
0 3 * * * /opt/bingo-party/deploy/backup.sh >> /var/log/bingo-backup.log 2>&1

# 3. บันทึกและออก
# :wq

# 4. ตรวจสอบ Crontab
crontab -l
```

### Scenario 3: Rollback หลัง Deploy ล้มเหลว

```bash
# 1. SSH เข้า Production Server
ssh deploy@bingoparty.com

# 2. Rollback
cd /opt/bingo-party
./deploy/rollback.sh

# 3. ตรวจสอบ Health
curl https://bingoparty.com/health

# 4. ตรวจสอบ Logs
docker-compose logs -f backend
```

---

## 🔍 Troubleshooting

### ปัญหา: Backup Script ล้มเหลว

**Error:**

```
pg_dump: error: connection to server failed
```

**วิธีแก้:**

1. ตรวจสอบว่า PostgreSQL ทำงานอยู่

```bash
docker-compose ps postgres
```

2. ตรวจสอบ Environment Variables

```bash
echo $POSTGRES_PASSWORD
```

3. ทดสอบ Connection

```bash
docker exec -it bingo-postgres psql -U postgres -d bingo_party -c "SELECT 1;"
```

### ปัญหา: Deploy Script ล้มเหลว

**Error:**

```
Health check failed after 5 retries
```

**วิธีแก้:**

1. ตรวจสอบ Logs

```bash
docker-compose logs backend
```

2. ตรวจสอบ Database Migration

```bash
cd bingo-backend
npx prisma migrate status
```

3. Rollback

```bash
./deploy/rollback.sh
```

### ปัญหา: Monitoring ไม่ทำงาน

**Error:**

```
Cannot connect to Prometheus
```

**วิธีแก้:**

1. ตรวจสอบ Services

```bash
docker-compose -f docker-compose.monitoring.yml ps
```

2. Restart

```bash
docker-compose -f docker-compose.monitoring.yml restart
```

3. ตรวจสอบ Logs

```bash
docker-compose -f docker-compose.monitoring.yml logs prometheus
```

---

## ✅ Pre-Deployment Checklist

### ก่อน Deploy to Production

- [ ] ✅ รัน Tests ผ่านหมด (Unit + E2E)
- [ ] ✅ Security Audit ผ่าน (npm audit)
- [ ] ✅ Database Migration ผ่าน (Staging)
- [ ] ✅ Backup Database ล่าสุด
- [ ] ✅ Environment Variables ครบถ้วน
- [ ] ✅ SSL Certificate ยังไม่หมดอายุ
- [ ] ✅ แจ้งทีมล่วงหน้า (Maintenance Window)
- [ ] ✅ เตรียม Rollback Plan

### หลัง Deploy

- [ ] ✅ Health Check ผ่าน
- [ ] ✅ ทดสอบ Login
- [ ] ✅ ทดสอบ Core Features
- [ ] ✅ ตรวจสอบ Monitoring Dashboard
- [ ] ✅ ตรวจสอบ Error Logs
- [ ] ✅ แจ้งทีมว่า Deploy สำเร็จ

---

## 📞 Contact & Support

**DevOps Team:**

- Email: devops@bingoparty.com
- Slack: #devops-support

**Emergency Contacts:**

- On-Call Engineer: +66 XX-XXX-XXXX
- CTO: +66 XX-XXX-XXXX

---

**เอกสารนี้จัดทำโดย**: เม (DevOps Engineer) 💕
**วันที่**: 12 มกราคม 2026
**สถานะ**: ✅ **Production Ready**
