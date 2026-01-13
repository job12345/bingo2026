# 🎯 Bingo Party Enterprise – System Design & Anti-Cheat Spec (v3.0)

> Document นี้ออกแบบมาเพื่อใช้กับ AI Coding Agents (เช่น Claude Code CLI)
> โดยเน้นความชัดเจนของ Flow, Logic, Business Rule และ Anti-Cheat
> ไม่มีโค้ด แต่ทุกข้อคือ “ข้อบังคับของระบบ”

---

## 1. System Overview

Bingo Party Enterprise คือเว็บแอปเกมบิงโกออนไลน์แบบ Real-time  
ใช้ระบบ Point (1 Point = 1 บาท) ซึ่งสามารถแลกเป็นเงินจริงได้  
ผู้เล่นสมัครด้วย Google Account และเล่นในโต๊ะบิงโกหลายห้องพร้อมกัน

### Core Principles
- Server เป็นผู้ตัดสินทุกอย่าง (Single Source of Truth)
- Client ไม่มีสิทธิ์ตัดสินผลเกม
- ทุกการเงินต้องตรวจสอบย้อนหลังได้
- Realtime + Fair + Auditable

---

## 2. User Roles

### 2.1 Player
- ล็อกอินด้วย Google
- เข้าร่วมเล่น / ดูเกม
- ซื้อการ์ดบิงโก
- กด Bingo
- เติม / ถอน Point
- แชทและส่งสติ๊กเกอร์

### 2.2 Admin
- อนุมัติเติม / ถอน Point
- ตั้งค่าระบบ (ค่าธรรมเนียม, Limit)
- ดูรายงานทั้งหมด
- จัดการโต๊ะ / ผู้ใช้
- จัดการ Ghost Bot

### 2.3 Ghost Bot (System-controlled)
- เป็นผู้เล่นอัตโนมัติ
- มี Wallet แยก
- เล่นตามกติกาเดียวกับ Player
- ต้อง “แพ้ได้จริง” และถูกจำกัดพฤติกรรม

---

## 3. Authentication & Profile

### Authentication
- Google OAuth เท่านั้น
- (Optional) จำกัดโดเมนองค์กร

### Player Profile
- UserID
- Display Name
- Avatar
- Role (Player / Admin / Bot)
- Point Balance
- Bank Info (สำหรับถอน)
- Play Statistics

---

## 4. Lobby & Room List

### Room Card ต้องแสดง
- Room ID / Name
- Status: Waiting / Playing (Round X/Y)
- Current Players / Max Players
- Pot Size (รอบปัจจุบัน)
- Card Price
- Top Winner (สะสม)
- Total Rounds Played

---

## 5. Room Creation Rules

### Configurable by Creator
- Draw Mode
  - Auto (Server Draw)
  - Manual Rotate (Timeout 5s)
- Number Set (75 / 90)
- Max Players
- Max Rounds (Default ≤ 50)
- Card Price (Point)
- Card Limit per Player / per Round

### Admin Override
- Max Rounds
- Fee Percentage
- Time Limits

---

## 6. Game State Flow (Authoritative)

```text
IDLE
 ↓
WAITING_FOR_ROUND
 ↓ (30s)
SITTING_PHASE
 ↓
BUYING_PHASE (20s)
 ↓
GAME_RUNNING
 ↓
BINGO_RACE
 ↓
WINNER_DECLARED
 ↓
PAYOUT
 ↓
COOLDOWN (30s)
 → WAITING_FOR_ROUND
7. Detailed Game Flow Rules
7.1 Sitting Phase (30s)
User กด “Sit”

ถ้าเต็ม → ปฏิเสธ

Late user → Spectator

7.2 Buying Phase (20s)
ตัด Point ทันทีเมื่อซื้อ

เงินถูก Lock ใน Transaction

ไม่ซื้อ / เงินไม่พอ → Kick เป็น Spectator

7.3 Gameplay
เลขสุ่มโดย Server เท่านั้น

Broadcast เลข + Timestamp

Client แสดงผลอย่างเดียว

7.4 Checking
Manual Check หรือ Auto Check

Server ตรวจ Pattern เสมอ

7.5 Bingo Race
เมื่อ Pattern Complete → Server อนุญาต Bingo

ผู้เล่นต้องกด Bingo เอง

Server รับ Request และจัดลำดับด้วย Server Timestamp

8. Anti-Cheat & Validation Logic (CRITICAL)
8.1 Bingo Validation (Server-side ONLY)
Server ต้องตรวจครบทุกข้อ:

Card นี้เป็นของ User จริง

Card นี้ยังไม่เคย Bingo มาก่อน

Pattern สำเร็จจริง

Pattern สำเร็จหลังเลขใด

Bingo Request มาหลังเลขนั้นถูก Broadcast

User ไม่โดน Rate Limit

ถ้าข้อใดข้อหนึ่งไม่ผ่าน → Reject

8.2 Rate Limiting
Bingo Button: จำกัด req / วินาที / user

Buy Card / Sit / Chat มี limit แยก

8.3 Card Integrity
Card ต้องมี CardID + Hash

Server เก็บ Card State ทั้งหมด

Client ห้ามส่งเลขเอง

8.4 Manual Draw Protection
ผู้เล่นมีเวลา 5s

ถ้าไม่กด → Server Draw แทน

Log คนที่ไม่กด

9. Ghost Bot Policy (IMPORTANT)
Ghost Bot เป็น “ผู้เล่นอัตโนมัติ” เพื่อรักษาสภาพคล่อง
ต้องไม่ทำให้ระบบเสียความเชื่อถือ

Bot Constraints
จำกัดจำนวนการ์ด

จำกัด Win Rate

ห้ามชนะติดกันเกิน N รอบ

มี Random Delay (0.5–2s) ก่อนกด Bingo

แพ้ได้จริง

Transparency Rule
ระบุใน Terms ว่า:

“ระบบอาจมีผู้เล่นอัตโนมัติ”

10. Financial System
10.1 Deposit (Top-up)
User โอนเงิน

แนบสลิป

Status: Pending

Admin Approve → Point เข้า

10.2 Withdraw
User ขอถอน

ระบุบัญชี

Admin โอนเงินจริง

Mark Complete → Point ถูกหัก

10.3 Payout
Pot = Sum(Card Price)

Fee (%) หักเข้าระบบ

ส่วนที่เหลือ → Winner

11. Admin Dashboard – Required Reports
11.1 Financial Overview
Total Card Sales

Fee Income

Withdraw Amount

Net System Balance

11.2 Player Risk Report
Win Rate

Avg Bingo Reaction Time

Suspicious Flags

11.3 Bot Performance Report
Rounds Played

Win / Loss

Profit / Loss

11.4 Room Health
Avg Players

Avg Pot

Complaint Count

12. Sound Effects Specification
Event	Sound
Number Draw	Click / Voice
Buy Card	Coin
Near Bingo	Heartbeat
Bingo	“BINGO!”
Win	Jackpot Coin

ต้องมี Mute / Volume Control

13. Terms & Usage Rules (Mandatory)
Key Clauses:

ระบบใช้ Point ที่แลกเป็นเงินจริงได้

การตัดสินยึด Server Timestamp

ระบบอาจมีผู้เล่นอัตโนมัติ

การเติม/ถอนมีช่วงเวลาดำเนินการ

ระบบขอสงวนสิทธิ์ระงับบัญชีผิดปกติ

14. Development Checklist (For AI Agents)
Core
 Google OAuth

 WebSocket Realtime

 Server-side Game Engine

 Transaction-safe Wallet

Security
 Anti-spam

 Bingo Validation

 Full Audit Log

Admin
 Approval Flow

 Reporting System

 Bot Control Panel

15. Final Notes
This document is:

A System Contract

A Security & Fairness Specification

A Business Rule Authority

AI Agents must:

Follow this spec strictly

Never move logic to client

Never allow Admin to alter past results

END OF DOCUMENT

markdown
Copy code

---

## ถัดไปคุณทำอะไรได้บ้าง

คุณสามารถเอาไฟล์นี้ไป:
- แตก Sub-agent เช่น
  - `frontend-agent`
  - `realtime-game-agent`
  - `wallet-finance-agent`
  - `anti-cheat-agent`
- ให้ Claude สร้าง
  - DB Schema
  - API Contract
  - WebSocket Events
  - Admin UI

ถ้าคุณอยากให้ผม:
- แยกไฟล์ `.md` เป็นหลายไฟล์ตาม Agent
- เขียน Prompt สำหรับแต่ละ Sub-agent
- หรือทำ Threat Model เพิ่ม

บอกผมได้เลยครับ  
ผมจะช่วยคุณ “ปั้นระบบนี้ให้รอดจริง” 👊











ChatGPT can make mistakes. Check important info. See Cookie Preferences.