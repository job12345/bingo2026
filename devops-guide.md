# 🚀 Bingo Party Enterprise – DevOps Guide (ภาษาไทย)

**DevOps Engineer**: เม
**วันที่จัดทำ**: 12 มกราคม 2026
**เวอร์ชัน**: 1.0
**สถานะ**: Production Ready ✅

---

## 📑 สารบัญ

1. [ภาพรวม DevOps](#1-ภาพรวม-devops)
2. [Development Environment Setup (macOS)](#2-development-environment-setup-macos)
3. [Docker Environment](#3-docker-environment)
4. [CI/CD Pipeline (GitHub Actions)](#4-cicd-pipeline-github-actions)
5. [Deployment Guide](#5-deployment-guide)
6. [Monitoring & Logging](#6-monitoring--logging)
7. [Backup & Recovery](#7-backup--recovery)
8. [Troubleshooting](#8-troubleshooting)
9. [Cost Estimation](#9-cost-estimation)
10. [Security Checklist](#10-security-checklist)

---

## 1. ภาพรวม DevOps

### 1.1 Environments

ระบบ Bingo Party Enterprise มี 3 Environments:

```
┌─────────────────────────────────────────────────────────────┐
│                    Development (Local)                      │
│  - macOS Environment                                        │
│  - Docker Compose (PostgreSQL + Redis)                      │
│  - Hot Reload (npm run start:dev)                           │
│  - Ports: API 8001 | WS 8002 | PostgreSQL 5432 | Redis 6379│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                         Staging                             │
│  - URL: https://staging.bingoparty.com                      │
│  - Docker Compose on DigitalOcean Droplet                   │
│  - Auto Deploy from 'staging' branch                        │
│  - Testing Environment (UAT)                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        Production                           │
│  - URL: https://bingoparty.com                              │
│  - Docker Swarm / Kubernetes (Future)                       │
│  - Manual Approval Required                                 │
│  - High Availability + Auto Scaling                         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Component | Technology | Version | Port |
|-----------|-----------|---------|------|
| **Backend** | NestJS | 10.3 | 8001 (HTTP), 8002 (WS) |
| **Frontend** | React + Vite | 18.2 | 3000 |
| **Database** | PostgreSQL | 16 | 5432 |
| **Cache** | Redis | 7 | 6379 |
| **Container** | Docker | 24.x | - |
| **CI/CD** | GitHub Actions | - | - |
| **Monitoring** | Sentry + Grafana | - | - |

---

## 2. Development Environment Setup (macOS)

### 2.1 ติดตั้ง Prerequisites

#### ✅ Step 1: ติดตั้ง Homebrew (ถ้ายังไม่มี)

```bash
# ติดตั้ง Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# ตรวจสอบ Version
brew --version
```

#### ✅ Step 2: ติดตั้ง Docker Desktop for Mac

```bash
# ดาวน์โหลดจาก: https://www.docker.com/products/docker-desktop/
# หรือใช้ Homebrew
brew install --cask docker

# เปิด Docker Desktop และรอจนกว่าจะพร้อม
# ตรวจสอบ
docker --version
docker-compose --version
```

#### ✅ Step 3: ติดตั้ง Node.js (LTS)

```bash
# ติดตั้ง Node.js v20 (LTS)
brew install node@20

# ตรวจสอบ Version
node --version   # v20.x.x
npm --version    # v10.x.x
```

#### ✅ Step 4: ติดตั้ง Git

```bash
# ติดตั้ง Git
brew install git

# ตั้งค่า Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# ตรวจสอบ
git --version
```

### 2.2 Clone Repository

```bash
# Clone โปรเจค
git clone https://github.com/your-org/bingo-party-enterprise.git
cd bingo-party-enterprise

# ตรวจสอบ Structure
tree -L 2 -I 'node_modules'
```

**โครงสร้างโปรเจค:**

```
bingo-party-enterprise/
├── bingo-backend/              # NestJS Backend
│   ├── prisma/                 # Database Schema & Migrations
│   ├── src/                    # Source Code
│   ├── test/                   # Tests
│   ├── package.json
│   └── .env.example
├── bingo-frontend/             # React Frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── docker-compose.yml          # Docker Compose (Dev)
├── .env.example                # Environment Variables Template
├── deploy/                     # Deployment Scripts
│   ├── backup.sh
│   ├── rollback.sh
│   └── deploy.sh
└── .github/                    # CI/CD Pipeline
    └── workflows/
        └── ci-cd.yml
```

### 2.3 ตั้งค่า Environment Variables

#### Backend Environment

```bash
# เข้าโฟลเดอร์ Backend
cd bingo-backend

# คัดลอก .env.example เป็น .env
cp .env.example .env

# แก้ไขค่าใน .env
nano .env
```

**ตัวอย่าง `.env` สำหรับ Development:**

```bash
# Environment
NODE_ENV=development

# Server
API_PORT=8001
WS_PORT=8002
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://postgres:postgres_dev_password@localhost:5432/bingo_party?schema=public"

# Redis
REDIS_URL="redis://:redis_dev_password@localhost:6379"

# JWT (สร้าง Secret Key ใหม่!)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this
REFRESH_TOKEN_EXPIRATION=7d

# Google OAuth (สมัครได้ที่ https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8001/auth/google/callback
```

#### Frontend Environment

```bash
# เข้าโฟลเดอร์ Frontend
cd ../bingo-frontend

# คัดลอก .env.example เป็น .env
cp .env.example .env

# แก้ไขค่า
nano .env
```

**ตัวอย่าง `.env` สำหรับ Frontend:**

```bash
VITE_API_URL=http://localhost:8001
VITE_WS_URL=ws://localhost:8002
VITE_APP_NAME=Bingo Party Enterprise
```

### 2.4 เริ่มต้น Docker Services

```bash
# กลับไปที่ Root Directory
cd ..

# เริ่มต้น PostgreSQL + Redis
docker-compose up -d

# ตรวจสอบสถานะ
docker-compose ps

# ดู Logs
docker-compose logs -f
```

**ตรวจสอบว่า Services ทำงาน:**

```bash
# ตรวจสอบ PostgreSQL
docker exec -it bingo-postgres psql -U postgres -d bingo_party -c "SELECT version();"

# ตรวจสอบ Redis
docker exec -it bingo-redis redis-cli -a redis_dev_password ping
# ต้องได้ PONG
```

### 2.5 ติดตั้ง Dependencies และ Setup Database

#### Backend Setup

```bash
cd bingo-backend

# ติดตั้ง Dependencies
npm install

# สร้าง Prisma Client
npx prisma generate

# รัน Database Migration
npx prisma migrate dev

# Seed ข้อมูลเริ่มต้น (ถ้ามี)
npx prisma db seed
```

#### Frontend Setup

```bash
cd ../bingo-frontend

# ติดตั้ง Dependencies
npm install
```

### 2.6 รัน Development Server

#### เปิด Terminal 2 หน้าต่าง:

**Terminal 1: Backend**

```bash
cd bingo-backend
npm run start:dev
```

**Terminal 2: Frontend**

```bash
cd bingo-frontend
npm run dev
```

### 2.7 ทดสอบระบบ

เปิดเบราว์เซอร์:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api (Swagger Docs)
- **Backend Health**: http://localhost:8001/health
- **pgAdmin**: http://localhost:5050 (admin@bingo.local / admin123)
- **Redis Commander**: http://localhost:8081

---

## 3. Docker Environment

### 3.1 Docker Compose Services

**ไฟล์: `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_dev_password
      POSTGRES_DB: bingo_party
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass redis_dev_password
    volumes:
      - redis_data:/data

  pgadmin:
    image: dpage/pgadmin4
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@bingo.local
      PGADMIN_DEFAULT_PASSWORD: admin123

  redis-commander:
    image: rediscommander/redis-commander
    ports:
      - "8081:8081"
    environment:
      - REDIS_HOSTS=local:redis:6379:0:redis_dev_password
```

### 3.2 คำสั่ง Docker ที่ใช้บ่อย

```bash
# เริ่มต้นทุก Services
docker-compose up -d

# หยุดทุก Services
docker-compose down

# ลบข้อมูลทั้งหมด (⚠️ ระวัง!)
docker-compose down -v

# ดู Logs
docker-compose logs -f [service-name]

# Restart Service
docker-compose restart postgres

# ตรวจสอบสถานะ
docker-compose ps

# เข้า PostgreSQL CLI
docker exec -it bingo-postgres psql -U postgres -d bingo_party

# เข้า Redis CLI
docker exec -it bingo-redis redis-cli -a redis_dev_password
```

### 3.3 Port Management (macOS)

**ตรวจสอบ Ports ที่ใช้อยู่:**

```bash
# ดู Ports ที่ใช้งานอยู่
lsof -i -P | grep LISTEN

# ดู Port เฉพาะ
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8001  # Backend API
lsof -i :3000  # Frontend

# Kill Process ที่ใช้ Port
kill -9 <PID>
```

**⚠️ ป้องกัน Port ชน:**

ถ้า Port ชนกับเว็บอื่น ให้เปลี่ยน Port ใน `docker-compose.yml`:

```yaml
postgres:
  ports:
    - "5433:5432"  # เปลี่ยนจาก 5432 → 5433
```

---

## 4. CI/CD Pipeline (GitHub Actions)

### 4.1 Pipeline Workflow

**ไฟล์: `.github/workflows/ci-cd.yml`**

Pipeline มี 8 Jobs:

```
1. lint              - ESLint + Prettier + TypeScript Check
2. test-backend      - Unit Tests + Coverage
3. test-frontend     - Frontend Tests + Build
4. test-e2e          - E2E Tests (Playwright)
5. security-audit    - npm audit + Snyk
6. build-docker      - Build & Push Docker Images
7. deploy-staging    - Deploy to Staging (Auto)
8. deploy-production - Deploy to Production (Manual Approval)
```

### 4.2 ตั้งค่า GitHub Secrets

เข้า **GitHub Repository → Settings → Secrets and variables → Actions**

เพิ่ม Secrets ต่อไปนี้:

#### Docker Hub

```
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password
```

#### Staging Server

```
STAGING_HOST=staging.bingoparty.com
STAGING_USER=deploy
STAGING_SSH_KEY=<Private SSH Key>
STAGING_URL=https://staging.bingoparty.com
```

#### Production Server

```
PROD_HOST=bingoparty.com
PROD_USER=deploy
PROD_SSH_KEY=<Private SSH Key>
```

#### Notifications

```
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK
```

#### Security

```
SNYK_TOKEN=your-snyk-api-token
```

### 4.3 การทำงานของ Pipeline

#### เมื่อ Push ไป `develop` branch:

```
✅ Run Linting
✅ Run Tests
✅ Security Audit
❌ No Deployment
```

#### เมื่อ Push ไป `staging` branch:

```
✅ Run Linting
✅ Run Tests
✅ Security Audit
✅ Build Docker Images
✅ Deploy to Staging (Auto)
✅ Send Slack Notification
```

#### เมื่อ Push ไป `main` branch:

```
✅ Run Linting
✅ Run Tests
✅ Security Audit
✅ Build Docker Images
⏸️  Wait for Manual Approval
✅ Deploy to Production
✅ Send Slack Notification
```

---

## 5. Deployment Guide

### 5.1 Staging Deployment (Automatic)

**Trigger:**

```bash
# Merge to staging branch
git checkout staging
git merge develop
git push origin staging
```

**GitHub Actions จะทำ:**

1. ✅ Run Tests
2. ✅ Build Docker Images
3. ✅ SSH to Staging Server
4. ✅ Pull Latest Images
5. ✅ Run Database Migrations
6. ✅ Restart Services
7. ✅ Health Check
8. ✅ Notify Slack

### 5.2 Production Deployment (Manual Approval)

**Trigger:**

```bash
# Merge to main branch
git checkout main
git merge staging
git push origin main
```

**GitHub Actions จะ:**

1. ✅ Run Tests
2. ✅ Build Docker Images
3. ⏸️ **รอ Manual Approval** (GitHub Environments)
4. ✅ Create Backup
5. ✅ Deploy to Production
6. ✅ Run Migrations
7. ✅ Health Check
8. ✅ Notify Slack

**Manual Approval:**

- เข้า GitHub Actions → Deploy to Production
- กด "Review deployments" → "Approve and deploy"

### 5.3 Manual Deployment (SSH)

#### SSH เข้า Server

```bash
# Development
ssh user@dev.bingoparty.com

# Staging
ssh deploy@staging.bingoparty.com

# Production
ssh deploy@bingoparty.com
```

#### Deploy Script

```bash
cd /opt/bingo-party

# Deploy to Production
./deploy/deploy.sh production

# Deploy to Staging
./deploy/deploy.sh staging
```

### 5.4 Rollback (กรณีเกิด Error)

**Automatic Rollback:**

- ถ้า Health Check ล้มเหลว → Auto Rollback

**Manual Rollback:**

```bash
ssh deploy@bingoparty.com
cd /opt/bingo-party
./deploy/rollback.sh
```

---

## 6. Monitoring & Logging

### 6.1 Sentry (Error Tracking)

#### Setup Sentry

```bash
# ติดตั้ง Sentry
cd bingo-backend
npm install @sentry/node @sentry/integrations

cd ../bingo-frontend
npm install @sentry/react
```

#### Backend Configuration

**ไฟล์: `main.ts`**

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

#### Frontend Configuration

**ไฟล์: `main.tsx`**

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
});
```

### 6.2 Logging Strategy

#### ใช้ Winston Logger

```bash
cd bingo-backend
npm install winston winston-daily-rotate-file
```

**ไฟล์: `src/common/logger.ts`**

```typescript
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json(),
  ),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
    new transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
  ],
});

export default logger;
```

### 6.3 Grafana + Prometheus (Advanced)

**docker-compose.monitoring.yml:**

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## 7. Backup & Recovery

### 7.1 Automated Backup

**Cron Job (Daily at 3 AM):**

```bash
# เข้า Production Server
ssh deploy@bingoparty.com

# แก้ไข Crontab
crontab -e

# เพิ่มบรรทัดนี้
0 3 * * * /opt/bingo-party/deploy/backup.sh >> /var/log/bingo-backup.log 2>&1
```

**Backup Script:**

```bash
./deploy/backup.sh
```

**สิ่งที่ Backup:**

1. ✅ PostgreSQL Database (Full Dump)
2. ✅ Redis Snapshot (RDB)
3. ✅ Uploaded Files (Payment Slips)
4. ✅ Environment Variables

**Backup Location:**

- Local: `/backups/bingo-party/`
- S3: `s3://my-backup-bucket/backups/`

### 7.2 Manual Backup

```bash
# PostgreSQL Backup
pg_dump -U postgres -d bingo_party > backup_$(date +%Y%m%d).sql

# Compress
gzip backup_$(date +%Y%m%d).sql

# Upload to S3 (Optional)
aws s3 cp backup_$(date +%Y%m%d).sql.gz s3://my-backup-bucket/
```

### 7.3 Restore from Backup

```bash
# ดาวน์โหลด Backup (ถ้าเก็บใน S3)
aws s3 cp s3://my-backup-bucket/backup_20260112.sql.gz .

# Decompress
gunzip backup_20260112.sql.gz

# Restore
psql -U postgres -d bingo_party < backup_20260112.sql
```

---

## 8. Troubleshooting

### 8.1 Port Already in Use

**ปัญหา:**

```
Error: listen EADDRINUSE: address already in use :::8001
```

**วิธีแก้:**

```bash
# หา Process ที่ใช้ Port
lsof -i :8001

# Kill Process
kill -9 <PID>

# หรือเปลี่ยน Port
# แก้ไขใน .env
API_PORT=8003
```

### 8.2 Docker Services ไม่ทำงาน

**ปัญหา:**

```
ERROR: Connection to postgres failed
```

**วิธีแก้:**

```bash
# ตรวจสอบสถานะ
docker-compose ps

# Restart Services
docker-compose restart postgres

# ดู Logs
docker-compose logs postgres

# หยุดและเริ่มใหม่
docker-compose down
docker-compose up -d
```

### 8.3 Database Migration ล้มเหลว

**ปัญหา:**

```
Prisma Migrate failed
```

**วิธีแก้:**

```bash
# Reset Database (⚠️ Development Only!)
npx prisma migrate reset

# Re-run Migration
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

### 8.4 WebSocket Connection Failed

**ปัญหา:**

```
WebSocket connection failed
```

**วิธีแก้:**

1. ตรวจสอบว่า Backend WS Server ทำงาน (Port 8002)
2. ตรวจสอบ CORS Configuration
3. ตรวจสอบ Firewall Rules

```bash
# ทดสอบ WebSocket
wscat -c ws://localhost:8002

# ตรวจสอบ CORS ใน main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

---

## 9. Cost Estimation

### 9.1 Development (Local)

| Item | Cost |
|------|------|
| macOS Machine | 0 บาท (ใช้เครื่องตัวเอง) |
| Docker Desktop | 0 บาท (Free) |
| **Total** | **0 บาท/เดือน** |

### 9.2 Staging Environment

| Item | Spec | Cost (USD/month) | Cost (THB/month) |
|------|------|------------------|------------------|
| **DigitalOcean Droplet** | 2 vCPU, 4 GB RAM | $24 | ~840 บาท |
| **Managed PostgreSQL** | 1 GB RAM | $15 | ~525 บาท |
| **Managed Redis** | 1 GB RAM | $15 | ~525 บาท |
| **Spaces (S3-like)** | 250 GB Storage | $5 | ~175 บาท |
| **Total** | - | **$59** | **~2,065 บาท/เดือน** |

### 9.3 Production Environment (Small Scale)

| Item | Spec | Cost (USD/month) | Cost (THB/month) |
|------|------|------------------|------------------|
| **DigitalOcean Droplet** | 4 vCPU, 8 GB RAM | $48 | ~1,680 บาท |
| **Managed PostgreSQL** | 4 GB RAM | $60 | ~2,100 บาท |
| **Managed Redis** | 2 GB RAM | $30 | ~1,050 บาท |
| **Spaces (S3-like)** | 500 GB Storage | $10 | ~350 บาท |
| **Load Balancer** | 10,000 req/sec | $12 | ~420 บาท |
| **Backup Storage** | 100 GB | $5 | ~175 บาท |
| **Monitoring (Sentry)** | Team Plan | $26 | ~910 บาท |
| **Domain + SSL** | .com Domain | $12/year | ~35 บาท/เดือน |
| **Total** | - | **$203** | **~7,105 บาท/เดือน** |

### 9.4 Production Environment (Scale: 1,000 Users)

| Item | Spec | Cost (USD/month) | Cost (THB/month) |
|------|------|------------------|------------------|
| **DigitalOcean Droplets** | 8 vCPU, 16 GB RAM × 2 | $192 | ~6,720 บาท |
| **Managed PostgreSQL** | 16 GB RAM (HA) | $240 | ~8,400 บาท |
| **Managed Redis** | 8 GB RAM (HA) | $120 | ~4,200 บาท |
| **Load Balancer** | - | $12 | ~420 บาท |
| **CDN (Cloudflare)** | Pro Plan | $20 | ~700 บาท |
| **Monitoring** | Professional | $99 | ~3,465 บาท |
| **Backup Storage** | 500 GB | $25 | ~875 บาท |
| **Total** | - | **$708** | **~24,780 บาท/เดือน** |

**💡 หมายเหตุ:** อัตราแลกเปลี่ยน 1 USD = 35 บาท

---

## 10. Security Checklist

### 10.1 Development Security

- [ ] ✅ ไม่เผยแพร่ไฟล์ `.env` (เพิ่มใน `.gitignore`)
- [ ] ✅ ใช้ Strong Passwords สำหรับ Database & Redis
- [ ] ✅ เปลี่ยน JWT Secret Key เป็นค่าที่รันดอม
- [ ] ✅ Update Dependencies ให้ใหม่อยู่เสมอ
- [ ] ✅ ใช้ HTTPS บน Production

### 10.2 Production Security

- [ ] ✅ Enable Firewall (UFW/iptables)
- [ ] ✅ Disable Root SSH Login
- [ ] ✅ Use SSH Key Authentication
- [ ] ✅ Enable SSL/TLS (Let's Encrypt)
- [ ] ✅ Rate Limiting (Global + Per-Endpoint)
- [ ] ✅ CORS Configuration (Whitelist Only)
- [ ] ✅ Security Headers (Helmet.js)
- [ ] ✅ Input Validation (class-validator)
- [ ] ✅ SQL Injection Prevention (Prisma)
- [ ] ✅ XSS Prevention (DOMPurify)
- [ ] ✅ Audit Logs (All Critical Actions)
- [ ] ✅ Backup Strategy (Daily + S3)
- [ ] ✅ Monitoring (Sentry + Grafana)
- [ ] ✅ Secrets Management (Environment Variables)

---

## 📊 สรุป

### ✅ สิ่งที่ได้จาก Guide นี้

1. ✅ **Development Environment** พร้อมใช้บน macOS
2. ✅ **Docker Compose** สำหรับ PostgreSQL + Redis
3. ✅ **CI/CD Pipeline** (GitHub Actions) ครบถ้วน
4. ✅ **Deployment Scripts** (backup, rollback, deploy)
5. ✅ **Monitoring Setup** (Sentry + Logging)
6. ✅ **Cost Estimation** แต่ละ Environment
7. ✅ **Security Checklist** ครบถ้วน

### 🎯 ขั้นตอนถัดไป

1. **Developer** → ตั้งค่า Development Environment ตาม Guide
2. **QA Engineer** → ทดสอบ CI/CD Pipeline
3. **Backend Developer** → Deploy Backend to Staging
4. **Frontend Developer** → Deploy Frontend to Staging
5. **DevOps** → Monitor และปรับแต่ง Performance

---

**เอกสารนี้จัดทำโดย**: เม (DevOps Engineer) 💕
**วันที่**: 12 มกราคม 2026
**สถานะ**: ✅ **Production Ready**

---

## 📞 คำสั่งสรุป (Quick Reference)

```bash
# =============================================================================
# Development
# =============================================================================
# เริ่มต้น Docker Services
docker-compose up -d

# Backend
cd bingo-backend
npm install
npx prisma migrate dev
npm run start:dev

# Frontend
cd bingo-frontend
npm install
npm run dev

# =============================================================================
# Deployment
# =============================================================================
# Deploy to Staging (Auto)
git push origin staging

# Deploy to Production (Manual Approval)
git push origin main

# Manual Deploy
ssh deploy@bingoparty.com
cd /opt/bingo-party
./deploy/deploy.sh production

# =============================================================================
# Backup & Rollback
# =============================================================================
# Backup
./deploy/backup.sh

# Rollback
./deploy/rollback.sh

# =============================================================================
# Monitoring
# =============================================================================
# Logs
docker-compose logs -f
tail -f /var/log/bingo-backend.log

# Health Check
curl http://localhost:8001/health

# =============================================================================
```

**ขอให้มีความสุขกับการ Deploy นะคะที่รัก!** 🚀💕
