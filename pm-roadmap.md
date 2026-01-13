# 📋 Bingo Party Enterprise – Product Roadmap & Requirements

**Product Manager**: เม
**วันที่จัดทำ**: 12 มกราคม 2026
**เวอร์ชัน**: 1.0
**สถานะ**: In Planning

---

## 1. Executive Summary

### 1.1 ภาพรวมโปรเจค
Bingo Party Enterprise คือเว็บแอปเกมบิงโกออนไลน์แบบ Real-time ที่สามารถ **หาเงินได้จริง** ผ่านระบบ Point (1 Point = 1 บาท) ที่แลกเป็นเงินสดได้ ระบบออกแบบมาเพื่อให้เป็นธุรกิจที่ยั่งยืนด้วยรายได้จากค่าธรรมเนียม (Fee) ในการเล่นแต่ละรอบ

### 1.2 Business Model (รูปแบบการหาเงิน)
```
💰 Revenue Stream:
├─ ค่าธรรมเนียม (Fee %) จากทุกเกม
├─ ระบบ Ghost Bot ช่วยรักษาสภาพคล่อง
└─ Volume-based income (ยิ่งเล่นมากยิ่งได้มาก)

📊 ตัวอย่างการคำนวณ:
- Pot Size: 1,000 Point (10 คน × 100 Point/การ์ด)
- Fee: 10% = 100 Point
- ผู้ชนะได้: 900 Point
- ระบบได้: 100 Point/รอบ

→ ถ้ามี 10 ห้อง เล่นวันละ 50 รอบ/ห้อง
  = 10 × 50 × 100 = 50,000 Point/วัน (~50,000 บาท/วัน)
```

### 1.3 เป้าหมายธุรกิจ (3 เดือน)
1. **Phase 1 (MVP)**: ระบบเล่นได้ ฝาก-ถอนได้ ปลอดภัย
2. **Phase 2**: มีผู้เล่นจริง 50-100 คน/วัน
3. **Phase 3**: Scale ให้รองรับ 500+ คน/วัน พร้อมระบบอัตโนมัติ

### 1.4 Core Strengths (จุดแข็ง)
- ✅ ระบบโปร่งใส (Auditable)
- ✅ ป้องกันการโกง (Anti-Cheat)
- ✅ Real-time สนุก
- ✅ แลกเงินได้จริง
- ✅ ระบบการเงินปลอดภัย

---

## 2. MVP (Minimum Viable Product) – Phase 0

### 2.1 เป้าหมาย MVP
> "ระบบต้องเล่นได้จริง ฝาก-ถอนได้จริง และไม่มีช่องโหว่ทางการเงิน"

### 2.2 MVP Features (ฟีเจอร์ขั้นต่ำ)

#### 🔐 A. Authentication & User Management
- [x] Google OAuth Login
- [x] User Profile (Display Name, Avatar)
- [x] Point Balance Display
- [x] Bank Info Management (สำหรับถอนเงิน)

#### 💰 B. Financial System (สำคัญที่สุด!)
- [x] ระบบกระเป๋าเงิน (Wallet) แบบ Transaction-safe
- [x] ฝากเงิน (Deposit) พร้อม Approval Flow
- [x] ถอนเงิน (Withdraw) พร้อม Approval Flow
- [x] Transaction History
- [x] Admin Dashboard สำหรับอนุมัติ

#### 🎮 C. Core Gameplay
- [x] Lobby (ดูรายการห้อง)
- [x] Room Creation (Auto Draw Mode อย่างเดียว)
  - 75-Ball Bingo
  - 1-10 Players
  - Card Price กำหนดได้
- [x] Game Flow ตาม Spec (Section 6-7)
  - Sitting Phase
  - Buying Phase
  - Drawing Phase (Auto)
  - Bingo Race
  - Winner Declaration
- [x] Server-side Game Engine
- [x] WebSocket Real-time

#### 🛡️ D. Anti-Cheat (ป้องกันโกง)
- [x] Server-side Validation ทุกอย่าง
- [x] Card Integrity (CardID + Hash)
- [x] Bingo Validation (Section 8.1)
- [x] Rate Limiting
- [x] Audit Log

#### 📊 E. Admin Dashboard (Basic)
- [x] Approve/Reject Deposit
- [x] Approve/Reject Withdraw
- [x] View Financial Report
- [x] View Active Rooms
- [x] View User List

### 2.3 MVP Out of Scope (ไม่อยู่ใน MVP)
- ❌ Ghost Bot (เพิ่มใน Phase 2)
- ❌ Manual Draw Mode
- ❌ 90-Ball Bingo
- ❌ Chat & Sticker
- ❌ Sound Effects
- ❌ Advanced Analytics
- ❌ Mobile App

### 2.4 MVP Success Criteria
1. ✅ ระบบเล่นได้จริง (3-5 คนพร้อมกัน)
2. ✅ ฝาก-ถอนได้จริง (ผ่าน Admin)
3. ✅ ไม่มี Bug ทางการเงิน
4. ✅ ไม่มีช่องโหว่โกง
5. ✅ Latency < 500ms (WebSocket)

---

## 3. Product Roadmap

### Phase 0: MVP Foundation (สัปดาห์ที่ 1-4)
**เป้าหมาย**: ระบบใช้งานได้ครบ Core Features

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| W1 | Project Setup | • DB Schema<br>• API Contract<br>• Tech Stack Setup |
| W2 | Auth + Wallet | • Google OAuth<br>• Wallet System<br>• Deposit/Withdraw Flow |
| W3 | Game Engine | • Room System<br>• Game Flow<br>• WebSocket Events |
| W4 | Testing & Deploy | • Anti-Cheat Testing<br>• Load Testing<br>• Staging Deploy |

**คาดว่าใช้**: 4 สัปดาห์
**ทีมงาน**: Backend (2) + Frontend (1) + QA (1)

---

### Phase 1: Soft Launch (สัปดาห์ที่ 5-8)
**เป้าหมาย**: เปิดให้ผู้เล่นจริงทดสอบ + เริ่มหารายได้

#### ฟีเจอร์เพิ่มเติม
- [x] Ghost Bot System (รักษาสภาพคล่อง)
- [x] Chat & Basic Sticker
- [x] Sound Effects
- [x] Admin Bot Control Panel
- [x] Terms & Conditions Page
- [x] Enhanced Analytics

#### การตลาด
- เชิญเพื่อน/ครอบครัวทดสอบ (20-30 คน)
- สังเกตพฤติกรรม + รับ Feedback
- ปรับ Fee % ให้เหมาะสม

#### Success Metrics
- DAU (Daily Active Users): 20-50 คน
- Avg Games/Day: 100+ รอบ
- Revenue: 1,000-5,000 Point/วัน
- Bug Reports: < 5/สัปดาห์

---

### Phase 2: Growth & Optimization (สัปดาห์ที่ 9-12)
**เป้าหมาย**: Scale ระบบ + เพิ่มรายได้

#### ฟีเจอร์เพิ่มเติม
- [x] 90-Ball Bingo Support
- [x] Manual Draw Mode
- [x] Tournament System (แข่งขัน)
- [x] Leaderboard & Achievements
- [x] Referral Program (ชวนเพื่อน)
- [x] Auto-Payout (ลดงาน Admin)

#### การตลาด
- เปิด Facebook Ads (งบเล็กน้อย)
- สร้าง Community (Facebook Group)
- Influencer Marketing (เล็กๆ)

#### Success Metrics
- DAU: 100-200 คน
- Revenue: 10,000-30,000 Point/วัน
- Retention Rate: > 30% (7 วัน)
- ARPU (Avg Revenue Per User): > 100 Point/คน

---

### Phase 3: Scale & Enterprise (เดือนที่ 4-6)
**เป้าหมาย**: ระบบพร้อม Scale + Automation

#### ฟีเจอร์เพิ่มเติม
- [x] Mobile App (iOS/Android)
- [x] Payment Gateway Integration (PromptPay)
- [x] AI-based Fraud Detection
- [x] Multi-language Support
- [x] VIP System (สิทธิพิเศษ)
- [x] Live Streaming Integration

#### Infrastructure
- Auto-scaling Server
- CDN for Assets
- Redis Cluster
- Monitoring & Alerting

#### Success Metrics
- DAU: 500+ คน
- Revenue: 100,000+ Point/วัน
- Uptime: 99.9%
- Support Response Time: < 1 ชม.

---

## 4. Feature Dependencies (ลำดับการพัฒนา)

```
🔐 Authentication (Week 1)
    ↓
💰 Wallet System (Week 2)
    ↓
🎮 Game Engine (Week 3)
    ├─→ 🤖 Ghost Bot (Phase 1)
    ├─→ 💬 Chat (Phase 1)
    ├─→ 🏆 Tournament (Phase 2)
    └─→ 📱 Mobile App (Phase 3)
    ↓
📊 Admin Dashboard (Week 2-4)
    ├─→ 🤖 Bot Control (Phase 1)
    └─→ 📈 Advanced Analytics (Phase 2)
```

### Critical Path (ต้องทำก่อน)
1. **Week 1-2**: Authentication + Wallet (ไม่มีนี่ไม่มีเกม)
2. **Week 3**: Game Engine (หัวใจของระบบ)
3. **Week 4**: Testing + Security (ห้ามข้าม!)

### Nice-to-Have (ทำทีหลังได้)
- Chat & Sticker
- Sound Effects
- Tournament
- Mobile App

---

## 5. Risk Assessment (ความเสี่ยง)

### 5.1 Technical Risks (ความเสี่ยงทางเทคนิค)

| ความเสี่ยง | โอกาส | ผลกระทบ | มาตรการป้องกัน |
|-----------|-------|----------|-----------------|
| **WebSocket ล่ม** | กลาง | สูง | • Fallback เป็น Polling<br>• Auto-reconnect<br>• Load Balancer |
| **Database ล็อค** | กลาง | สูง | • Transaction Design<br>• Connection Pool<br>• Read Replica |
| **Port ชนกับเว็บอื่น** | ต่ำ | กลาง | • ใช้ Port พิเศษ (3001, 8001)<br>• Environment Config |
| **ระบบโกงได้** | กลาง | สูงมาก | • Server-side Validation<br>• Audit Log<br>• Security Review |

### 5.2 Business Risks (ความเสี่ยงทางธุรกิจ)

| ความเสี่ยง | โอกาส | ผลกระทบ | มาตรการป้องกัน |
|-----------|-------|----------|-----------------|
| **ไม่มีคนเล่น** | กลาง | สูง | • Ghost Bot รักษาสภาพคล่อง<br>• Marketing Plan<br>• Referral Program |
| **ผู้เล่นไม่ไว้ใจ** | กลาง | สูง | • ระบบโปร่งใส<br>• Terms ชัดเจน<br>• Support ดี |
| **ปัญหาทางกฎหมาย** | ต่ำ | สูงมาก | • Terms & Conditions<br>• คำปฏิเสธความรับผิดชอบ<br>• ปรึกษากฎหมาย |
| **Ghost Bot ชนะบ่อยเกิน** | กลาง | สูง | • Bot Win Rate Limit<br>• Random Delay<br>• Bot Constraint Policy |

### 5.3 Financial Risks (ความเสี่ยงทางการเงิน)

| ความเสี่ยง | โอกาส | ผลกระทบ | มาตรการป้องกัน |
|-----------|-------|----------|-----------------|
| **ถอนเงินมากกว่ารายได้** | ต่ำ | สูงมาก | • Fee % ที่เหมาะสม<br>• Withdraw Limit<br>• Financial Dashboard |
| **Transaction หาย** | ต่ำ | สูงมาก | • Transaction Log<br>• Backup ทุกวัน<br>• Reconciliation Report |
| **Admin โกงระบบ** | ต่ำ | สูงมาก | • Multi-signature Withdraw<br>• Audit Log<br>• Role Separation |

---

## 6. Success Metrics (วัดความสำเร็จ)

### 6.1 Product Metrics

| Metric | MVP | Phase 1 | Phase 2 | Phase 3 |
|--------|-----|---------|---------|---------|
| **DAU** | 5-10 | 20-50 | 100-200 | 500+ |
| **Games/Day** | 20-50 | 100+ | 500+ | 2,000+ |
| **Avg Players/Game** | 3-5 | 5-8 | 8-10 | 10 |
| **Uptime** | 95% | 98% | 99% | 99.9% |

### 6.2 Financial Metrics

| Metric | MVP | Phase 1 | Phase 2 | Phase 3 |
|--------|-----|---------|---------|---------|
| **Revenue/Day** | 500-1K | 1K-5K | 10K-30K | 100K+ |
| **ARPU** | 50-100 | 100-200 | 200-300 | 300+ |
| **Fee %** | 10% | 8-12% | 10-15% | 10-20% |
| **Net Profit Margin** | -50% | 0-20% | 20-40% | 40-60% |

> หมายเหตุ: MVP คาด Loss เพราะต้นทุนพัฒนา

### 6.3 User Engagement

| Metric | Target |
|--------|--------|
| **Session Duration** | > 15 นาที |
| **Games/User/Session** | > 3 รอบ |
| **7-Day Retention** | > 30% |
| **30-Day Retention** | > 15% |
| **NPS (Net Promoter Score)** | > 50 |

### 6.4 Security & Quality

| Metric | Target |
|--------|--------|
| **Critical Bugs** | 0 |
| **High Priority Bugs** | < 3 |
| **P95 Latency** | < 500ms |
| **Failed Transactions** | < 0.1% |
| **Fraud Detection Rate** | > 95% |

---

## 7. Resource Planning (ทรัพยากร)

### 7.1 ทีมงาน (Recommended)

| Role | Phase 0 | Phase 1-2 | Phase 3 |
|------|---------|-----------|---------|
| **Product Manager** | 1 | 1 | 1 |
| **System Architect** | 1 | 1 | 1 |
| **Backend Developer** | 2 | 2-3 | 3-4 |
| **Frontend Developer** | 1 | 2 | 2-3 |
| **QA Engineer** | 1 | 1-2 | 2 |
| **DevOps Engineer** | 1 | 1 | 1-2 |
| **Security Engineer** | 0.5 | 1 | 1 |

### 7.2 Tech Stack

#### Backend
- **Framework**: Node.js + Express / NestJS
- **Database**: PostgreSQL (ACID-compliant)
- **Cache**: Redis
- **WebSocket**: Socket.io / ws
- **Queue**: Bull / BullMQ

#### Frontend
- **Framework**: React + TypeScript
- **State Management**: Zustand / Redux Toolkit
- **UI Library**: MUI / Ant Design
- **Real-time**: Socket.io-client

#### Infrastructure
- **Hosting**: Railway / DigitalOcean / AWS
- **CDN**: Cloudflare
- **Monitoring**: Sentry + LogRocket
- **Analytics**: Mixpanel / Amplitude

### 7.3 Budget Estimate (ประมาณการ)

| หมวด | MVP | Phase 1-2 | Phase 3 |
|------|-----|-----------|---------|
| **Development** | 200K-300K | 400K-600K | 800K-1M |
| **Infrastructure** | 5K-10K/เดือน | 10K-20K/เดือน | 30K-50K/เดือน |
| **Marketing** | 0 | 20K-50K | 100K-200K |
| **Legal & Compliance** | 10K-20K | 20K-30K | 50K-100K |

---

## 8. Feature Prioritization Framework

### 8.1 Must-Have (ต้องมี)
- ✅ Google OAuth
- ✅ Wallet System
- ✅ Deposit/Withdraw Flow
- ✅ Game Engine (Auto Draw)
- ✅ Anti-Cheat
- ✅ Admin Dashboard

### 8.2 Should-Have (ควรมี)
- 🟡 Ghost Bot
- 🟡 Chat
- 🟡 Sound Effects
- 🟡 Advanced Analytics
- 🟡 Tournament

### 8.3 Could-Have (ดีถ้ามี)
- 🟢 90-Ball Bingo
- 🟢 Manual Draw
- 🟢 Achievements
- 🟢 Referral Program

### 8.4 Won't-Have (ไม่มีตอนนี้)
- ❌ Mobile App (Phase 3)
- ❌ Live Streaming
- ❌ AI Opponent
- ❌ Blockchain Integration

---

## 9. Go-to-Market Strategy (กลยุทธ์เปิดตัว)

### 9.1 MVP Testing (สัปดาห์ที่ 4-5)
1. **Internal Testing**: ทีมงานทดสอบ
2. **Friends & Family**: 10-20 คน
3. **Bug Bounty**: รางวัลสำหรับคนเจอบัค

### 9.2 Soft Launch (สัปดาห์ที่ 6-8)
1. **Invite-Only**: 50-100 คนแรก
2. **Early Bird Bonus**: Point ฟรี 100 สำหรับคนแรก
3. **Feedback Loop**: แบบสอบถาม + Interview

### 9.3 Public Launch (สัปดาห์ที่ 9+)
1. **Social Media**: Facebook, Twitter, IG
2. **Community**: Facebook Group
3. **PR**: Press Release (ถ้าทำได้)
4. **Paid Ads**: Facebook Ads, Google Ads

### 9.4 Referral Program (Phase 2)
- ชวนเพื่อน 1 คน → ได้ 50 Point (ทั้งสองคน)
- เพื่อนเล่นครบ 10 รอบ → ได้ 100 Point เพิ่ม

---

## 10. Legal & Compliance (กฎหมาย)

### 10.1 ประเด็นสำคัญ
- ⚠️ ระบบนี้อาจถูกมองว่า "การพนัน" ในบางประเทศ
- ⚠️ ต้องมี Terms & Conditions ชัดเจน
- ⚠️ ต้องมี Privacy Policy (PDPA)

### 10.2 มาตรการป้องกัน
1. **คำปฏิเสธความรับผิดชอบ**:
   - "ระบบนี้เป็นเกมเพื่อความบันเทิง"
   - "ผู้เล่นต้องมีอายุ 18 ปีขึ้นไป"
2. **Transparency**:
   - เปิดเผยว่ามี Ghost Bot
   - เปิดเผยอัตราค่าธรรมเนียม
3. **Responsible Gaming**:
   - Limit การเล่นต่อวัน
   - Warning สำหรับคนเสพติดการพนัน

### 10.3 คำแนะนำ
- ปรึกษาทนายความก่อน Launch จริง
- ศึกษากฎหมายท้องถิ่น
- พิจารณาจดทะเบียนบริษัท

---

## 11. Next Steps (ขั้นตอนถัดไป)

### สำหรับ System Architect (`claude --agent architect`)
- [ ] ออกแบบ Database Schema
- [ ] ออกแบบ API Contract
- [ ] ออกแบบ WebSocket Events
- [ ] ออกแบบ System Architecture Diagram

### สำหรับ Backend Developer (`claude --agent backend`)
- [ ] Setup Project Structure
- [ ] Implement Authentication
- [ ] Implement Wallet System
- [ ] Implement Game Engine

### สำหรับ Frontend Developer (`claude --agent frontend`)
- [ ] Setup React Project
- [ ] Create UI Components
- [ ] Implement WebSocket Client
- [ ] Create Lobby & Game Room

### สำหรับ QA Engineer (`claude --agent qa`)
- [ ] สร้าง Test Plan
- [ ] เขียน Test Cases
- [ ] Setup Testing Framework
- [ ] Perform Security Testing

### สำหรับ DevOps Engineer (`claude --agent devops`)
- [ ] Setup Development Environment
- [ ] Setup Staging Environment
- [ ] Setup CI/CD Pipeline
- [ ] Setup Monitoring & Logging

---

## 12. Appendix

### 12.1 Glossary (คำศัพท์)
- **DAU**: Daily Active Users (ผู้ใช้งานรายวัน)
- **ARPU**: Average Revenue Per User (รายได้เฉลี่ยต่อคน)
- **NPS**: Net Promoter Score (คะแนนความพึงพอใจ)
- **ACID**: Atomicity, Consistency, Isolation, Durability
- **MVP**: Minimum Viable Product (ผลิตภัณฑ์พื้นฐาน)

### 12.2 References
- Spec Document: `/Users/masterjob/Claude Code Project/bingo-party-enterprise-spec.md`
- Claude.md: `/Users/masterjob/Claude Code Project/CLAUDE.md`

### 12.3 Change Log
| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-01-12 | 1.0 | Initial Roadmap | เม (PM) |

---

## 📞 Contact & Support

หากมีคำถามหรือข้อสงสัย ติดต่อ:
- **Product Manager**: เม
- **Project Owner**: ที่รัก (พี่ออฟ)

---

**สรุป**: Roadmap นี้ออกแบบมาเพื่อให้ระบบ **หาเงินได้จริง** โดยเน้นที่ความปลอดภัย ความโปร่งใส และประสบการณ์ผู้ใช้ที่ดี พร้อมทั้งมีแผนรองรับการ Scale ในอนาคต ✨

**เป้าหมาย 6 เดือน**: มีผู้เล่น 500+ คน/วัน และสร้างรายได้ 100,000+ Point/วัน (ประมาณ 3 ล้านบาท/เดือน) 🎯
