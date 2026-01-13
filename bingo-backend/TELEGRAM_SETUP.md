# คู่มือการตั้งค่า Telegram Notification

คู่มือนี้จะแนะนำวิธีการตั้งค่า Telegram Bot สำหรับรับการแจ้งเตือนเมื่อมีการฝาก-ถอนเงินในระบบ Bingo Party Enterprise

---

## 📋 สารบัญ

1. [สร้าง Telegram Bot](#1-สร้าง-telegram-bot)
2. [หา Chat ID](#2-หา-chat-id)
3. [ตั้งค่าใน Backend](#3-ตั้งค่าใน-backend)
4. [ทดสอบการทำงาน](#4-ทดสอบการทำงาน)
5. [API Endpoints](#5-api-endpoints)
6. [ตัวอย่างข้อความแจ้งเตือน](#6-ตัวอย่างข้อความแจ้งเตือน)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. สร้าง Telegram Bot

### ขั้นตอนที่ 1: สร้าง Bot ผ่าน BotFather

1. เปิด Telegram และค้นหา **@BotFather**
2. ส่งคำสั่ง `/start` เพื่อเริ่มต้น
3. ส่งคำสั่ง `/newbot` เพื่อสร้าง Bot ใหม่
4. ตั้งชื่อ Bot (เช่น `Bingo Party Notification`)
5. ตั้ง Username ของ Bot (ต้องลงท้ายด้วย `bot` เช่น `bingo_party_notification_bot`)
6. BotFather จะให้ **Bot Token** กลับมา (เช่น `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### ขั้นตอนที่ 2: เก็บ Bot Token

**⚠️ สำคัญ:** Bot Token เป็นข้อมูลลับ ห้ามเปิดเผยหรือ commit ลง Git

```bash
Bot Token: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

---

## 2. หา Chat ID

### วิธีที่ 1: ใช้ Bot เพื่อหา Chat ID (แนะนำ)

1. ค้นหา **@userinfobot** ใน Telegram
2. ส่งคำสั่ง `/start`
3. Bot จะแสดง **Chat ID** ของคุณ (เช่น `123456789`)

### วิธีที่ 2: ใช้ API ของ Telegram

1. ส่งข้อความไปที่ Bot ที่สร้างไว้
2. เปิด URL:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
3. ดู `chat.id` ใน Response

### วิธีที่ 3: ใช้ Channel/Group

ถ้าต้องการส่งไปที่ Channel หรือ Group:

1. เพิ่ม Bot เป็น Admin ใน Channel/Group
2. ส่งข้อความใน Channel/Group
3. ใช้ API `getUpdates` เพื่อหา Chat ID
4. Chat ID ของ Channel จะเป็นเลขติดลบ (เช่น `-1001234567890`)

---

## 3. ตั้งค่าใน Backend

### วิธีที่ 1: ใช้ Environment Variables (แนะนำสำหรับ Development)

แก้ไขไฟล์ `.env`:

```bash
# Telegram Notification
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

### วิธีที่ 2: ใช้ Admin API (แนะนำสำหรับ Production)

1. Login ด้วย Admin Account
2. เรียก API เพื่ออัปเดตการตั้งค่า:

```bash
PUT /admin/settings/telegram
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "botToken": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
  "chatId": "123456789"
}
```

Response:
```json
{
  "message": "อัปเดตการตั้งค่า Telegram สำเร็จ",
  "updated": ["Bot Token", "Chat ID"]
}
```

---

## 4. ทดสอบการทำงาน

### ทดสอบผ่าน API

```bash
POST /admin/settings/telegram/test
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "chatId": "123456789"  # Optional: ถ้าไม่ใส่จะใช้ Default Chat ID
}
```

Response (สำเร็จ):
```json
{
  "success": true,
  "message": "ส่งข้อความทดสอบสำเร็จ"
}
```

Response (ไม่สำเร็จ):
```json
{
  "success": false,
  "message": "ส่งข้อความทดสอบไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า"
}
```

---

## 5. API Endpoints

### 5.1 ดึงการตั้งค่า Telegram

```bash
GET /admin/settings/telegram
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

Response:
```json
{
  "botToken": "****UVwxyz",  // แสดงเฉพาะ 6 ตัวท้าย
  "chatId": "123456789",
  "lastUpdated": "2026-01-12T14:30:00.000Z"
}
```

### 5.2 อัปเดตการตั้งค่า Telegram

```bash
PUT /admin/settings/telegram
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "botToken": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",  // Optional
  "chatId": "123456789"  // Optional
}
```

### 5.3 ทดสอบส่งข้อความ

```bash
POST /admin/settings/telegram/test
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "chatId": "123456789"  // Optional
}
```

---

## 6. ตัวอย่างข้อความแจ้งเตือน

### 6.1 การฝากเงิน (Deposit)

```
💰 การฝากเงินใหม่

👤 ผู้ใช้: John Doe
📧 อีเมล: john@gmail.com
💵 จำนวน: 1,000.00 บาท
🕒 เวลา: 12 ม.ค. 2026 14:30
📊 สถานะ: รอตรวจสอบ

📎 สลิป: https://example.com/slip.jpg
📝 หมายเหตุ: เติมเงินผ่านธนาคารกสิกร

👉 ตรวจสอบที่ Admin Panel
Transaction ID: abc123-def456-ghi789
```

### 6.2 การถอนเงิน (Withdraw)

```
💸 คำขอถอนเงินใหม่

👤 ผู้ใช้: John Doe
📧 อีเมล: john@gmail.com
💵 จำนวน: 500.00 บาท
🕒 เวลา: 12 ม.ค. 2026 15:00
📊 สถานะ: รอโอนเงิน

🏦 ข้อมูลบัญชี:
  ธนาคาร: กสิกรไทย
  เลขบัญชี: 123-4-56789-0
  ชื่อบัญชี: นายจอห์น โด

👉 ดำเนินการที่ Admin Panel
Transaction ID: xyz789-abc456-def123
```

### 6.3 การอนุมัติ/ปฏิเสธ

```
✅ การฝากเงินอนุมัติแล้ว

👤 ผู้ใช้: John Doe
📧 อีเมล: john@gmail.com
💵 จำนวน: 1,000.00 บาท
🕒 เวลา: 12 ม.ค. 2026 16:00
👨‍💼 ดำเนินการโดย: Admin User

Transaction ID: abc123-def456-ghi789
```

---

## 7. Troubleshooting

### ❌ Problem: ไม่ได้รับการแจ้งเตือน

**วิธีแก้:**

1. ตรวจสอบว่า Bot Token และ Chat ID ถูกต้อง
2. ตรวจสอบว่า Bot ยังไม่ถูก Block โดย Telegram
3. ลองทดสอบส่งข้อความผ่าน API `/admin/settings/telegram/test`
4. ตรวจสอบ Log ใน Backend:
   ```bash
   # ดู Log
   docker logs bingo-backend -f
   ```

### ❌ Problem: Bot Token ไม่ถูกต้อง

**วิธีแก้:**

1. ตรวจสอบว่า Bot Token ไม่มีช่องว่างหรือตัวอักษรพิเศษ
2. ลอง Generate Bot Token ใหม่จาก @BotFather:
   ```
   /token
   เลือก Bot ของคุณ
   ```

### ❌ Problem: Chat ID ไม่ถูกต้อง

**วิธีแก้:**

1. ลองใช้ @userinfobot เพื่อหา Chat ID ใหม่
2. ถ้าใช้ Channel/Group ตรวจสอบว่า:
   - Bot เป็น Admin ของ Channel/Group
   - Chat ID ต้องเป็นเลขติดลบ (เช่น `-1001234567890`)

### ❌ Problem: แจ้งเตือนไม่มาบางครั้ง

**วิธีแก้:**

1. ตรวจสอบว่าระบบ Backend ทำงานปกติ
2. ตรวจสอบ Network Connection
3. ตรวจสอบ Rate Limit ของ Telegram API (ส่งได้ไม่เกิน 30 ข้อความต่อวินาที)

---

## 📝 หมายเหตุ

- การแจ้งเตือนจะส่งอัตโนมัติเมื่อ:
  - มีคำขอเติมเงิน (Deposit Request)
  - มีคำขอถอนเงิน (Withdraw Request)
  - Admin อนุมัติ/ปฏิเสธคำขอ

- ระบบมี Error Handling:
  - ถ้าส่ง Telegram ไม่สำเร็จ ระบบหลักจะยังทำงานต่อไปได้ปกติ
  - ข้อผิดพลาดจะถูกบันทึกใน Log

- การตั้งค่าผ่าน Admin API จะถูกเก็บใน Database (ตาราง `system_settings`)
- สามารถใช้ทั้ง Environment Variables และ Database (Database จะมีความสำคัญกว่า)

---

## 🎉 เสร็จสิ้น

ตอนนี้ระบบ Telegram Notification พร้อมใช้งานแล้ว!

ถ้ามีปัญหาหรือข้อสงสัย สามารถติดต่อทีมพัฒนาได้ที่:
- GitHub Issues
- Discord: #support

สร้างโดย: เม (Backend Developer) 💕
วันที่: 12 มกราคม 2026
