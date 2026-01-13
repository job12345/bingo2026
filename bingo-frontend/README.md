# 🎯 Bingo Party Enterprise - Frontend

**เวอร์ชัน**: 1.0.0  
**Tech Stack**: React 18 + Vite + TypeScript + Ant Design + Zustand

---

## 📋 ข้อมูลโปรเจค

โปรเจคนี้เป็น Frontend สำหรับระบบเกมบิงโกออนไลน์แบบ Real-time ที่สามารถหาเงินได้จริง โดยใช้ระบบ Point (1 Point = 1 บาท)

### ฟีเจอร์หลัก

- ✅ **Google OAuth Login** - เข้าสู่ระบบด้วย Google Account
- ✅ **Real-time Game** - เล่นบิงโกแบบ Real-time ผ่าน WebSocket
- ✅ **Wallet System** - ระบบกระเป๋าเงิน ฝาก-ถอนได้จริง
- ✅ **Room System** - สร้างห้องและเข้าร่วมเล่นได้
- ✅ **Admin Dashboard** - หน้าผู้ดูแลระบบ
- ✅ **Sound Effects** - เสียงประกอบเกม
- ✅ **Responsive Design** - รองรับ Desktop & Tablet

---

## 🚀 การติดตั้งและรันโปรเจค

### 1. ติดตั้ง Dependencies

```bash
cd bingo-frontend
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` จาก `.env.example`:

```bash
cp .env.example .env
```

แก้ไขค่าใน `.env`:

```env
VITE_API_BASE_URL=http://localhost:8001
VITE_WS_BASE_URL=ws://localhost:8002
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_APP_NAME=Bingo Party Enterprise
VITE_ENABLE_SOUND=true
```

### 3. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่: **http://localhost:3001**

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | รัน Development Server (Port 3001) |
| `npm run build` | Build สำหรับ Production |
| `npm run preview` | Preview Production Build |
| `npm run lint` | ตรวจสอบ Code ด้วย ESLint |
| `npm run type-check` | ตรวจสอบ TypeScript Types |

---

## 🗂️ โครงสร้างโปรเจค

```
bingo-frontend/
├── public/                 # Static Assets
├── src/
│   ├── assets/            # Images, Sounds
│   ├── components/        # UI Components
│   │   ├── common/
│   │   ├── bingo/
│   │   ├── room/
│   │   ├── wallet/
│   │   └── admin/
│   ├── pages/             # หน้าต่างๆ
│   │   ├── Login/
│   │   ├── Lobby/
│   │   ├── GameRoom/
│   │   ├── Wallet/
│   │   ├── Profile/
│   │   └── Admin/
│   ├── stores/            # Zustand State Management
│   │   ├── authStore.ts
│   │   ├── gameStore.ts
│   │   ├── walletStore.ts
│   │   └── websocketStore.ts
│   ├── services/          # API & WebSocket Services
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── websocket.service.ts
│   │   └── ...
│   ├── hooks/             # Custom Hooks
│   ├── types/             # TypeScript Types
│   ├── utils/             # Utilities
│   ├── App.tsx            # Main App Component
│   ├── main.tsx           # Entry Point
│   └── index.css          # Global Styles
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🎨 UI/UX Design

### สีหลัก

- **Primary**: `#667eea` (Purple Blue)
- **Secondary**: `#764ba2` (Violet)
- **Success**: `#3f8600` (Green)
- **Warning**: `#faad14` (Yellow)
- **Error**: `#cf1322` (Red)

### Typography

- **Font**: System Fonts + Noto Sans Thai
- **Headings**: 32px, 24px, 20px, 16px
- **Body**: 14px

---

## 🔌 การเชื่อมต่อ Backend

Frontend เชื่อมต่อกับ Backend ผ่าน:

1. **REST API** (Port 8001)
   - Authentication
   - User Management
   - Wallet Operations
   - Room Management

2. **WebSocket** (Port 8002)
   - Real-time Game Events
   - Chat Messages
   - Player Updates

---

## 📱 Responsive Design

รองรับขนาดหน้าจอ:

- **Desktop**: ≥ 1200px (เต็มประสิทธิภาพ)
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px (Phase 3)

---

## 🔐 Authentication

ระบบใช้ Google OAuth สำหรับการ Login:

1. User คลิก "Login with Google"
2. Redirect ไป Google OAuth
3. Callback กลับมาพร้อม Token
4. บันทึก Token ใน localStorage
5. Redirect ไป Lobby

---

## 🎮 หน้าต่างๆ ในระบบ

### 1. Login Page (`/login`)
- Google OAuth Login
- Feature Highlights

### 2. Lobby Page (`/lobby`)
- ดูรายการห้อง
- สร้างห้องใหม่
- เข้าร่วมห้อง

### 3. Game Room Page (`/room/:roomId`)
- แสดงเลขที่ออก
- การ์ดบิงโก
- กด Bingo
- แชท

### 4. Wallet Page (`/wallet`)
- ดูยอดเงิน
- ฝาก/ถอนเงิน
- ประวัติธุรกรรม

### 5. Profile Page (`/profile`)
- ข้อมูลส่วนตัว
- สถิติการเล่น
- แก้ไขโปรไฟล์

### 6. Admin Page (`/admin/*`)
- อนุมัติธุรกรรม
- ดูรายงาน
- จัดการผู้ใช้
- Bot Control

---

## 🎵 Sound Effects

| Event | Sound | Trigger |
|-------|-------|---------|
| Number Draw | Click | เลขออก |
| Buy Card | Coin | ซื้อการ์ด |
| Near Bingo | Heartbeat | เหลือ 1-2 เลข |
| Bingo | "BINGO!" | กด Bingo |
| Win | Jackpot | ชนะ |
| Lose | Sad | แพ้ |

---

## 🚨 ข้อควรระวัง

1. **Port 3001** ต้องไม่ถูกใช้งานโดยโปรแกรมอื่น
2. ต้องรัน **Backend Server** ก่อน (Port 8001, 8002)
3. ต้องตั้งค่า **Google OAuth Client ID** ใน `.env`
4. ใช้ **HTTPS** สำหรับ Production

---

## 📝 TODO List

- [ ] สร้าง Components ที่เหลือ (BingoCard, NumberDisplay, etc.)
- [ ] เพิ่มไฟล์เสียง (Sound Effects)
- [ ] เชื่อมต่อ WebSocket Events
- [ ] ทดสอบ Responsive Design
- [ ] เพิ่ม Loading States & Error Handling
- [ ] เขียน Unit Tests
- [ ] Performance Optimization
- [ ] Deploy Staging

---

## 👥 ทีมพัฒนา

- **Frontend Developer**: เม
- **Backend Developer**: เม
- **Product Manager**: เม
- **System Architect**: เม

---

## 📄 License

MIT License - ใช้ได้ฟรี สำหรับโปรเจค Bingo Party Enterprise

---

## 📞 ติดต่อ

หากมีคำถามหรือข้อสงสัย ติดต่อ:
- **Developer**: เม
- **Project Owner**: ที่รัก (พี่ออฟ)

---

**สร้างด้วย ❤️ โดย เม (Frontend Developer)**
