# 🎭 Bingo Party Enterprise – Test Scenarios, Edge Cases & Negative Tests

**QA Engineer**: เม
**วันที่จัดทำ**: 12 มกราคม 2026
**เวอร์ชัน**: 1.0
**ระบบ**: Bingo Party Enterprise (Real Money Gaming)

---

## 📑 สารบัญ

1. [User Scenarios (Happy Path)](#1-user-scenarios-happy-path)
2. [Edge Cases](#2-edge-cases)
3. [Negative Test Scenarios](#3-negative-test-scenarios)
4. [Concurrency Test Scenarios](#4-concurrency-test-scenarios)
5. [Security Test Scenarios](#5-security-test-scenarios)
6. [Performance Test Scenarios](#6-performance-test-scenarios)
7. [Chaos Testing Scenarios](#7-chaos-testing-scenarios)

---

## 1. User Scenarios (Happy Path)

### Scenario 1.1: New User - First Deposit → Play → Win → Withdraw

**Persona**: นาย A (ผู้เล่นใหม่)
**Goal**: ฝากเงิน → เล่นเกม → ชนะ → ถอนเงิน

#### Steps:

```
1. Login (Google OAuth)
   └─ Click "Login with Google"
   └─ Select Google Account
   └─ Approve Permissions
   └─ ✅ Redirect to Lobby

2. Deposit 1,000 Baht
   └─ Click "Wallet" → "Deposit"
   └─ Enter Amount: 1,000
   └─ Upload Payment Slip
   └─ Submit
   └─ ✅ Status: Pending

3. Admin Approves Deposit
   └─ Admin sees pending deposit
   └─ Clicks "Approve"
   └─ ✅ User Balance = 1,000

4. Browse Lobby
   └─ See Room List
   └─ Filter by "Active Games"
   └─ ✅ See 3 Active Rooms

5. Join Room "Beginner Room"
   └─ Click Room Card
   └─ Click "Join"
   └─ ✅ Enter Sitting Phase (30s countdown)

6. Buy Cards (Buying Phase)
   └─ Select Quantity: 2
   └─ Click "Buy Cards"
   └─ ✅ Balance = 800 (Paid 200)
   └─ ✅ See 2 Bingo Cards

7. Game Starts
   └─ Countdown ends
   └─ ✅ State: "Game Running"
   └─ ✅ See Number Drawing (Real-time)

8. Play Game
   └─ Numbers: 1, 5, 12, 23, 45, 31, 16, 61, 46, 32, 17, 62 (12 balls)
   └─ Card 1: Horizontal Row 1 Complete [1, 16, 31, 46, 61]
   └─ Click "Bingo" Button
   └─ ✅ Server Validates (200ms latency)
   └─ ✅ Bingo Accepted

9. Win Game
   └─ ✅ Winner Announcement (User A)
   └─ ✅ Payout: 900 Baht (Pot: 1000 - Fee: 100)
   └─ ✅ Balance = 1,700

10. Withdraw 1,500 Baht
    └─ Click "Wallet" → "Withdraw"
    └─ Enter Amount: 1,500
    └─ Enter Bank Info
    └─ Submit
    └─ ✅ Status: Pending

11. Admin Approves Withdraw
    └─ Admin transfers money
    └─ Clicks "Approve"
    └─ ✅ User Balance = 200

12. Logout
    └─ Click "Logout"
    └─ ✅ Redirect to Login Page
```

**Expected Results:**
- ✅ Balance ถูกต้องทุกขั้นตอน (1000 → 800 → 1700 → 200)
- ✅ Transaction Records ครบทุกรายการ (Deposit, Buy Cards, Payout, Withdraw)
- ✅ Real-time Events ทำงานได้ (WebSocket)
- ✅ UX ราบรื่น ไม่มี Error

---

### Scenario 1.2: Multi-Player Game (4 Players Race)

**Persona**: นาย A, นาง B, นาย C, นาง D
**Goal**: ทดสอบ Race Condition และ Fair Play

#### Steps:

```
1. All 4 Players Login
   └─ Player A, B, C, D Login
   └─ ✅ All Authenticated

2. All Join "Room X" (Max 10 Players)
   └─ All click "Join" simultaneously
   └─ ✅ All enter Sitting Phase

3. All Buy Cards
   └─ Player A: 3 Cards (300 Baht)
   └─ Player B: 2 Cards (200 Baht)
   └─ Player C: 1 Card (100 Baht)
   └─ Player D: 2 Cards (200 Baht)
   └─ ✅ Pot = 800 Baht

4. Game Starts
   └─ State: "Game Running"
   └─ ✅ All Players See Real-time Number Drawing

5. Number Drawing (Server)
   └─ Numbers: 1, 5, 12, 23, 45, 31, 16, 61, 46, 32, 17, 62, 47, 33, 18, 48, 34
   └─ ✅ All Clients Receive WebSocket Events

6. Player A Pattern Complete (Ball #12)
   └─ Card 1: [1, 16, 31, 46, 61] (Horizontal Row 1)
   └─ Player A Clicks "Bingo" (Latency: 300ms)
   └─ ✅ Bingo Request Sent to Server

7. Player B Pattern Complete (Ball #12)
   └─ Card 2: [1, 16, 31, 46, 61] (Same Pattern, Different Card)
   └─ Player B Clicks "Bingo" (Latency: 450ms) ← Slower
   └─ ✅ Bingo Request Sent to Server

8. Player C Pattern Complete (Ball #15)
   └─ Card 1: [5, 17, 32, 47, 62] (Horizontal Row 2)
   └─ Player C Clicks "Bingo" (Latency: 200ms)
   └─ ✅ Bingo Request Sent to Server

9. Server Validates All Requests
   └─ Player A: Valid, Server Timestamp: 10:30:15.300
   └─ Player B: Valid, Server Timestamp: 10:30:15.450
   └─ Player C: Valid, Server Timestamp: 10:30:18.200 (Later)
   └─ ✅ Winner: Player A (First Server Timestamp)

10. Winner Announcement
    └─ WebSocket Broadcast: "Player A Wins!"
    └─ ✅ Player A sees "You Win!" (900 Baht Payout - Fee: 100)
    └─ ✅ Player B, C, D see "Player A Wins"

11. Payout
    └─ Player A Balance += 900
    └─ ✅ Transaction Created (Type: Payout)

12. All Players Leave Room
    └─ Click "Leave"
    └─ ✅ Redirect to Lobby
```

**Expected Results:**
- ✅ Server Timestamp ใช้เป็นตัวตัดสิน (ไม่ใช่ Client Time)
- ✅ Race Condition ไม่เกิดปัญหา (Player A ชนะเพราะถึง Server ก่อน)
- ✅ All Players เห็น Result เหมือนกัน (Real-time Sync)
- ✅ Payout ถูกต้อง (900 Baht = 800 - 10% Fee)

---

### Scenario 1.3: Admin Workflow (Approve Transactions)

**Persona**: Admin
**Goal**: จัดการธุรกรรม (Deposit/Withdraw)

#### Steps:

```
1. Admin Login
   └─ Login with Admin Account
   └─ ✅ Redirect to Admin Dashboard

2. View Pending Deposits
   └─ Navigate to "Transactions" → "Pending Deposits"
   └─ ✅ See 5 Pending Deposits

3. Review Deposit #1 (User A, 500 Baht)
   └─ Click "View Details"
   └─ See Payment Slip Image
   └─ Verify Bank Transfer
   └─ ✅ Slip Valid

4. Approve Deposit #1
   └─ Click "Approve"
   └─ Enter Notes: "Verified. SCB Transfer."
   └─ Submit
   └─ ✅ User A Balance += 500
   └─ ✅ Status: Completed

5. Review Deposit #2 (User B, 1,000 Baht)
   └─ Click "View Details"
   └─ ⚠️ Slip Suspicious (Photoshopped)

6. Reject Deposit #2
   └─ Click "Reject"
   └─ Enter Reason: "Invalid payment slip"
   └─ Submit
   └─ ✅ Status: Rejected
   └─ ✅ User B Notified

7. View Pending Withdraws
   └─ Navigate to "Pending Withdraws"
   └─ ✅ See 3 Pending Withdraws

8. Review Withdraw #1 (User C, 800 Baht)
   └─ Click "View Details"
   └─ Verify Bank Info
   └─ Transfer Money via Bank (External)
   └─ ✅ Money Transferred

9. Approve Withdraw #1
   └─ Click "Approve"
   └─ Enter Notes: "Transferred to SCB xxx-x-xxx12-3"
   └─ Submit
   └─ ✅ User C Balance -= 800
   └─ ✅ Status: Completed

10. View Reports
    └─ Navigate to "Reports" → "Financial"
    └─ Select Date Range: Last 7 Days
    └─ ✅ See Total Deposits, Withdraws, Fee Income
```

**Expected Results:**
- ✅ Admin สามารถ Approve/Reject Transactions ได้
- ✅ User Balance อัปเดตทันทีหลัง Approve
- ✅ Transaction Status ถูกต้อง (Pending → Completed / Rejected)
- ✅ Reports แสดงข้อมูลถูกต้อง

---

## 2. Edge Cases

### Edge Case 2.1: Game Ends (No Winner)

**Scenario**: เลขออกครบ 75 ตัวแล้วไม่มีใครชนะ

#### Steps:

```
1. Game Starts
   └─ 10 Players, All Buy Cards

2. Numbers Draw
   └─ Numbers: 1, 2, 3, 4, ..., 75 (All 75 Numbers)
   └─ ⚠️ No Player Completes Any Pattern

3. Game Ends (No Winner)
   └─ State: "Game Ended"
   └─ ✅ Broadcast: "No Winner. Pot Rolled Over."

4. Pot Rollover
   └─ Pot (800 Baht) → Next Round
   └─ ✅ Next Round Pot = 800 (Previous) + New Pot
```

**Expected Results:**
- ✅ ระบบไม่ Crash
- ✅ Pot Rollover ถูกต้อง
- ✅ ผู้เล่นเห็น Notification "No Winner"

---

### Edge Case 2.2: User Buys Max Cards (3 Cards)

**Scenario**: User ซื้อการ์ดถึง Limit

#### Steps:

```
1. User Joins Room (Max Cards per Player = 3)
2. User Buys 3 Cards
   └─ ✅ Success
3. User Tries to Buy 1 More Card
   └─ ❌ Error: "Max 3 cards per player"
```

**Expected Results:**
- ✅ ซื้อการ์ดได้ไม่เกิน Limit
- ✅ Error Message ชัดเจน

---

### Edge Case 2.3: User Balance Exactly Matches Card Price

**Scenario**: User มีเงินพอดี ซื้อการ์ดหมดเงินพอดี

#### Steps:

```
1. User Balance = 100 Baht
2. Card Price = 100 Baht
3. User Buys 1 Card
   └─ ✅ Success
   └─ ✅ New Balance = 0
4. User Tries to Buy Another Card
   └─ ❌ Error: "Insufficient balance"
```

**Expected Results:**
- ✅ Balance = 0 หลังซื้อการ์ด
- ✅ ซื้อการ์ดเพิ่มไม่ได้

---

### Edge Case 2.4: Bingo Exactly at 200ms (Suspicious Threshold)

**Scenario**: User กด Bingo พอดี 200ms

#### Steps:

```
1. Number Drawn at 10:30:00.000
2. User Pattern Complete
3. User Clicks Bingo at 10:30:00.200 (Exactly 200ms)
   └─ ✅ Accepted (Threshold = 200ms)
   └─ ⚠️ Logged as "Borderline Timing"
```

**Expected Results:**
- ✅ Bingo Accepted
- ✅ Logged for Review (Not Auto-Rejected)

---

### Edge Case 2.5: WebSocket Disconnect During Game

**Scenario**: ผู้เล่น WebSocket Disconnect แล้ว Reconnect

#### Steps:

```
1. User Playing Game (5 Numbers Drawn)
2. User WebSocket Disconnects (Network Issue)
   └─ Frontend: Auto-Reconnect
3. User Reconnects
   └─ ✅ Receive Current Game State
   └─ ✅ Sync Numbers: [1, 5, 12, 23, 45]
4. Game Continues Normally
```

**Expected Results:**
- ✅ Auto-Reconnect ทำงาน
- ✅ Game State Sync ถูกต้อง
- ✅ User สามารถเล่นต่อได้

---

### Edge Case 2.6: Room Full (Max Players Reached)

**Scenario**: ห้องเต็ม (10/10 Players)

#### Steps:

```
1. Room Max Players = 10
2. 10 Players Join
   └─ ✅ Room Full
3. Player #11 Tries to Join
   └─ ❌ Error: "Room is full"
   └─ ✅ Status: Spectator (Can Watch)
```

**Expected Results:**
- ✅ ไม่สามารถ Join เกิน Max Players
- ✅ Spectator Mode ทำงาน

---

### Edge Case 2.7: Withdraw Amount = Balance

**Scenario**: User ถอนเงินหมดบัญชี

#### Steps:

```
1. User Balance = 1,000 Baht
2. User Withdraw 1,000 Baht
   └─ ✅ Success (Pending)
3. Admin Approves
   └─ ✅ New Balance = 0
```

**Expected Results:**
- ✅ Balance = 0 หลังถอน
- ✅ ไม่เกิด Negative Balance

---

### Edge Case 2.8: Card with All Same Numbers (Invalid)

**Scenario**: Server สุ่มการ์ดผิดพลาด (Duplicate Numbers)

#### Steps:

```
1. Mock Card Generator to Generate Duplicate
   └─ Card: [[1, 1, 1, 1, 1], ...]
2. User Buys Card
   └─ ⚠️ Server Validates Card Before Saving
   └─ ❌ Error: "Invalid card generated"
   └─ ✅ Regenerate New Card
```

**Expected Results:**
- ✅ ไม่มีการ์ดผิดปกติ
- ✅ Server Validates Card Generation

---

## 3. Negative Test Scenarios

### Negative 3.1: Authentication Attacks

#### 3.1.1 Login Without Credentials

```
Request: GET /auth/google (No OAuth Code)
Expected: 400 Bad Request
```

#### 3.1.2 Access Protected Endpoint Without Token

```
Request: GET /users/me (No Authorization Header)
Expected: 401 Unauthorized
```

#### 3.1.3 Use Expired JWT Token

```
Request: GET /users/me (Expired Token)
Expected: 401 Token Expired
```

#### 3.1.4 Use Invalid JWT Token

```
Request: GET /users/me
Headers: Authorization: Bearer invalid_token_12345
Expected: 401 Invalid Token
```

---

### Negative 3.2: Wallet Attacks

#### 3.2.1 Deposit Negative Amount

```
Request: POST /wallet/deposit
Body: { amount: -500 }
Expected: 400 Bad Request (Amount must be > 0)
```

#### 3.2.2 Deposit XSS in Notes

```
Request: POST /wallet/deposit
Body: { amount: 500, notes: "<script>alert('XSS')</script>" }
Expected: 400 Bad Request (XSS Sanitized)
```

#### 3.2.3 Withdraw More Than Balance

```
User Balance: 100
Request: POST /wallet/withdraw
Body: { amount: 500 }
Expected: 400 Insufficient Balance
```

#### 3.2.4 Withdraw to Invalid Bank Account

```
Request: POST /wallet/withdraw
Body: { amount: 500, bankAccountNumber: "abc" }
Expected: 400 Invalid Bank Account
```

---

### Negative 3.3: Game Flow Attacks

#### 3.3.1 Buy Cards Without Balance

```
User Balance: 50
Request: POST /game/:gameId/buy-cards
Body: { quantity: 2 } (Cost: 200)
Expected: 400 Insufficient Balance
```

#### 3.3.2 Buy Cards After Buying Phase

```
Game State: "running"
Request: POST /game/:gameId/buy-cards
Expected: 400 Buying Phase Ended
```

#### 3.3.3 Claim Bingo with Incomplete Pattern

```
Card: [1, 16, 31, 46, 61]
Drawn Numbers: [1, 16, 31, 46] (Missing 61)
Request: POST /game/:gameId/bingo
Body: { cardId: "card_1", pattern: "horizontal_1" }
Expected: 400 Pattern Incomplete (Missing [61])
```

#### 3.3.4 Claim Bingo with Card of Another User

```
Request: POST /game/:gameId/bingo
Body: { cardId: "card_of_user_B" }
User: User A
Expected: 403 Forbidden (Card does not belong to user)
```

#### 3.3.5 Claim Bingo Twice

```
1. Claim Bingo (Success)
2. Claim Bingo Again (Same Card)
Expected: 400 Card Already Won
```

#### 3.3.6 Tamper Card Numbers (Client-side)

```
1. User Buys Card (Server Generates + Hash)
2. User Modifies Card Numbers (Client-side)
3. User Claims Bingo
Expected: 403 Card Integrity Check Failed (Hash Mismatch)
```

---

### Negative 3.4: SQL Injection Attempts

#### 3.4.1 SQL Injection in Email

```
Request: POST /users
Body: { email: "admin' OR '1'='1" }
Expected: 400 Bad Request (Prisma Safe)
```

#### 3.4.2 SQL Injection in Search

```
Request: GET /rooms?search='; DROP TABLE rooms; --
Expected: 400 Bad Request (Parameterized Query)
```

---

### Negative 3.5: XSS Attempts

#### 3.5.1 XSS in Display Name

```
Request: PUT /users/me
Body: { displayName: "<script>alert('XSS')</script>" }
Expected: 400 Bad Request (Sanitized)
```

#### 3.5.2 XSS in Chat Message

```
WebSocket Event: send_message
Body: { content: "<img src=x onerror=alert('XSS')>" }
Expected: Sanitized Message
```

---

### Negative 3.6: Rate Limiting Tests

#### 3.6.1 Flood Bingo Requests

```
Send: POST /game/:gameId/bingo (20 times in 1 second)
Expected: 429 Too Many Requests (After 10th request)
```

#### 3.6.2 Flood Chat Messages

```
WebSocket: send_message (50 times in 1 second)
Expected: 429 Rate Limit Exceeded
```

---

### Negative 3.7: Authorization Bypass Attempts

#### 3.7.1 Normal User Access Admin Endpoint

```
Request: GET /admin/dashboard
User: Player (Not Admin)
Expected: 403 Forbidden
```

#### 3.7.2 User Approve Own Deposit

```
Request: POST /admin/transactions/:id/approve
User: Player (Not Admin)
Expected: 403 Forbidden
```

---

## 4. Concurrency Test Scenarios

### Concurrency 4.1: Double Spending (Buy Cards)

**Scenario**: User กดซื้อการ์ด 2 ครั้งพร้อมกัน

#### Steps:

```
Initial State:
└─ User Balance: 500 Baht
└─ Card Price: 100 Baht

Action:
└─ User Clicks "Buy 3 Cards" (300 Baht)
└─ User Clicks "Buy 3 Cards" Again (Simultaneously)

Expected Behavior:
└─ Request #1: Success (Balance = 200)
└─ Request #2: Fail (Insufficient Balance)

Reason:
└─ Prisma Transaction with Serializable Isolation
└─ Row-level Locking on User Balance
```

**Expected Results:**
- ✅ Only 1 Request Succeeds
- ✅ Balance = 200 (Not Negative)
- ✅ No Double Spending

---

### Concurrency 4.2: Race Condition (Withdraw + Buy Cards)

**Scenario**: User ถอนเงินและซื้อการ์ดพร้อมกัน

#### Steps:

```
Initial State:
└─ User Balance: 1,000 Baht

Action (Simultaneous):
└─ Request #1: POST /wallet/withdraw { amount: 800 }
└─ Request #2: POST /game/:gameId/buy-cards { quantity: 3 } (300 Baht)

Expected Behavior:
└─ Request #1: Success (Pending Withdraw)
└─ Request #2: Success (Balance = 700)
└─ ⚠️ Withdraw Amount Reserved (Locked)

After Admin Approves Withdraw:
└─ Final Balance = 700 - 800 = Error
└─ ✅ Withdraw Rejected (Insufficient Balance after approval)
```

**Expected Results:**
- ✅ Proper Transaction Locking
- ✅ No Negative Balance

---

### Concurrency 4.3: Multi-Player Bingo Race

**Scenario**: 3 Players กด Bingo พร้อมกัน

#### Steps:

```
Game State:
└─ Ball #15 Drawn
└─ Player A: Pattern Complete (Ball #15)
└─ Player B: Pattern Complete (Ball #15)
└─ Player C: Pattern Complete (Ball #15)

Action (Within 100ms):
└─ Player A Clicks Bingo (Server Timestamp: 10:30:00.100)
└─ Player B Clicks Bingo (Server Timestamp: 10:30:00.150)
└─ Player C Clicks Bingo (Server Timestamp: 10:30:00.180)

Server Validation:
└─ All 3 Bingos Valid
└─ Winner: Player A (Earliest Server Timestamp)

Payout:
└─ Player A: +900 Baht
└─ Player B, C: No Payout
```

**Expected Results:**
- ✅ Server Timestamp ใช้เป็นตัวตัดสิน
- ✅ Only 1 Winner
- ✅ No Double Payout

---

### Concurrency 4.4: Admin Approve Same Transaction Twice

**Scenario**: 2 Admins กด Approve Transaction เดียวกันพร้อมกัน

#### Steps:

```
Transaction:
└─ User A Deposit 500 Baht (Status: Pending)

Action (Simultaneous):
└─ Admin 1 Clicks "Approve"
└─ Admin 2 Clicks "Approve"

Expected Behavior:
└─ Request #1: Success (Status → Completed, Balance += 500)
└─ Request #2: Fail (Status Already Completed)

Server Logic:
└─ Check Status Before Approve
└─ If Status != 'pending' → Reject
```

**Expected Results:**
- ✅ Only 1 Approval Succeeds
- ✅ Balance += 500 (Not 1000)
- ✅ Transaction Status = Completed (Only Once)

---

## 5. Security Test Scenarios

### Security 5.1: Penetration Testing Checklist

#### 5.1.1 Authentication Bypass

```
Test: Access /users/me without token
Expected: 401 Unauthorized
```

#### 5.1.2 Authorization Bypass

```
Test: Access /admin/dashboard as Player
Expected: 403 Forbidden
```

#### 5.1.3 SQL Injection

```
Test: POST /users { email: "' OR '1'='1" }
Expected: 400 Bad Request (Prisma Safe)
```

#### 5.1.4 XSS Injection

```
Test: PUT /users/me { displayName: "<script>alert('XSS')</script>" }
Expected: 400 Bad Request (Sanitized)
```

#### 5.1.5 CSRF Attack

```
Test: POST /wallet/withdraw (From External Domain)
Expected: 403 CORS Error
```

#### 5.1.6 Command Injection

```
Test: POST /wallet/deposit { notes: "; rm -rf /" }
Expected: 400 Bad Request (Sanitized)
```

---

### Security 5.2: Anti-Cheat Penetration Testing

#### 5.2.1 Card Tampering

```
Test:
1. Buy Card (Server Generates)
2. Modify Card Numbers (Client-side)
3. Claim Bingo

Expected: 403 Card Integrity Failed (Hash Mismatch)
```

#### 5.2.2 Fake Bingo (Incomplete Pattern)

```
Test:
1. Pattern Incomplete
2. Send POST /game/:id/bingo

Expected: 400 Pattern Incomplete (Missing Numbers: [X, Y, Z])
```

#### 5.2.3 Bingo with Card of Another User

```
Test:
1. User A Buys Card (card_1)
2. User B Sends POST /game/:id/bingo { cardId: "card_1" }

Expected: 403 Forbidden (Card does not belong to user)
```

#### 5.2.4 Replay Attack (Reuse Bingo Request)

```
Test:
1. User Wins with Card 1
2. Replay Same Request

Expected: 400 Card Already Won
```

---

### Security 5.3: Session Hijacking Tests

#### 5.3.1 Use Stolen JWT Token

```
Test:
1. Steal JWT Token (Man-in-the-Middle)
2. Use Token to Access /users/me

Expected: 200 OK (Token Valid)
Mitigation: Short-lived Token (15 min) + HTTPS Only
```

#### 5.3.2 Use Refresh Token After Logout

```
Test:
1. Login → Get Refresh Token
2. Logout
3. Use Refresh Token

Expected: 401 Token Revoked
```

---

## 6. Performance Test Scenarios

### Performance 6.1: Load Testing (100 Concurrent Users)

#### Steps:

```
1. Simulate 100 Users Login Simultaneously
   └─ Expected: All Login Success
   └─ Expected: API Response Time < 500ms (p95)

2. All 100 Users Join Same Room
   └─ Expected: WebSocket Connections Stable
   └─ Expected: Connection Time < 500ms

3. All 100 Users Buy Cards
   └─ Expected: No Race Condition
   └─ Expected: All Transactions Correct

4. Game Starts (Auto Draw Mode)
   └─ Expected: Number Drawing Interval = 3s (Stable)
   └─ Expected: WebSocket Latency < 100ms

5. Multiple Users Claim Bingo
   └─ Expected: Server Timestamp Determines Winner
   └─ Expected: No Double Payout
```

**Performance Targets:**
- ✅ API Response Time (p95): < 200ms
- ✅ WebSocket Latency: < 100ms
- ✅ Concurrent Users: ≥ 100
- ✅ Database Query Time (p95): < 50ms

---

### Performance 6.2: Stress Testing (Number Drawing)

#### Steps:

```
1. Create Game with 100 Players
2. All Players Buy 3 Cards Each (300 Cards Total)
3. Start Number Drawing (Auto Mode, 3s Interval)
4. Observe System Performance

Metrics:
└─ CPU Usage
└─ Memory Usage
└─ WebSocket Connections
└─ Database Connections
└─ Response Time
```

**Expected Results:**
- ✅ CPU < 70%
- ✅ Memory < 80%
- ✅ No WebSocket Disconnects
- ✅ No Database Deadlocks

---

## 7. Chaos Testing Scenarios

### Chaos 7.1: Database Disconnection

**Scenario**: Database Crashes Mid-Game

#### Steps:

```
1. Game Running (10 Players)
2. Simulate Database Disconnect
   └─ Stop PostgreSQL Container

Expected Behavior:
└─ API Returns 500 Internal Server Error
└─ Frontend Shows "Server Error. Please Retry."
└─ Auto-Reconnect (Retry Logic)

After Database Reconnects:
└─ Game Resumes
└─ Game State Restored (From Last Checkpoint)
```

**Expected Results:**
- ✅ Graceful Error Handling
- ✅ No Data Loss (Transaction Rollback)
- ✅ Auto-Reconnect Works

---

### Chaos 7.2: Redis Failure

**Scenario**: Redis Crashes (Cache/Queue Down)

#### Steps:

```
1. Simulate Redis Disconnect
   └─ Stop Redis Container

Expected Behavior:
└─ Rate Limiting Disabled (Fallback)
└─ Cache Miss → Query Database
└─ Performance Degraded (No Cache)
└─ System Still Works (Degraded Mode)
```

**Expected Results:**
- ✅ System Doesn't Crash
- ✅ Fallback Mechanism Works
- ✅ Performance Impact Minimal

---

### Chaos 7.3: WebSocket Server Crash

**Scenario**: WebSocket Server Crashes Mid-Game

#### Steps:

```
1. Game Running (Real-time Events)
2. Simulate WebSocket Server Crash
   └─ Kill WebSocket Process

Expected Behavior:
└─ All Clients Disconnect
└─ Frontend Shows "Connection Lost. Reconnecting..."
└─ Auto-Reconnect (Exponential Backoff)

After WebSocket Reconnects:
└─ Clients Receive Current Game State
└─ Game Continues
```

**Expected Results:**
- ✅ Auto-Reconnect Works
- ✅ Game State Synced
- ✅ No Data Loss

---

### Chaos 7.4: Network Partition (Split Brain)

**Scenario**: Network Partition ระหว่าง Frontend ↔ Backend

#### Steps:

```
1. Simulate Network Partition (50% Packet Loss)

Expected Behavior:
└─ WebSocket Events Delayed
└─ Some Clients Disconnect
└─ Frontend Shows "Poor Connection" Warning
└─ Retry Logic Kicks In

After Network Recovers:
└─ Clients Reconnect
└─ Game State Synced
```

**Expected Results:**
- ✅ Retry Logic Works
- ✅ No Permanent Data Loss
- ✅ User Notified About Poor Connection

---

## 📊 สรุป

### ✅ Test Scenarios Complete

เอกสาร Test Scenarios นี้ครอบคลุม:

1. ✅ **User Scenarios (Happy Path)** - 3 Scenarios
   - New User Flow (Deposit → Play → Win → Withdraw)
   - Multi-Player Race Condition
   - Admin Workflow

2. ✅ **Edge Cases** - 8 Scenarios
   - Game Ends (No Winner)
   - Max Cards
   - Exact Balance
   - Suspicious Timing
   - WebSocket Disconnect
   - Room Full
   - Withdraw All Balance
   - Invalid Card

3. ✅ **Negative Tests** - 25+ Tests
   - Authentication Attacks
   - Wallet Attacks
   - Game Flow Attacks
   - SQL Injection
   - XSS
   - Rate Limiting
   - Authorization Bypass

4. ✅ **Concurrency Tests** - 4 Scenarios
   - Double Spending
   - Race Conditions
   - Multi-Player Bingo Race
   - Admin Concurrent Approval

5. ✅ **Security Tests** - 10+ Tests
   - Penetration Testing
   - Anti-Cheat Tests
   - Session Hijacking

6. ✅ **Performance Tests** - 2 Scenarios
   - Load Testing (100 Users)
   - Stress Testing (Number Drawing)

7. ✅ **Chaos Tests** - 4 Scenarios
   - Database Failure
   - Redis Failure
   - WebSocket Crash
   - Network Partition

### 🎯 การใช้งาน

**QA Engineer** ใช้เอกสารนี้เพื่อ:
1. ทดสอบ User Scenarios (Manual Testing)
2. เขียน Test Cases สำหรับ Negative Tests
3. ทดสอบ Concurrency (Load Testing Tools)
4. ทดสอบ Security (Penetration Testing)
5. ทดสอบ Performance (Artillery/k6)
6. ทดสอบ Chaos (Simulate Failures)

---

**เอกสารนี้จัดทำโดย**: เม (QA Engineer) 💕
**วันที่**: 12 มกราคม 2026
**สถานะ**: ✅ **Test Scenarios Complete**

---

## 🚀 ขั้นตอนถัดไป

1. **Manual Testing** - ทดสอบ User Scenarios ด้วยมือ
2. **Automated Testing** - เขียน E2E Tests (Playwright/Cypress)
3. **Load Testing** - Run Artillery/k6 Scripts
4. **Security Testing** - Penetration Testing (OWASP ZAP)
5. **Chaos Testing** - Simulate Failures (Chaos Monkey)

**พร้อมทดสอบแล้วค่ะที่รัก!** 🎉
