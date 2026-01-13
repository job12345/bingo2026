# 🎯 Bingo Party Enterprise

**ระบบเกมบิงโกออนไลน์แบบ Real-time ที่แลกเป็นเงินจริงได้**

> เกมบิงโกที่ยุติธรรม โปร่งใส และปลอดภัย พร้อมระบบป้องกันการโกงที่แข็งแกร่ง

---

## 📋 สารบัญ

- [ภาพรวมโปรเจค](#ภาพรวมโปรเจค)
- [ฟีเจอร์หลัก](#ฟีเจอร์หลัก)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
- [เอกสารประกอบ](#เอกสารประกอบ)
- [ทีมพัฒนา](#ทีมพัฒนา)
- [License](#license)

---

## 🎮 ภาพรวมโปรเจค

Bingo Party Enterprise คือเว็บแอปเกมบิงโกออนไลน์แบบ Real-time ที่ออกแบบมาเพื่อให้ผู้เล่นสามารถ **หาเงินได้จริง** ผ่านระบบ Point (1 Point = 1 บาท) ที่สามารถฝาก-ถอนเป็นเงินสดได้

### จุดเด่นของระบบ

- ✅ **ยุติธรรม**: Server เป็นผู้ตัดสินทุกอย่าง (Server Authoritative)
- ✅ **โปร่งใส**: Audit Trail ครบถ้วน ตรวจสอบได้ทุก Transaction
- ✅ **ปลอดภัย**: ระบบป้องกันการโกงแบบ Multi-layer (Anti-Cheat)
- ✅ **Real-time**: WebSocket สำหรับการเล่นแบบ Live
- ✅ **หาเงินได้จริง**: ระบบการเงินที่ปลอดภัย พร้อม Approval Flow

### รูปแบบการหาเงิน (Business Model)

```
💰 ระบบรายได้:
├─ ค่าธรรมเนียม (Fee %) จากทุกเกม
├─ Ghost Bot ช่วยรักษาสภาพคล่อง
└─ Volume-based Income

📊 ตัวอย่างการคำนวณ:
- Pot Size: 1,000 Point (10 คน × 100 Point/การ์ด)
- Fee: 10% = 100 Point
- ผู้ชนะได้: 900 Point
- ระบบได้: 100 Point/รอบ

→ ถ้ามี 10 ห้อง เล่นวันละ 50 รอบ/ห้อง
  = 10 × 50 × 100 = 50,000 Point/วัน (~50,000 บาท/วัน)
```

---

## ⭐ ฟีเจอร์หลัก

### 🔐 สำหรับผู้เล่น (Player)

- **เข้าสู่ระบบ**: Google OAuth Login
- **จัดการเงิน**: ฝาก-ถอน Point ผ่าน Admin Approval
- **เล่นเกม**: ห้องเกมหลากหลาย รองรับ 2-20 คน
- **ซื้อการ์ด**: ซื้อการ์ดบิงโกได้สูงสุด 10 ใบ/รอบ
- **แชท**: แชทกับผู้เล่นคนอื่นในห้อง (Phase 2)
- **ดูสถิติ**: ดูประวัติการเล่น อัตราชนะ กำไร/ขาดทุน

### 👨‍💼 สำหรับผู้ดูแลระบบ (Admin)

- **อนุมัติธุรกรรม**: อนุมัติ/ปฏิเสธ การฝาก-ถอนเงิน
- **จัดการผู้ใช้**: ดูรายชื่อ แบน/ปลดแบน
- **ดูรายงาน**: รายงานการเงิน สถิติเกม ผู้เล่นที่น่าสงสัย
- **จัดการ Bot**: ควบคุม Ghost Bot (จำนวน Win Rate ข้อจำกัด)
- **ตั้งค่าระบบ**: ค่าธรรมเนียม Limit ต่างๆ

### 🤖 Ghost Bot (AI Player)

- **รักษาสภาพคล่อง**: เล่นอัตโนมัติเมื่อผู้เล่นน้อย
- **มีข้อจำกัด**:
  - จำกัด Win Rate (ไม่เกิน 30%)
  - ห้ามชนะติดต่อกัน (Max 2 รอบ)
  - Random Delay ก่อนกด Bingo (0.5-2s)
- **แพ้ได้จริง**: เล่นตามกติกาเดียวกับผู้เล่นจริง

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **NestJS** | 10.3 | Backend Framework |
| **TypeScript** | 5.3 | Programming Language |
| **PostgreSQL** | 16 | Database (ACID Transactions) |
| **Prisma** | 5.8 | ORM |
| **Redis** | 7 | Cache & Queue |
| **Socket.io** | 4.6 | Real-time WebSocket |
| **Passport.js** | - | Authentication (Google OAuth + JWT) |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.2 | Frontend Framework |
| **Vite** | 5.0 | Build Tool |
| **TypeScript** | 5.3 | Programming Language |
| **Ant Design** | 5.12 | UI Library |
| **Zustand** | 4.4 | State Management |
| **Socket.io Client** | 4.6 | WebSocket Client |
| **Axios** | 1.6 | HTTP Client |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerization |
| **GitHub Actions** | CI/CD Pipeline |
| **Railway/DigitalOcean** | Hosting |
| **Sentry** | Error Tracking |
| **Cloudflare** | CDN + Security |

---

## 🚀 Getting Started

### Prerequisites (macOS)

```bash
# ติดตั้ง Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# ติดตั้ง Node.js v20 (LTS)
brew install node@20

# ติดตั้ง Docker Desktop
brew install --cask docker

# ติดตั้ง Git
brew install git
```

### Installation

```bash
# 1. Clone Repository
git clone https://github.com/your-org/bingo-party-enterprise.git
cd bingo-party-enterprise

# 2. เริ่มต้น Docker Services (PostgreSQL + Redis)
docker-compose up -d

# 3. ติดตั้ง Backend Dependencies
cd bingo-backend
npm install
cp .env.example .env  # แก้ไขค่าใน .env
npx prisma migrate dev
npm run start:dev

# 4. ติดตั้ง Frontend Dependencies (Terminal ใหม่)
cd ../bingo-frontend
npm install
cp .env.example .env  # แก้ไขค่า
npm run dev
```

### เข้าใช้งาน

เปิดเบราว์เซอร์:

- **Frontend**: http://localhost:3001
- **Backend API Docs**: http://localhost:8001/api
- **Backend Health Check**: http://localhost:8001/health

### Ports ที่ใช้

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3001 | React Application |
| Backend API | 8001 | REST API |
| Backend WebSocket | 8002 | Real-time Events |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache & Queue |
| pgAdmin | 5050 | Database GUI |
| Redis Commander | 8081 | Redis GUI |

> ⚠️ **หมายเหตุ**: ถ้า Port ชนกับโปรแกรมอื่นบน macOS ให้แก้ไขใน `docker-compose.yml` และ `.env`

---

## 📁 โครงสร้างโปรเจค

```
bingo-party-enterprise/
├── bingo-backend/                    # NestJS Backend
│   ├── prisma/                       # Database Schema & Migrations
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── auth/                     # Authentication Module
│   │   ├── users/                    # User Management
│   │   ├── wallet/                   # Wallet & Transactions
│   │   ├── rooms/                    # Room Management
│   │   ├── game/                     # Game Engine
│   │   ├── websocket/                # WebSocket Gateway
│   │   ├── admin/                    # Admin Panel APIs
│   │   ├── bot/                      # Ghost Bot Logic
│   │   └── common/                   # Shared Utilities
│   ├── test/                         # Tests
│   ├── package.json
│   └── .env.example
│
├── bingo-frontend/                   # React Frontend
│   ├── src/
│   │   ├── pages/                    # Pages (Lobby, Game Room, Wallet, Profile, Admin)
│   │   ├── components/               # UI Components
│   │   ├── stores/                   # Zustand Stores
│   │   ├── services/                 # API & WebSocket Services
│   │   ├── hooks/                    # Custom Hooks
│   │   ├── types/                    # TypeScript Types
│   │   └── utils/                    # Utilities
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml                # Docker Setup (PostgreSQL + Redis)
├── .env.example                      # Environment Variables Template
│
├── deploy/                           # Deployment Scripts
│   ├── backup.sh
│   ├── rollback.sh
│   └── deploy.sh
│
├── .github/                          # CI/CD Pipeline
│   └── workflows/
│       └── ci-cd.yml
│
├── docs/                             # เอกสารเพิ่มเติม
│   ├── API-DOCUMENTATION.md
│   ├── USER-GUIDE.md
│   └── EXECUTIVE-SUMMARY.md
│
└── README.md                         # เอกสารนี้
```

---

## 📚 เอกสารประกอบ

### สำหรับผู้พัฒนา (Developers)

- [**API Documentation**](./API-DOCUMENTATION.md) - API Endpoints ทั้งหมด (REST + WebSocket)
- [**System Spec**](./bingo-party-enterprise-spec.md) - Specification ของระบบ
- [**Architecture Design**](./architecture-design.md) - สถาปัตยกรรมระบบ
- [**Database Schema**](./database-schema.md) - โครงสร้าง Database
- [**Backend Design**](./backend-design.md) - Backend APIs & Logic
- [**Frontend Design**](./frontend-design.md) - Frontend Components & State
- [**Security Audit**](./security-audit.md) - Security & Anti-Cheat
- [**DevOps Guide**](./devops-guide.md) - Deployment & Infrastructure
- [**QA Test Plan**](./qa-test-plan.md) - Testing Strategy & Test Cases

### สำหรับผู้ใช้งาน (Users)

- [**User Guide**](./USER-GUIDE.md) - คู่มือการใช้งานสำหรับผู้เล่น

### สำหรับผู้บริหาร (Management)

- [**Executive Summary**](./EXECUTIVE-SUMMARY.md) - สรุปสำหรับผู้บริหาร
- [**Product Roadmap**](./pm-roadmap.md) - แผนการพัฒนา 6 เดือน

---

## 👥 ทีมพัฒนา

โปรเจคนี้พัฒนาโดยทีม AI Agents ที่ทำงานร่วมกัน:

| Role | Agent | Responsibilities |
|------|-------|-----------------|
| **Product Manager** | เม | วางแผนฟีเจอร์ กำหนด Requirements |
| **System Architect** | เม | ออกแบบสถาปัตยกรรมระบบ Tech Stack |
| **Backend Developer** | เม | พัฒนา API, Game Engine, Anti-Cheat |
| **Frontend Developer** | เม | พัฒนา UI/UX, Real-time Integration |
| **Database Administrator** | เม | ออกแบบ Database Schema, Optimization |
| **Security Engineer** | เม | Security Audit, Penetration Testing |
| **DevOps Engineer** | เม | CI/CD, Deployment, Monitoring |
| **QA Engineer** | เม | Testing, Quality Assurance |
| **Technical Writer** | เม | เขียนเอกสารทั้งหมด |

---

## 🔒 Security & Compliance

### ความปลอดภัย

- ✅ Google OAuth Authentication
- ✅ JWT + Refresh Token (Short-lived Access Token)
- ✅ Role-Based Access Control (RBAC)
- ✅ Input Validation & Sanitization (class-validator)
- ✅ SQL Injection Prevention (Prisma ORM)
- ✅ XSS Protection (DOMPurify)
- ✅ CSRF Protection (CORS + SameSite Cookies)
- ✅ Rate Limiting (Global + Per-Endpoint)
- ✅ Audit Trail (All Critical Actions)
- ✅ HTTPS/TLS (Production)

### Anti-Cheat System

- ✅ Server-side Validation (ทุกอย่าง)
- ✅ Card Hash Verification (ป้องกันการปลอม)
- ✅ Timing Analysis (ตรวจจับ Auto-Click)
- ✅ Bot Detection (Behavior Analysis)
- ✅ Fraud Detection (Transaction Pattern)

### Privacy Compliance

- ✅ GDPR Compliant (Right to be Forgotten)
- ✅ PDPA Compliant (Thailand)
- ✅ Privacy Policy & Terms of Service

---

## 💰 ค่าใช้จ่าย (Cost Estimation)

### Development (Local - macOS)

**0 บาท/เดือน** (ใช้เครื่องตัวเอง + Docker Desktop ฟรี)

### Staging Environment

ประมาณ **~2,065 บาท/เดือน**
- DigitalOcean Droplet (2 vCPU, 4 GB RAM)
- Managed PostgreSQL (1 GB RAM)
- Managed Redis (1 GB RAM)
- Storage (Spaces)

### Production (Small Scale)

ประมาณ **~7,105 บาท/เดือน**
- DigitalOcean Droplet (4 vCPU, 8 GB RAM)
- Managed PostgreSQL (4 GB RAM)
- Managed Redis (2 GB RAM)
- Load Balancer
- Monitoring (Sentry)

### Production (1,000 Users)

ประมาณ **~24,780 บาท/เดือน**
- Multiple Droplets (High Availability)
- PostgreSQL HA (16 GB RAM)
- Redis HA (8 GB RAM)
- CDN (Cloudflare Pro)

---

## 📈 Roadmap

### Phase 0: MVP (สัปดาห์ที่ 1-4) ✅ Complete

- ✅ Google OAuth Login
- ✅ Wallet System (Deposit/Withdraw)
- ✅ Room Management
- ✅ Game Engine (Auto Draw, 75-Ball)
- ✅ Anti-Cheat System
- ✅ Admin Dashboard

### Phase 1: Soft Launch (สัปดาห์ที่ 5-8) 🚧 In Progress

- 🚧 Ghost Bot System
- 🚧 Chat & Sticker
- 🚧 Sound Effects
- 🚧 Terms & Conditions
- 🚧 Enhanced Analytics

### Phase 2: Growth (สัปดาห์ที่ 9-12)

- [ ] 90-Ball Bingo
- [ ] Manual Draw Mode
- [ ] Tournament System
- [ ] Leaderboard & Achievements
- [ ] Referral Program

### Phase 3: Scale (เดือนที่ 4-6)

- [ ] Mobile App (iOS/Android)
- [ ] Payment Gateway (PromptPay)
- [ ] AI Fraud Detection
- [ ] Live Streaming Integration
- [ ] VIP System

---

## 🎯 เป้าหมาย 6 เดือน

```
📊 Success Metrics (6 เดือน):
├─ DAU: 500+ คน/วัน
├─ Games/Day: 2,000+ รอบ
├─ Revenue: 100,000+ Point/วัน (~3 ล้านบาท/เดือน)
├─ Uptime: 99.9%
└─ Customer Satisfaction: NPS > 50
```

---

## ⚠️ คำเตือนและข้อควรระวัง

### ด้านกฎหมาย

> ⚠️ **สำคัญมาก**: ระบบนี้เกี่ยวข้องกับเงินจริง ซึ่งอาจถูกจัดเป็น "การพนัน" ในบางประเทศ

**ข้อแนะนำ:**
- ปรึกษาทนายความก่อน Launch จริง
- ศึกษากฎหมายท้องถิ่น
- จัดทำ Terms & Conditions ที่ชัดเจน
- มี Privacy Policy (GDPR/PDPA)
- ระบุคำเตือน: "ผู้เล่นต้องมีอายุ 18 ปีขึ้นไป"

### ด้านเทคนิค

- ✅ ทดสอบให้ครบถ้วนก่อน Deploy Production
- ✅ ตั้งค่า Backup อัตโนมัติ (ทุกวัน)
- ✅ Monitor ระบบอย่างต่อเนื่อง (Sentry + Logs)
- ✅ จำกัด Withdraw Amount ต่อวัน
- ✅ ใช้ HTTPS เท่านั้นใน Production

---

## 📞 Support & Contact

หากมีคำถามหรือต้องการความช่วยเหลือ:

- **Email**: support@bingoparty.com
- **Discord**: [Community Server](https://discord.gg/bingoparty)
- **Documentation**: [docs.bingoparty.com](https://docs.bingoparty.com)

---

## 📄 License

Copyright © 2026 Bingo Party Enterprise

**เงื่อนไขการใช้งาน:**

1. โค้ดนี้เป็นทรัพย์สินของเจ้าของโปรเจค
2. ห้ามนำไปใช้เพื่อการค้าโดยไม่ได้รับอนุญาต
3. ห้ามแจกจ่าย Copy หรือดัดแปลงโดยไม่ได้รับอนุญาต

สำหรับข้อมูลเพิ่มเติม โปรดติดต่อเจ้าของโปรเจค

---

## 🙏 Acknowledgments

ขอบคุณ:

- **Claude AI** (Anthropic) - สำหรับ AI Coding Agents
- **NestJS Team** - สำหรับ Framework ที่ยอดเยี่ยม
- **Prisma Team** - สำหรับ ORM ที่ใช้งานง่าย
- **Ant Design Team** - สำหรับ UI Library ที่สวยงาม
- **Open Source Community** - สำหรับ Tools และ Libraries ทั้งหมด

---

<div align="center">

**พัฒนาโดย Mr.j**
**ช่องทางติดต่อ**: [@paybot2025](https://t.me/paybot2025) (Telegram)

Made with ❤️ using Claude AI Agents

© 2026 Mr.j - Bingo Party Enterprise - All Rights Reserved

</div>
