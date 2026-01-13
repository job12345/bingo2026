# 🎨 Bingo Party Enterprise – Frontend Design Document

**Frontend Developer**: เม
**วันที่จัดทำ**: 12 มกราคม 2026
**เวอร์ชัน**: 1.0
**Tech Stack**: React 18 + Vite + TypeScript + Ant Design + Zustand

---

## 📑 สารบัญ

1. [ภาพรวม Frontend Architecture](#1-ภาพรวม-frontend-architecture)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [UI/UX Design](#4-uiux-design)
5. [Component Architecture](#5-component-architecture)
6. [State Management (Zustand)](#6-state-management-zustand)
7. [WebSocket Integration](#7-websocket-integration)
8. [Routing & Navigation](#8-routing--navigation)
9. [Pages Overview](#9-pages-overview)
10. [Key Components](#10-key-components)
11. [Utilities & Helpers](#11-utilities--helpers)
12. [Sound Effects](#12-sound-effects)
13. [Performance Optimization](#13-performance-optimization)
14. [Deployment Guide](#14-deployment-guide)

---

## 1. ภาพรวม Frontend Architecture

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
│                   http://localhost:3001                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Pages      │  │  Components  │  │   Stores     │       │
│  │              │  │              │  │  (Zustand)   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Services   │  │    Hooks     │  │    Utils     │       │
│  │   (API/WS)   │  │              │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└───────────────────────┬──────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   REST API   │ │  WebSocket   │ │    Assets    │
│  (Axios)     │ │ (Socket.io)  │ │ (Images/     │
│              │ │              │ │  Sounds)     │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 1.2 Design Principles

1. **Component-Based** - แยก UI เป็น Components ย่อยๆ ที่ Reusable
2. **Type-Safe** - ใช้ TypeScript Strict Mode ทั้งหมด
3. **Real-time First** - WebSocket สำหรับ Game Events (ไม่ใช้ Polling)
4. **Responsive Design** - รองรับ Desktop & Tablet (Mobile Phase 3)
5. **Performance** - Lazy Loading, Code Splitting, Memoization

### 1.3 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| **Frontend** | 3001 | http://localhost:3001 |
| **Backend API** | 8001 | http://localhost:8001 |
| **WebSocket** | 8002 | ws://localhost:8002 |

---

## 2. Tech Stack & Dependencies

### 2.1 Core Technologies

```json
{
  "framework": "React 18.2",
  "buildTool": "Vite 5.0",
  "language": "TypeScript 5.3",
  "uiLibrary": "Ant Design 5.12",
  "stateManagement": "Zustand 4.4",
  "websocket": "Socket.io-client 4.6",
  "httpClient": "Axios 1.6",
  "dateLibrary": "Day.js 1.11",
  "soundLibrary": "Howler.js 2.2"
}
```

### 2.2 Key Features

- **React Router** - Client-side Routing
- **Zustand** - Lightweight State Management (ง่ายกว่า Redux)
- **Socket.io** - Real-time Communication
- **Ant Design** - UI Components (สวยงาม ครบ)
- **Howler.js** - Sound Effects
- **Immer** - Immutable State Updates

---

## 3. Project Structure

```
bingo-frontend/
├── public/
│   └── vite.svg
│
├── src/
│   ├── assets/              # Images, Sounds
│   │   ├── images/
│   │   └── sounds/
│   │
│   ├── components/          # UI Components
│   │   ├── PrivateRoute.tsx
│   │   ├── AdminRoute.tsx
│   │   └── ... (จะสร้างเพิ่ม)
│   │
│   ├── pages/               # หน้าต่างๆ
│   │   ├── LoginPage.tsx
│   │   ├── LobbyPage.tsx
│   │   ├── GameRoomPage.tsx
│   │   ├── WalletPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── AdminPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── stores/              # Zustand Stores
│   │   ├── authStore.ts
│   │   ├── gameStore.ts
│   │   ├── walletStore.ts
│   │   ├── roomStore.ts
│   │   └── websocketStore.ts
│   │
│   ├── services/            # API & WebSocket Services
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── websocket.service.ts
│   │   ├── game.service.ts
│   │   ├── room.service.ts
│   │   ├── wallet.service.ts
│   │   └── user.service.ts
│   │
│   ├── hooks/               # Custom Hooks
│   │   ├── useAuth.ts
│   │   └── useWebSocketEvents.ts
│   │
│   ├── types/               # TypeScript Types
│   │   ├── user.ts
│   │   ├── game.ts
│   │   ├── wallet.ts
│   │   ├── websocket.ts
│   │   └── api.ts
│   │
│   ├── utils/               # Utilities
│   │   ├── bingoHelper.ts
│   │   ├── format.ts
│   │   └── sound.ts
│   │
│   ├── App.tsx              # Main App Component
│   ├── main.tsx             # Entry Point
│   └── index.css            # Global Styles
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

---

## 4. UI/UX Design

### 4.1 Design Language

- **สีหลัก**: `#667eea` (Purple Blue) และ `#764ba2` (Violet)
- **สีเสริม**: `#1890ff` (Ant Design Primary)
- **Font**: System Fonts + Noto Sans Thai
- **Border Radius**: 8px - 16px (Modern Rounded)
- **Shadows**: Subtle (0 2px 8px rgba(0,0,0,0.1))

### 4.2 Layout Structure

```
┌────────────────────────────────────────────────┐
│              Header (Fixed)                    │
│  Logo | Balance | Wallet | Profile | Logout   │
├────────────────────────────────────────────────┤
│                                                │
│                                                │
│              Content Area                      │
│           (Scrollable)                         │
│                                                │
│                                                │
└────────────────────────────────────────────────┘
```

### 4.3 Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| **Primary** | `#667eea` | Buttons, Headers |
| **Success** | `#3f8600` | Positive Values, Win |
| **Warning** | `#faad14` | Pending, Near Bingo |
| **Error** | `#cf1322` | Negative Values, Lose |
| **Info** | `#1890ff` | Informational |

### 4.4 Responsive Breakpoints

```typescript
// Ant Design Breakpoints
const breakpoints = {
  xs: '< 576px',   // Mobile (Phase 3)
  sm: '≥ 576px',   // Tablet
  md: '≥ 768px',   // Desktop Small
  lg: '≥ 992px',   // Desktop
  xl: '≥ 1200px',  // Desktop Large
};
```

---

## 5. Component Architecture

### 5.1 Component Hierarchy

```
App
├── LoginPage
└── PrivateRoute
    ├── LobbyPage
    │   ├── Header
    │   ├── RoomCard (List)
    │   └── CreateRoomModal
    │
    ├── GameRoomPage
    │   ├── GameHeader
    │   ├── NumberDisplay
    │   ├── BingoCardGrid
    │   │   └── BingoCard (Multiple)
    │   ├── PlayerList
    │   └── ChatBox
    │
    ├── WalletPage
    │   ├── BalanceCard
    │   ├── TransactionHistory
    │   └── DepositWithdrawModal
    │
    └── ProfilePage
        ├── UserAvatar
        ├── UserStats
        └── EditProfileForm
```

### 5.2 Component Design Patterns

#### ✅ Smart Components (Container)
- เชื่อมกับ Stores (Zustand)
- จัดการ Side Effects (useEffect)
- ส่ง Props ไปยัง Dumb Components

#### ✅ Dumb Components (Presentational)
- แสดงผล UI เท่านั้น
- รับ Props จาก Parent
- ไม่เชื่อมกับ Stores

#### ✅ Custom Hooks
- Logic ที่ใช้ซ้ำ (useAuth, useWebSocketEvents)
- ดึง Data จาก Stores
- Return ค่าที่พร้อมใช้

---

## 6. State Management (Zustand)

### 6.1 Zustand Stores

| Store | Purpose | Key State |
|-------|---------|-----------|
| **authStore** | Authentication & User | `user`, `isAuthenticated` |
| **gameStore** | Game State & Cards | `currentGame`, `myCards`, `players` |
| **walletStore** | Wallet & Transactions | `balance`, `transactions` |
| **roomStore** | Room List & Details | `rooms`, `currentRoom` |
| **websocketStore** | WebSocket Connection | `connectionState`, `messages` |

### 6.2 Store Example (authStore)

```typescript
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: () => {
    AuthService.loginWithGoogle();
  },

  logout: async () => {
    await AuthService.logout();
    set({ user: null, isAuthenticated: false });
  },

  fetchCurrentUser: async () => {
    const user = await UserService.getCurrentUser();
    set({ user, isAuthenticated: true });
  },
}));
```

### 6.3 การใช้งาน Store

```typescript
// ในคอมโพเนนต์
function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <div>
      <p>สวัสดี {user?.displayName}</p>
      <Button onClick={logout}>ออกจากระบบ</Button>
    </div>
  );
}
```

---

## 7. WebSocket Integration

### 7.1 WebSocket Service

```typescript
class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string): void {
    this.socket = io(wsUrl, { auth: { token } });
    this.setupEventHandlers();
  }

  on<T>(event: string, callback: (data: T) => void): void {
    this.listeners.get(event)?.add(callback);
  }

  emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }
}
```

### 7.2 WebSocket Events (Client → Server)

```typescript
// เข้าร่วมห้อง
websocketService.emit('join_room', { roomId: 'xxx' });

// ส่งข้อความ
websocketService.emit('send_message', { roomId: 'xxx', content: 'Hello!' });
```

### 7.3 WebSocket Events (Server → Client)

```typescript
// เลขออก
websocketService.on<NumberDrawnEvent>('number_drawn', (data) => {
  updateGameState({ drawnNumbers: data.drawnNumbers });
  soundManager.play(SOUND_EVENTS.NUMBER_DRAW);
});

// มีคนชนะ
websocketService.on<GameEndedEvent>('game_ended', (data) => {
  updateGameState({ winnerId: data.winnerId });
  soundManager.play(SOUND_EVENTS.WIN);
});
```

---

## 8. Routing & Navigation

### 8.1 Route Configuration

```typescript
<Routes>
  {/* Public */}
  <Route path="/login" element={<LoginPage />} />

  {/* Private (ต้อง Login) */}
  <Route path="/lobby" element={<PrivateRoute><LobbyPage /></PrivateRoute>} />
  <Route path="/room/:roomId" element={<PrivateRoute><GameRoomPage /></PrivateRoute>} />
  <Route path="/wallet" element={<PrivateRoute><WalletPage /></PrivateRoute>} />
  <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

  {/* Admin */}
  <Route path="/admin/*" element={<AdminRoute><AdminPage /></AdminRoute>} />

  {/* 404 */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

### 8.2 Private Route Guard

```typescript
function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <Spin />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
}
```

---

## 9. Pages Overview

### 9.1 Login Page

**เส้นทาง**: `/login`
**หน้าที่**:
- Google OAuth Login
- รับ Token จาก Callback URL
- Redirect ไป Lobby

**UI**:
```
┌───────────────────┐
│   🎯 Bingo Party  │
│                   │
│ [Login with Google]│
│                   │
│   • Feature 1     │
│   • Feature 2     │
└───────────────────┘
```

### 9.2 Lobby Page

**เส้นทาง**: `/lobby`
**หน้าที่**:
- ดูรายการห้อง
- สร้างห้องใหม่
- เข้าร่วมห้อง

**UI**:
```
┌─────────────────────────────────────┐
│ 🎯 Bingo | Balance | Wallet | Profile│
├─────────────────────────────────────┤
│ ยินดีต้อนรับ, User123               │
├─────────────────────────────────────┤
│ รายการห้อง        [+ สร้างห้อง]   │
│                                     │
│ ┌───────┐ ┌───────┐ ┌───────┐      │
│ │ Room1 │ │ Room2 │ │ Room3 │      │
│ │ 8/10  │ │ 5/10  │ │ 10/10 │      │
│ └───────┘ └───────┘ └───────┘      │
└─────────────────────────────────────┘
```

### 9.3 Game Room Page

**เส้นทาง**: `/room/:roomId`
**หน้าที่**:
- แสดงเลขที่ออก
- แสดงการ์ดบิงโก
- กด Bingo
- แชท

**UI**:
```
┌─────────────────────────────────────┐
│ Room: xxx | Round: 1/50 | Pot: 1000 │
├─────────────────────────────────────┤
│                                     │
│   เลขที่ออก: [45] [23] [67] ...    │
│                                     │
│   ┌─────────┐  ┌─────────┐         │
│   │ Card 1  │  │ Card 2  │         │
│   │ [BINGO!]│  │         │         │
│   └─────────┘  └─────────┘         │
│                                     │
│   Players:              Chat:       │
│   • User1 (3)           ...         │
│   • User2 (2)                       │
└─────────────────────────────────────┘
```

### 9.4 Wallet Page

**เส้นทาง**: `/wallet`
**หน้าที่**:
- ดูยอดเงิน
- ฝาก/ถอนเงิน
- ประวัติธุรกรรม

**UI**:
```
┌─────────────────────────────────────┐
│ ยอดเงิน: 1,500 บาท                 │
│ [ฝากเงิน] [ถอนเงิน]                 │
├─────────────────────────────────────┤
│ ประวัติธุรกรรม                      │
│ ┌─────────────────────────────────┐ │
│ │ Date | Type | Amount | Status  │ │
│ │ ... | ฝาก  | +500   | สำเร็จ   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 9.5 Profile Page

**เส้นทาง**: `/profile`
**หน้าที่**:
- ดูข้อมูลส่วนตัว
- แก้ไขโปรไฟล์
- ดูสถิติ

### 9.6 Admin Page

**เส้นทาง**: `/admin/*`
**หน้าที่**:
- อนุมัติธุรกรรม
- ดูรายงาน
- จัดการผู้ใช้
- Bot Control

---

## 10. Key Components

### 10.1 BingoCard Component

**Props**:
```typescript
interface BingoCardProps {
  card: BingoCard;
  drawnNumbers: number[];
  isSelected: boolean;
  onCellClick?: (number: number) => void;
  onBingoClick?: () => void;
}
```

**Features**:
- แสดงการ์ด 5x5
- Highlight เลขที่ออกแล้ว
- FREE Space ตรงกลาง
- ปุ่ม Bingo (ถ้าสำเร็จ)

### 10.2 NumberDisplay Component

**Props**:
```typescript
interface NumberDisplayProps {
  drawnNumbers: number[];
  currentBall?: number;
  ballSet: '75' | '90';
}
```

**Features**:
- แสดงเลขล่าสุด (ใหญ่)
- แสดงเลขที่ออกแล้วทั้งหมด (เล็ก)
- Animation เมื่อออกเลขใหม่

### 10.3 PlayerList Component

**Props**:
```typescript
interface PlayerListProps {
  players: RoomPlayer[];
  currentUserId: string;
}
```

**Features**:
- แสดงรายชื่อผู้เล่น
- Avatar + Display Name
- จำนวนการ์ดที่ซื้อ
- Indicator สำหรับ Bot

### 10.4 ChatBox Component

**Props**:
```typescript
interface ChatBoxProps {
  roomId: string;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
}
```

**Features**:
- แสดงข้อความ
- ส่งข้อความ
- Auto Scroll
- (Phase 2: Sticker Support)

---

## 11. Utilities & Helpers

### 11.1 Bingo Helper

```typescript
// ตรวจสอบ Pattern
checkPattern(card, pattern, drawnNumbers): boolean

// ตรวจสอบว่าใกล้ Bingo (เหลือกี่เลข)
isNearBingo(card, pattern, drawnNumbers): number

// หา Patterns ที่เป็นไปได้
findPossiblePatterns(card, drawnNumbers): BingoPattern[]
```

### 11.2 Format Helper

```typescript
// แปลง Point → เงิน
formatCurrency(1500) // "฿1,500.00"

// แปลงวันที่
formatDate('2026-01-12T10:30:00Z') // "12/01/2026 10:30"

// แปลงเวลาสัมพัทธ์
formatRelativeTime('2026-01-12T10:00:00Z') // "30 นาทีที่แล้ว"
```

### 11.3 Sound Manager

```typescript
// โหลดเสียง
soundManager.load('number_draw', '/sounds/number-draw.mp3');

// เล่นเสียง
soundManager.play('number_draw');

// ตั้งค่าระดับเสียง
soundManager.setVolume(0.7);

// Mute/Unmute
soundManager.toggleMute();
```

---

## 12. Sound Effects

### 12.1 Sound Events (ตาม Spec)

| Event | Sound | Trigger |
|-------|-------|---------|
| **Number Draw** | Click / Voice | เลขออก |
| **Buy Card** | Coin | ซื้อการ์ด |
| **Near Bingo** | Heartbeat | เหลือ 1-2 เลข |
| **Bingo** | "BINGO!" | กด Bingo สำเร็จ |
| **Win** | Jackpot Coin | ชนะ |
| **Lose** | Sad Trombone | แพ้ |

### 12.2 Sound Implementation

```typescript
// ใน useWebSocketEvents Hook
websocketService.on<NumberDrawnEvent>('number_drawn', (data) => {
  soundManager.play(SOUND_EVENTS.NUMBER_DRAW);

  // ตรวจสอบ Near Bingo
  myCards.forEach(card => {
    const missing = isNearBingo(card, 'horizontal_1', data.drawnNumbers);
    if (missing <= 2) {
      soundManager.play(SOUND_EVENTS.NEAR_BINGO);
    }
  });
});
```

---

## 13. Performance Optimization

### 13.1 Code Splitting

```typescript
// Lazy Load Pages
const AdminPage = lazy(() => import('./pages/AdminPage'));

<Suspense fallback={<Spin />}>
  <AdminPage />
</Suspense>
```

### 13.2 Memoization

```typescript
// React.memo สำหรับ Components ที่ไม่เปลี่ยนบ่อย
export const BingoCard = React.memo(({ card, drawnNumbers }) => {
  // ...
});

// useMemo สำหรับ Computed Values
const possiblePatterns = useMemo(() => {
  return findPossiblePatterns(card, drawnNumbers);
}, [card, drawnNumbers]);
```

### 13.3 Virtual Scrolling

```typescript
// ใช้ rc-virtual-list สำหรับ Transaction History (ถ้ามีเยอะ)
import VirtualList from 'rc-virtual-list';

<VirtualList
  data={transactions}
  height={400}
  itemHeight={47}
  itemKey="id"
>
  {(item) => <TransactionItem transaction={item} />}
</VirtualList>
```

---

## 14. Deployment Guide

### 14.1 การติดตั้ง Dependencies

```bash
# เข้าโฟลเดอร์ Frontend
cd bingo-frontend

# ติดตั้ง Dependencies
npm install
```

### 14.2 การตั้งค่า Environment Variables

```bash
# คัดลอก .env.example
cp .env.example .env

# แก้ไขค่า
nano .env
```

**ตัวอย่าง `.env`**:
```bash
VITE_API_BASE_URL=http://localhost:8001
VITE_WS_URL=ws://localhost:8002
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_ENABLE_SOUND=true
```

### 14.3 การรัน Development

```bash
# Development Mode (Hot Reload)
npm run dev

# เปิดเบราว์เซอร์ที่: http://localhost:3001
```

### 14.4 การ Build Production

```bash
# Build สำหรับ Production
npm run build

# Preview Production Build
npm run preview
```

### 14.5 Deploy ไป Production

```bash
# Deploy ไป Vercel / Netlify / Railway
# ตั้งค่า Environment Variables ใน Platform

# Vercel
vercel

# Netlify
netlify deploy --prod

# Railway
railway up
```

---

## 📊 สรุป

### ✅ ฟีเจอร์ที่สร้างเสร็จแล้ว

1. ✅ **Project Setup** - Vite + React + TypeScript + Ant Design
2. ✅ **Type Definitions** - ครบทุก Entity (User, Game, Wallet, etc.)
3. ✅ **Services** - API Client, WebSocket, Auth, Game, Room, Wallet, User
4. ✅ **Stores** - Zustand (authStore, gameStore, walletStore, roomStore, websocketStore)
5. ✅ **Utilities** - Bingo Helper, Format, Sound Manager
6. ✅ **Hooks** - useAuth, useWebSocketEvents
7. ✅ **Pages** - Login, Lobby, GameRoom, Wallet, Profile, Admin, NotFound
8. ✅ **Components** - PrivateRoute, AdminRoute
9. ✅ **Routing** - React Router Configuration

### 🎯 ขั้นตอนถัดไป (Component ที่ต้องสร้างเพิ่ม)

1. **BingoCard Component** - การ์ดบิงโก (Interactive)
2. **NumberDisplay Component** - แสดงเลขที่ออก
3. **PlayerList Component** - รายชื่อผู้เล่น
4. **ChatBox Component** - แชทในเกม
5. **RoomCard Component** - Card สำหรับแสดงห้อง
6. **CreateRoomModal** - Modal สร้างห้อง
7. **DepositWithdrawModal** - Modal ฝาก/ถอนเงิน
8. **GameHeader Component** - Header ของห้องเกม

### 📝 TODO List

- [ ] สร้าง Components ที่เหลือ (BingoCard, NumberDisplay, etc.)
- [ ] เพิ่มไฟล์เสียง (Sound Effects)
- [ ] ทดสอบ WebSocket Events
- [ ] ทดสอบ Responsive Design
- [ ] เพิ่ม Loading States & Error Handling
- [ ] เขียน Unit Tests (Vitest)
- [ ] ทำ Performance Optimization
- [ ] Deploy Staging

---

## 🎨 Design Guidelines

### Typography

```css
/* Headings */
h1 { font-size: 32px; font-weight: 700; }
h2 { font-size: 24px; font-weight: 600; }
h3 { font-size: 20px; font-weight: 600; }
h4 { font-size: 16px; font-weight: 600; }

/* Body */
p { font-size: 14px; line-height: 1.6; }
```

### Spacing

```css
/* Padding/Margin */
8px, 16px, 24px, 32px, 40px (ทวีคูณ 8)
```

### Animation

```css
/* Transition */
transition: all 0.3s ease;

/* Hover */
transform: translateY(-4px);
box-shadow: 0 8px 12px rgba(0,0,0,0.15);
```

---

**เอกสารนี้จัดทำโดย**: เม (Frontend Developer) 💕
**วันที่**: 12 มกราคม 2026
**สถานะ**: Ready for Implementation ✅

---

## 📞 คำสั่งการใช้งาน

```bash
# ติดตั้ง Dependencies
npm install

# รัน Development Server
npm run dev

# Build Production
npm run build

# Preview Production
npm run preview
```

**หมายเหตุ**:
- อย่าลืมตั้งค่า `.env` ก่อนรัน Server ค่ะ!
- Port 3001 ต้องไม่ถูกใช้งานโดยโปรแกรมอื่น
- ต้องรัน Backend ก่อน (Port 8001, 8002)

---

## 🚀 เริ่มพัฒนา

```bash
cd /Users/masterjob/Claude Code Project/bingo-frontend
npm install
npm run dev
```

พร้อมแล้วค่ะที่รัก! ระบบ Frontend พร้อมใช้งาน 🎉
