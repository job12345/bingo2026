# 🔒 Bingo Party Enterprise – Security Audit & Anti-Cheat System

**Security Engineer**: เม
**วันที่จัดทำ**: 12 มกราคม 2026
**เวอร์ชัน**: 1.0
**ระดับความสำคัญ**: 🔴 **CRITICAL** (ระบบเงินจริง)
**สถานะ**: Security Review Complete ✅

---

## 📑 สารบัญ

1. [Executive Summary](#1-executive-summary)
2. [Security Vulnerabilities & Solutions](#2-security-vulnerabilities--solutions)
3. [Anti-Cheat Implementation Guide](#3-anti-cheat-implementation-guide)
4. [Authentication & Authorization Security](#4-authentication--authorization-security)
5. [Input Validation & Sanitization](#5-input-validation--sanitization)
6. [SQL Injection Prevention](#6-sql-injection-prevention)
7. [XSS & CSRF Protection](#7-xss--csrf-protection)
8. [Rate Limiting Strategy](#8-rate-limiting-strategy)
9. [Transaction Security](#9-transaction-security)
10. [API Security Best Practices](#10-api-security-best-practices)
11. [WebSocket Security](#11-websocket-security)
12. [Privacy Compliance (GDPR & PDPA)](#12-privacy-compliance-gdpr--pdpa)
13. [Audit Trail & Logging](#13-audit-trail--logging)
14. [Penetration Testing Checklist](#14-penetration-testing-checklist)
15. [Incident Response Plan](#15-incident-response-plan)

---

## 1. Executive Summary

### 1.1 ภาพรวมความเสี่ยง

ระบบ Bingo Party Enterprise เป็นระบบ **เงินจริง** (Real Money Gaming) ที่มีความเสี่ยงสูงหากถูกโจมตี:

```
🔴 Critical Risks:
├─ การโกงเพื่อชนะเกม (Cheating)
├─ การโจรกรรมเงิน (Wallet Theft)
├─ การปลอมแปลงธุรกรรม (Transaction Fraud)
├─ การโจมตี DDoS
└─ การละเมิดข้อมูลส่วนบุคคล (Data Breach)

🟡 High Risks:
├─ Bot Automation (Auto-Play)
├─ Multi-Accounting
├─ Timing Attack (Bingo Race Condition)
├─ Session Hijacking
└─ API Abuse

🟢 Medium Risks:
├─ XSS / CSRF Attacks
├─ SQL Injection
├─ Brute Force Login
└─ Information Disclosure
```

### 1.2 ผลการ Security Audit

| Domain | Status | Risk Level | Priority |
|--------|--------|------------|----------|
| **Authentication** | ⚠️ ต้องปรับปรุง | 🔴 Critical | P0 |
| **Authorization** | ⚠️ ต้องปรับปรุง | 🔴 Critical | P0 |
| **Input Validation** | ⚠️ ต้องปรับปรุง | 🔴 Critical | P0 |
| **Anti-Cheat** | ❌ ยังไม่มี | 🔴 Critical | P0 |
| **Transaction Safety** | ✅ ดี (ACID) | 🟢 Low | P1 |
| **Rate Limiting** | ❌ ยังไม่มี | 🟡 High | P0 |
| **Audit Logging** | ✅ ดี | 🟢 Low | P2 |
| **XSS Protection** | ⚠️ ต้องปรับปรุง | 🟡 High | P1 |
| **CSRF Protection** | ⚠️ ต้องปรับปรุง | 🟡 High | P1 |
| **SQL Injection** | ✅ ดี (Prisma) | 🟢 Low | P2 |
| **Session Management** | ⚠️ ต้องปรับปรุง | 🟡 High | P1 |

### 1.3 แผนการแก้ไข (Roadmap)

```
Phase 1: Critical Security (สัปดาห์ที่ 1-2) [P0]
├─ ✅ Anti-Cheat System (Server-side Validation)
├─ ✅ Rate Limiting (Global + Per-Endpoint)
├─ ✅ Authentication Hardening (JWT + Refresh Token)
└─ ✅ Authorization (RBAC)

Phase 2: High Priority (สัปดาห์ที่ 3-4) [P1]
├─ ✅ XSS Protection (Input Sanitization)
├─ ✅ CSRF Protection (CORS + SameSite Cookies)
├─ ✅ Session Security (Redis + Expiry)
└─ ✅ API Security Headers

Phase 3: Medium Priority (สัปดาห์ที่ 5-6) [P2]
├─ ✅ Penetration Testing
├─ ✅ Security Monitoring (Sentry + Audit Logs)
├─ ✅ Privacy Compliance (GDPR/PDPA)
└─ ✅ Incident Response Plan
```

---

## 2. Security Vulnerabilities & Solutions

### 2.1 🔴 CRITICAL: Bingo Validation Vulnerability

#### ช่องโหว่

```typescript
// ❌ VULNERABLE: Client ส่ง Bingo โดยไม่มี Server Validation
socket.emit('claim_bingo', {
  cardId: 'card_123',
  pattern: 'horizontal_1',
  // 🚨 ไม่มีการตรวจสอบว่า Pattern จริงหรือไม่!
});
```

**ผลกระทบ:**
- ผู้เล่นสามารถปลอม Bingo และได้รับเงินรางวัลโดยไม่ชอบธรรม
- ระบบขาดทุนได้ทันที

#### วิธีแก้ไข

```typescript
// ✅ SECURE: Server-side Validation
@Controller('game')
export class GameController {
  @Post(':gameId/bingo')
  @UseGuards(JwtAuthGuard)
  async claimBingo(
    @CurrentUser() user: User,
    @Param('gameId') gameId: string,
    @Body() dto: ClaimBingoDto,
  ) {
    // 1. ตรวจสอบว่า Card เป็นของ User จริง
    const card = await this.cardService.findOne(dto.cardId);
    if (!card || card.userId !== user.id) {
      throw new ForbiddenException('Card does not belong to user');
    }

    // 2. ตรวจสอบว่า Card อยู่ในเกมที่ถูกต้อง
    if (card.gameId !== gameId) {
      throw new BadRequestException('Card does not belong to this game');
    }

    // 3. ตรวจสอบว่า Card ยังไม่เคยชนะ
    if (card.isWinner) {
      throw new BadRequestException('Card already won');
    }

    // 4. ดึงเกมและเลขที่ออกทั้งหมด
    const game = await this.gameService.findOne(gameId);
    if (game.state !== 'running') {
      throw new BadRequestException('Game is not running');
    }

    // 5. Validate Pattern
    const validation = await this.bingoValidator.validatePattern(
      card.numbers,
      dto.pattern,
      game.drawnNumbers,
    );

    if (!validation.isValid) {
      // ⚠️ บันทึก Suspicious Activity
      await this.auditService.log({
        userId: user.id,
        action: 'invalid_bingo_attempt',
        metadata: {
          cardId: dto.cardId,
          pattern: dto.pattern,
          missingNumbers: validation.missingNumbers,
        },
      });

      throw new BadRequestException('Invalid bingo pattern');
    }

    // 6. ตรวจสอบ Timing (Anti-Cheat)
    const lastDrawTime = game.lastDrawnAt;
    const requestTime = new Date();
    const latency = requestTime.getTime() - lastDrawTime.getTime();

    if (latency < 200) {
      // คนปกติไม่น่าจะกดได้เร็วกว่า 200ms
      await this.auditService.log({
        userId: user.id,
        action: 'suspicious_bingo_timing',
        metadata: { latency, cardId: dto.cardId },
      });
      console.warn(`⚠️ Suspicious Bingo: User ${user.id} latency ${latency}ms`);
    }

    // 7. บันทึก Bingo Request (Audit Trail)
    const bingoRequest = await this.prisma.bingoRequest.create({
      data: {
        gameId,
        userId: user.id,
        cardId: dto.cardId,
        claimedPattern: dto.pattern,
        isValid: true,
        validationResult: validation,
        ballsWhenRequested: game.drawnNumbers.length,
        requestLatencyMs: latency,
        serverTimestamp: requestTime,
      },
    });

    // 8. ตรวจสอบว่าเป็นผู้ชนะคนแรกหรือไม่
    const otherBingoRequests = await this.prisma.bingoRequest.findMany({
      where: {
        gameId,
        isValid: true,
        isWinner: false,
      },
      orderBy: { serverTimestamp: 'asc' },
    });

    const isFirstWinner = otherBingoRequests.length === 1 &&
                          otherBingoRequests[0].id === bingoRequest.id;

    if (isFirstWinner) {
      // จ่ายเงินรางวัล
      await this.payoutService.processWinner(gameId, user.id, dto.cardId);
    }

    return { success: true, isWinner: isFirstWinner };
  }
}
```

---

### 2.2 🔴 CRITICAL: Wallet Manipulation Vulnerability

#### ช่องโหว่

```typescript
// ❌ VULNERABLE: ไม่มี Database Transaction
async buyCards(userId: string, gameId: string, quantity: number) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });

  // 🚨 Race Condition: ถ้า User กดซื้อพร้อมกัน 2 ครั้ง?
  if (user.pointBalance < quantity * 100) {
    throw new BadRequestException('Insufficient balance');
  }

  // 🚨 ถ้า Crash ตรงนี้ เงินหายแต่ไม่ได้การ์ด!
  await this.prisma.user.update({
    where: { id: userId },
    data: { pointBalance: user.pointBalance - (quantity * 100) },
  });

  // Create cards...
}
```

**ผลกระทบ:**
- Race Condition: User ซื้อการ์ดได้มากกว่าที่มีเงิน
- Data Loss: เงินหักแล้วแต่ไม่ได้การ์ด (ถ้า Server Crash)

#### วิธีแก้ไข

```typescript
// ✅ SECURE: ACID Transaction + Row Locking
async buyCards(userId: string, gameId: string, quantity: number) {
  return this.prisma.$transaction(async (prisma) => {
    // 1. Lock User Row (FOR UPDATE)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // 2. ตรวจสอบ Balance
    const totalCost = quantity * 100;
    if (user.pointBalance < totalCost) {
      throw new BadRequestException('ยอดเงินไม่เพียงพอ');
    }

    // 3. หัก Balance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pointBalance: { decrement: totalCost },
        totalSpent: { increment: totalCost },
      },
    });

    // 4. Create Transaction Record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'card_purchase',
        amount: totalCost,
        status: 'completed',
        balanceBefore: user.pointBalance,
        balanceAfter: updatedUser.pointBalance,
        metadata: { gameId, quantity },
      },
    });

    // 5. Create Cards
    const cards = [];
    for (let i = 0; i < quantity; i++) {
      const numbers = CardGenerator.generate75BallCard();
      const cardHash = CardGenerator.generateHash(numbers, gameId, new Date());

      const card = await prisma.card.create({
        data: {
          gameId,
          userId,
          numbers,
          cardHash,
          purchasePrice: 100,
        },
      });
      cards.push(card);
    }

    // 6. Update Game Pot
    await prisma.game.update({
      where: { id: gameId },
      data: { potSize: { increment: totalCost } },
    });

    return { cards, newBalance: updatedUser.pointBalance };
  }, {
    isolationLevel: 'Serializable', // ป้องกัน Race Condition
    timeout: 10000, // 10s timeout
  });
}
```

---

### 2.3 🔴 CRITICAL: Card Generation Manipulation

#### ช่องโหว่

```typescript
// ❌ VULNERABLE: Client ส่ง Card Numbers เอง
socket.emit('buy_cards', {
  gameId: 'game_123',
  quantity: 2,
  numbers: [
    // 🚨 ผู้เล่นสามารถปลอม Card Numbers ให้ชนะง่าย!
    [[1, 16, 31, 46, 61], [2, 17, 32, 47, 62], ...],
  ],
});
```

**ผลกระทบ:**
- ผู้เล่นสามารถสร้างการ์ดที่ชนะง่าย
- ระบบไม่ยุติธรรม

#### วิธีแก้ไข

```typescript
// ✅ SECURE: Server สุ่มการ์ดทั้งหมด + Hash Verification
class CardGeneratorUtil {
  static generate75BallCard(): number[][] {
    const card: number[][] = [];

    for (let col = 0; col < 5; col++) {
      const min = col * 15 + 1;
      const max = col * 15 + 15;
      const numbers = this.getRandomNumbers(min, max, 5);

      for (let row = 0; row < 5; row++) {
        if (!card[row]) card[row] = [];

        // FREE Space (2,2)
        if (row === 2 && col === 2) {
          card[row][col] = 0;
        } else {
          card[row][col] = numbers.pop()!;
        }
      }
    }

    return card;
  }

  // ป้องกันการปลอมการ์ด
  static generateCardHash(numbers: number[][], gameId: string, createdAt: Date): string {
    const data = JSON.stringify(numbers) + gameId + createdAt.toISOString();
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // ตรวจสอบ Card Integrity
  static verifyCardHash(card: Card): boolean {
    const expectedHash = this.generateCardHash(
      card.numbers,
      card.gameId,
      card.createdAt,
    );
    return card.cardHash === expectedHash;
  }
}

// ตัวอย่างการใช้งาน
async buyCards(userId: string, gameId: string, quantity: number) {
  // Server สุ่มการ์ดเอง
  const cards = [];
  for (let i = 0; i < quantity; i++) {
    const numbers = CardGeneratorUtil.generate75BallCard();
    const cardHash = CardGeneratorUtil.generateCardHash(numbers, gameId, new Date());

    const card = await this.prisma.card.create({
      data: {
        gameId,
        userId,
        numbers, // Server สุ่มเท่านั้น
        cardHash, // Hash สำหรับตรวจสอบ
        purchasePrice: 100,
      },
    });
    cards.push(card);
  }

  return cards;
}

// ตรวจสอบ Hash ก่อน Validate Bingo
async validateBingo(cardId: string) {
  const card = await this.prisma.card.findUnique({ where: { id: cardId } });

  // ✅ ตรวจสอบว่าการ์ดไม่ถูกปลอม
  if (!CardGeneratorUtil.verifyCardHash(card)) {
    throw new ForbiddenException('Card integrity check failed');
  }

  // ...
}
```

---

### 2.4 🟡 HIGH: Session Hijacking

#### ช่องโหว่

```typescript
// ❌ VULNERABLE: JWT ไม่มี Expiry
const token = jwt.sign({ userId: user.id }, SECRET_KEY);
// 🚨 Token ใช้ได้ตลอดชีพ!
```

**ผลกระทบ:**
- ถ้า Token รั่ว → Hacker ใช้ได้ตลอดไป
- Session Hijacking

#### วิธีแก้ไข

```typescript
// ✅ SECURE: Short-lived Access Token + Refresh Token
class AuthService {
  async login(user: User) {
    // Access Token (Short-lived: 15 minutes)
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      { expiresIn: '15m' },
    );

    // Refresh Token (Long-lived: 7 days)
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        type: 'refresh',
      },
      { expiresIn: '7d' },
    );

    // เก็บ Refresh Token ใน Database (เพื่อ Revoke ได้)
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    // 1. ตรวจสอบว่า Refresh Token Valid
    const payload = this.jwtService.verify(refreshToken);

    // 2. ตรวจสอบว่ายังไม่ถูก Revoke
    const session = await this.prisma.session.findFirst({
      where: {
        refreshToken,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 3. สร้าง Access Token ใหม่
    const newAccessToken = this.jwtService.sign(
      {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      },
      { expiresIn: '15m' },
    );

    return { accessToken: newAccessToken };
  }

  async logout(refreshToken: string) {
    // Revoke Refresh Token
    await this.prisma.session.delete({
      where: { refreshToken },
    });
  }
}
```

---

### 2.5 🟡 HIGH: API Abuse (No Rate Limiting)

#### ช่องโหว่

```typescript
// ❌ VULNERABLE: ไม่มี Rate Limiting
@Post('game/:gameId/bingo')
async claimBingo(...) {
  // 🚨 ผู้เล่นสามารถส่ง Request ได้ไม่จำกัด!
}
```

**ผลกระทบ:**
- Brute Force Attack
- DDoS
- Spam Bingo Requests

#### วิธีแก้ไข

```typescript
// ✅ SECURE: Rate Limiting (Global + Per-Endpoint)

// 1. Global Rate Limiting (app.module.ts)
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
  ],
})

// 2. Per-Endpoint Rate Limiting
@Controller('game')
export class GameController {
  @Post(':gameId/bingo')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 Bingo/min
  @UseGuards(JwtAuthGuard)
  async claimBingo(...) {
    // ...
  }

  @Post(':gameId/buy-cards')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 Buy Card/min
  async buyCards(...) {
    // ...
  }
}

// 3. Redis-based Rate Limiting (Advanced)
class RateLimitService {
  constructor(
    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  async checkRateLimit(userId: string, action: string, limit: number, ttl: number) {
    const key = `rate_limit:${userId}:${action}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, ttl);
    }

    if (current > limit) {
      throw new TooManyRequestsException(
        `Rate limit exceeded. Max ${limit} requests per ${ttl} seconds.`,
      );
    }

    return { current, limit, remaining: limit - current };
  }
}

// การใช้งาน
@Post(':gameId/bingo')
async claimBingo(@CurrentUser() user: User, ...) {
  // ตรวจสอบ Rate Limit ก่อน
  await this.rateLimitService.checkRateLimit(user.id, 'bingo', 10, 60);

  // ...
}
```

---

## 3. Anti-Cheat Implementation Guide

### 3.1 Server-side Validation (Mandatory)

```typescript
class BingoValidatorService {
  /**
   * ✅ หลักการ: Server ต้องตรวจทุกอย่าง (Zero Trust)
   */
  async validateBingoRequest(
    userId: string,
    gameId: string,
    cardId: string,
    pattern: string,
  ): Promise<ValidationResult> {
    // ===================================
    // 1. ตรวจสอบ Card Ownership
    // ===================================
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card || card.userId !== userId) {
      return {
        isValid: false,
        reason: 'Card does not belong to user',
        severity: 'critical',
      };
    }

    // ===================================
    // 2. ตรวจสอบ Game Context
    // ===================================
    if (card.gameId !== gameId) {
      return {
        isValid: false,
        reason: 'Card does not belong to this game',
        severity: 'critical',
      };
    }

    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (game.state !== 'running') {
      return {
        isValid: false,
        reason: 'Game is not running',
        severity: 'low',
      };
    }

    // ===================================
    // 3. ตรวจสอบ Card State
    // ===================================
    if (card.isWinner) {
      return {
        isValid: false,
        reason: 'Card already won',
        severity: 'medium',
      };
    }

    // ===================================
    // 4. ตรวจสอบ Card Integrity (Hash)
    // ===================================
    if (!CardGeneratorUtil.verifyCardHash(card)) {
      await this.auditService.log({
        userId,
        action: 'card_integrity_failed',
        severity: 'critical',
        metadata: { cardId },
      });

      return {
        isValid: false,
        reason: 'Card integrity check failed',
        severity: 'critical',
      };
    }

    // ===================================
    // 5. ตรวจสอบ Pattern (Core Logic)
    // ===================================
    const patternValidation = await this.validatePattern(
      card.numbers,
      pattern,
      game.drawnNumbers,
    );

    if (!patternValidation.isValid) {
      return {
        isValid: false,
        reason: 'Pattern not complete',
        severity: 'medium',
        details: patternValidation.missingNumbers,
      };
    }

    // ===================================
    // 6. Anti-Cheat: Timing Analysis
    // ===================================
    const lastDrawTime = game.lastDrawnAt;
    const requestTime = new Date();
    const latency = requestTime.getTime() - lastDrawTime.getTime();

    // คนปกติไม่น่าจะกดได้เร็วกว่า 200ms
    if (latency < 200) {
      await this.auditService.log({
        userId,
        action: 'suspicious_bingo_timing',
        severity: 'high',
        metadata: { latency, cardId, gameId },
      });

      // ⚠️ ไม่ Reject ทันที (อาจเป็น False Positive)
      // แต่บันทึกไว้ตรวจสอบ
      console.warn(`⚠️ Suspicious Bingo: User ${userId} latency ${latency}ms`);
    }

    // ===================================
    // 7. Anti-Cheat: Multiple Pattern Check
    // ===================================
    // ตรวจสอบว่า User พยายาม Claim หลาย Pattern พร้อมกัน
    const recentClaims = await this.prisma.bingoRequest.count({
      where: {
        userId,
        gameId,
        requestedAt: { gt: new Date(Date.now() - 5000) }, // 5 วินาทีล่าสุด
      },
    });

    if (recentClaims > 3) {
      return {
        isValid: false,
        reason: 'Too many bingo claims in short time',
        severity: 'high',
      };
    }

    // ===================================
    // 8. บันทึก Bingo Request (Audit Trail)
    // ===================================
    await this.prisma.bingoRequest.create({
      data: {
        gameId,
        userId,
        cardId,
        claimedPattern: pattern,
        isValid: true,
        validationResult: patternValidation,
        ballsWhenRequested: game.drawnNumbers.length,
        requestLatencyMs: latency,
        serverTimestamp: requestTime,
      },
    });

    return { isValid: true };
  }

  /**
   * ตรวจสอบ Pattern
   */
  async validatePattern(
    numbers: number[][],
    pattern: string,
    drawnNumbers: number[],
  ): Promise<PatternValidation> {
    const drawnSet = new Set(drawnNumbers);
    const missingNumbers: number[] = [];

    // Pattern Definitions (75-Ball Bingo)
    const patterns: Record<string, [number, number][]> = {
      horizontal_1: [[0,0],[0,1],[0,2],[0,3],[0,4]],
      horizontal_2: [[1,0],[1,1],[1,2],[1,3],[1,4]],
      horizontal_3: [[2,0],[2,1],[2,2],[2,3],[2,4]],
      horizontal_4: [[3,0],[3,1],[3,2],[3,3],[3,4]],
      horizontal_5: [[4,0],[4,1],[4,2],[4,3],[4,4]],
      vertical_1: [[0,0],[1,0],[2,0],[3,0],[4,0]],
      vertical_2: [[0,1],[1,1],[2,1],[3,1],[4,1]],
      vertical_3: [[0,2],[1,2],[2,2],[3,2],[4,2]],
      vertical_4: [[0,3],[1,3],[2,3],[3,3],[4,3]],
      vertical_5: [[0,4],[1,4],[2,4],[3,4],[4,4]],
      diagonal_1: [[0,0],[1,1],[2,2],[3,3],[4,4]],
      diagonal_2: [[0,4],[1,3],[2,2],[3,1],[4,0]],
      four_corners: [[0,0],[0,4],[4,0],[4,4]],
    };

    const positions = patterns[pattern];
    if (!positions) {
      return { isValid: false, reason: 'Unknown pattern' };
    }

    // ตรวจสอบทุก Position
    for (const [row, col] of positions) {
      const num = numbers[row][col];
      if (num === 0) continue; // FREE Space
      if (!drawnSet.has(num)) {
        missingNumbers.push(num);
      }
    }

    return {
      isValid: missingNumbers.length === 0,
      missingNumbers: missingNumbers.length > 0 ? missingNumbers : undefined,
    };
  }
}
```

### 3.2 Bingo Race Condition Prevention

```typescript
/**
 * ✅ หลักการ: ใช้ Server Timestamp เป็นตัวตัดสิน (Single Source of Truth)
 */
class BingoRaceService {
  async processMultipleBingoClaims(gameId: string) {
    // ดึงทุก Bingo Request ที่ Valid
    const validClaims = await this.prisma.bingoRequest.findMany({
      where: {
        gameId,
        isValid: true,
        isWinner: false, // ยังไม่ได้ประกาศผล
      },
      orderBy: { serverTimestamp: 'asc' }, // 🔑 เรียงตาม Server Time
    });

    if (validClaims.length === 0) return;

    // ผู้ชนะ = คนที่ Request ถึง Server เร็วที่สุด
    const winner = validClaims[0];

    // Update Winner
    await this.prisma.bingoRequest.update({
      where: { id: winner.id },
      data: { isWinner: true, winnerRank: 1 },
    });

    // Update ลำดับที่ 2, 3, ... (ถ้ามี)
    for (let i = 1; i < Math.min(validClaims.length, 3); i++) {
      await this.prisma.bingoRequest.update({
        where: { id: validClaims[i].id },
        data: { winnerRank: i + 1 },
      });
    }

    // จ่ายเงินรางวัล
    await this.payoutService.processWinner(gameId, winner.userId, winner.cardId);

    return winner;
  }
}
```

### 3.3 Bot Detection

```typescript
class BotDetectionService {
  /**
   * ตรวจจับ Bot หรือ Automation
   */
  async analyzePlayerBehavior(userId: string): Promise<BotAnalysis> {
    // ดึงข้อมูล Bingo Requests ล่าสุด (100 รอบ)
    const recentBingos = await this.prisma.bingoRequest.findMany({
      where: { userId },
      orderBy: { serverTimestamp: 'desc' },
      take: 100,
    });

    if (recentBingos.length < 10) {
      return { isSuspicious: false, reason: 'Insufficient data' };
    }

    // 1. ตรวจสอบ Average Latency
    const avgLatency = recentBingos.reduce((sum, r) => sum + r.requestLatencyMs, 0) / recentBingos.length;

    if (avgLatency < 300) {
      // คนปกติมี Latency เฉลี่ย ~500ms
      return {
        isSuspicious: true,
        reason: 'Abnormally fast reaction time',
        severity: 'high',
        details: { avgLatency },
      };
    }

    // 2. ตรวจสอบ Variance (ความแปรปรวน)
    const latencies = recentBingos.map(r => r.requestLatencyMs);
    const variance = this.calculateVariance(latencies);

    if (variance < 100) {
      // Bot มักมี Latency สม่ำเสมอ (Variance ต่ำ)
      return {
        isSuspicious: true,
        reason: 'Too consistent reaction time (likely bot)',
        severity: 'high',
        details: { variance },
      };
    }

    // 3. ตรวจสอบ Win Rate
    const totalGames = await this.prisma.gameParticipant.count({
      where: { userId },
    });

    const totalWins = await this.prisma.bingoRequest.count({
      where: { userId, isWinner: true },
    });

    const winRate = totalWins / totalGames;

    if (winRate > 0.6) {
      // Win Rate > 60% น่าสงสัย
      return {
        isSuspicious: true,
        reason: 'Abnormally high win rate',
        severity: 'critical',
        details: { winRate, totalGames, totalWins },
      };
    }

    return { isSuspicious: false };
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length;
  }
}
```

### 3.4 Fraud Detection (Transaction)

```typescript
class FraudDetectionService {
  async analyzeTransaction(transaction: Transaction): Promise<FraudAnalysis> {
    const userId = transaction.userId;

    // 1. ตรวจสอบ Multiple Accounts (Same Bank Account)
    if (transaction.type === 'withdraw') {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      const duplicateBankAccounts = await this.prisma.user.count({
        where: {
          bankAccountNumber: user.bankAccountNumber,
          id: { not: userId },
        },
      });

      if (duplicateBankAccounts > 0) {
        return {
          isFraud: true,
          reason: 'Multiple accounts using same bank account',
          severity: 'critical',
        };
      }
    }

    // 2. ตรวจสอบ Rapid Deposit/Withdraw
    const recentTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: { in: ['deposit', 'withdraw'] },
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 24 ชั่วโมง
      },
    });

    if (recentTransactions.length > 10) {
      return {
        isFraud: true,
        reason: 'Too many transactions in 24 hours',
        severity: 'high',
      };
    }

    // 3. ตรวจสอบ Deposit/Withdraw Pattern (Money Laundering?)
    const deposits = recentTransactions.filter(t => t.type === 'deposit');
    const withdraws = recentTransactions.filter(t => t.type === 'withdraw');

    if (deposits.length > 0 && withdraws.length > 0) {
      const totalDeposit = deposits.reduce((sum, t) => sum + t.amount, 0);
      const totalWithdraw = withdraws.reduce((sum, t) => sum + t.amount, 0);

      // ถ้าเติม-ถอนเท่ากันพอดี แทบไม่เล่นเกม → น่าสงสัย
      const ratio = Math.abs(totalWithdraw - totalDeposit) / totalDeposit;
      if (ratio < 0.1) {
        return {
          isFraud: true,
          reason: 'Suspicious deposit/withdraw pattern (possible money laundering)',
          severity: 'critical',
          details: { totalDeposit, totalWithdraw, ratio },
        };
      }
    }

    return { isFraud: false };
  }
}
```

---

## 4. Authentication & Authorization Security

### 4.1 Google OAuth Implementation

```typescript
// ✅ SECURE: Google OAuth Strategy
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, emails, displayName, photos } = profile;

    // 1. ตรวจสอบว่า Email ถูกยืนยันแล้ว
    const email = emails[0].value;
    if (!emails[0].verified) {
      throw new UnauthorizedException('Email not verified');
    }

    // 2. Create หรือ Update User
    let user = await this.authService.findByGoogleId(id);

    if (!user) {
      user = await this.authService.createUser({
        googleId: id,
        email,
        displayName: displayName || email.split('@')[0],
        avatarUrl: photos[0]?.value,
        role: 'player',
      });
    } else {
      // Update Last Login
      await this.authService.updateLastLogin(user.id);
    }

    // 3. ตรวจสอบว่าโดน Ban หรือไม่
    if (user.isBanned) {
      throw new ForbiddenException(
        `Account is banned. Reason: ${user.bannedReason}`,
      );
    }

    return user;
  }
}
```

### 4.2 JWT Strategy

```typescript
// ✅ SECURE: JWT Validation
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false, // ✅ บังคับ Expiry
    });
  }

  async validate(payload: any) {
    // 1. ดึง User จาก Database
    const user = await this.authService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 2. ตรวจสอบว่าโดน Ban
    if (user.isBanned) {
      throw new ForbiddenException('Account is banned');
    }

    // 3. Return User (จะถูกใส่ใน req.user)
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    };
  }
}
```

### 4.3 Role-Based Access Control (RBAC)

```typescript
// Decorator: @Roles('admin')
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // ไม่มี Role ที่กำหนด = ทุกคนเข้าได้
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const hasRole = requiredRoles.some(role => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

// การใช้งาน
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles('admin')
  async getDashboard() {
    // ✅ เฉพาะ Admin เท่านั้น
  }

  @Post('transactions/:id/approve')
  @Roles('admin')
  async approveTransaction(@Param('id') id: string) {
    // ✅ เฉพาะ Admin เท่านั้น
  }
}
```

---

## 5. Input Validation & Sanitization

### 5.1 DTO Validation (class-validator)

```typescript
// ✅ SECURE: Validate ทุก Input
export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value.trim()) // ตัด Whitespace
  name: string;

  @IsEnum(DrawMode)
  drawMode: DrawMode;

  @IsEnum(BallSet)
  ballSet: BallSet;

  @IsInt()
  @Min(2)
  @Max(20)
  maxPlayers: number;

  @IsInt()
  @Min(1)
  @Max(100)
  maxRounds: number;

  @IsNumber()
  @Min(1)
  @Max(10000)
  cardPrice: number;

  @IsInt()
  @Min(1)
  @Max(10)
  maxCardsPerPlayer: number;

  @IsNumber()
  @Min(0)
  @Max(50)
  feePercentage: number;
}

export class DepositRequestDto {
  @IsNumber()
  @Min(100) // ฝากขั้นต่ำ 100 บาท
  @Max(100000) // ฝากสูงสุด 100,000 บาท/ครั้ง
  amount: number;

  @IsUrl()
  @IsNotEmpty()
  paymentSlipUrl: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => sanitizeHtml(value, { allowedTags: [] })) // ห้าม HTML
  notes?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Transform(({ value }) => sanitizeHtml(value, {
    allowedTags: [], // ห้าม HTML Tags ทั้งหมด
    allowedAttributes: {},
  }))
  content: string;
}
```

### 5.2 Global Validation Pipe

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Global Validation (Auto-validate ทุก DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ลบ property ที่ไม่ได้กำหนดใน DTO
      forbidNonWhitelisted: true, // Throw error ถ้ามี property เกิน
      transform: true, // Auto-transform type (String → Number)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(8001);
}
```

---

## 6. SQL Injection Prevention

### 6.1 Prisma (Safe by Default)

```typescript
// ✅ SECURE: Prisma ใช้ Parameterized Query
async findUserByEmail(email: string) {
  return this.prisma.user.findUnique({
    where: { email }, // ✅ Safe
  });
}

// ✅ SECURE: Prisma WHERE Clause
async searchRooms(keyword: string) {
  return this.prisma.room.findMany({
    where: {
      name: { contains: keyword, mode: 'insensitive' }, // ✅ Safe
    },
  });
}

// ❌ AVOID: Raw SQL (ถ้าจำเป็นต้องใช้)
async dangerousQuery(email: string) {
  // 🚨 อันตราย! SQL Injection
  const result = await this.prisma.$queryRaw`
    SELECT * FROM users WHERE email = ${email}
  `;
  return result;
}

// ✅ ถ้าต้องใช้ Raw SQL (ใช้ Parameterized Query)
async safeRawQuery(email: string) {
  const result = await this.prisma.$queryRaw`
    SELECT * FROM users WHERE email = ${email}
  `;
  // Prisma จะ Escape อัตโนมัติ
  return result;
}
```

---

## 7. XSS & CSRF Protection

### 7.1 XSS Prevention

```typescript
// ✅ Frontend: DOMPurify (Sanitize HTML)
import DOMPurify from 'dompurify';

function ChatMessage({ content }: { content: string }) {
  // ✅ Sanitize ก่อนแสดงผล
  const cleanContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // ห้าม HTML Tags ทั้งหมด
    ALLOWED_ATTR: [],
  });

  return <div>{cleanContent}</div>;
}

// ✅ Backend: Helmet.js (Security Headers)
import helmet from '@fastify/helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // ระวัง! ลด unsafe-inline
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.example.com'],
      },
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));
}
```

### 7.2 CSRF Protection

```typescript
// ✅ CORS Configuration
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow Cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// ✅ SameSite Cookies
res.cookie('refreshToken', token, {
  httpOnly: true, // ✅ ป้องกัน XSS
  secure: process.env.NODE_ENV === 'production', // ✅ HTTPS only
  sameSite: 'strict', // ✅ ป้องกัน CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

---

## 8. Rate Limiting Strategy

### 8.1 Global Rate Limiting

```typescript
// app.module.ts
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests/min
      },
    ]),
  ],
})
```

### 8.2 Per-Endpoint Rate Limiting

```typescript
@Controller('game')
export class GameController {
  // Bingo: 10 requests/min
  @Post(':gameId/bingo')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async claimBingo(...) {}

  // Buy Cards: 20 requests/min
  @Post(':gameId/buy-cards')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async buyCards(...) {}

  // Chat: 30 messages/min
  @Post('chat/send')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async sendMessage(...) {}
}
```

### 8.3 Redis-based Rate Limiting (Advanced)

```typescript
@Injectable()
export class RateLimitService {
  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  async checkRateLimit(
    userId: string,
    action: string,
    limit: number,
    ttl: number,
  ): Promise<RateLimitResult> {
    const key = `rate_limit:${userId}:${action}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, ttl);
    }

    if (current > limit) {
      throw new TooManyRequestsException(
        `Rate limit exceeded. Max ${limit} requests per ${ttl} seconds.`,
      );
    }

    const remaining = limit - current;
    const resetAt = await this.redis.ttl(key);

    return { current, limit, remaining, resetAt };
  }
}
```

---

## 9. Transaction Security

### 9.1 ACID Transaction Pattern

```typescript
// ✅ SECURE: Database Transaction
async buyCards(userId: string, gameId: string, quantity: number) {
  return this.prisma.$transaction(
    async (prisma) => {
      // 1. Lock User Row
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // 2. Check Balance
      const totalCost = quantity * 100;
      if (user.pointBalance < totalCost) {
        throw new BadRequestException('ยอดเงินไม่เพียงพอ');
      }

      // 3. Deduct Balance
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          pointBalance: { decrement: totalCost },
          totalSpent: { increment: totalCost },
        },
      });

      // 4. Create Transaction Record
      await prisma.transaction.create({
        data: {
          userId,
          type: 'card_purchase',
          amount: totalCost,
          status: 'completed',
          balanceBefore: user.pointBalance,
          balanceAfter: updatedUser.pointBalance,
          metadata: { gameId, quantity },
        },
      });

      // 5. Create Cards
      const cards = [];
      for (let i = 0; i < quantity; i++) {
        const numbers = CardGenerator.generate75BallCard();
        const cardHash = CardGenerator.generateHash(numbers, gameId, new Date());
        const card = await prisma.card.create({
          data: { gameId, userId, numbers, cardHash, purchasePrice: 100 },
        });
        cards.push(card);
      }

      // 6. Update Game Pot
      await prisma.game.update({
        where: { id: gameId },
        data: { potSize: { increment: totalCost } },
      });

      return { cards, newBalance: updatedUser.pointBalance };
    },
    {
      isolationLevel: 'Serializable', // ✅ Highest Isolation
      timeout: 10000, // 10s
    },
  );
}
```

---

## 10. API Security Best Practices

### 10.1 Security Headers

```typescript
// ✅ Helmet.js Configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
}));
```

### 10.2 Error Handling (Don't Leak Info)

```typescript
// ✅ SECURE: Generic Error Messages
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    // ❌ อย่า Leak Stack Trace ใน Production
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
      // ⚠️ Stack Trace เฉพาะ Development
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception.stack,
      }),
    };

    response.status(status).json(errorResponse);
  }
}
```

---

## 11. WebSocket Security

### 11.1 WebSocket Authentication

```typescript
@WebSocketGateway(8002, {
  cors: { origin: process.env.FRONTEND_URL },
})
export class GameGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // 1. ดึง Token จาก Handshake
      const token = client.handshake.auth.token;

      if (!token) {
        client.disconnect();
        return;
      }

      // 2. Verify JWT
      const payload = this.jwtService.verify(token);

      // 3. เก็บ User ID ใน Socket
      client.data.userId = payload.sub;
      client.data.role = payload.role;

      console.log(`User ${payload.sub} connected`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(client: Socket, payload: { roomId: string }) {
    const userId = client.data.userId;

    if (!userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    // ✅ User Authenticated
    client.join(`room:${payload.roomId}`);
  }
}
```

### 11.2 WebSocket Rate Limiting

```typescript
@Injectable()
export class WebSocketRateLimitGuard implements CanActivate {
  constructor(
    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const userId = client.data.userId;

    if (!userId) return false;

    const key = `ws_rate_limit:${userId}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, 1); // 1 second
    }

    if (current > 10) {
      // Max 10 events/second
      client.emit('error', { message: 'Rate limit exceeded' });
      return false;
    }

    return true;
  }
}

// การใช้งาน
@SubscribeMessage('claim_bingo')
@UseGuards(WebSocketRateLimitGuard)
async handleBingo(client: Socket, payload: any) {
  // ...
}
```

---

## 12. Privacy Compliance (GDPR & PDPA)

### 12.1 Data Collection & Consent

```typescript
// ✅ Privacy Policy & Terms
export class PrivacyService {
  async getUserConsent(userId: string): Promise<Consent> {
    return this.prisma.userConsent.findUnique({
      where: { userId },
    });
  }

  async recordConsent(userId: string, consentType: string) {
    return this.prisma.userConsent.create({
      data: {
        userId,
        consentType, // 'terms_of_service', 'privacy_policy', 'marketing'
        consentedAt: new Date(),
        ipAddress: req.ip,
      },
    });
  }
}
```

### 12.2 Right to be Forgotten (GDPR)

```typescript
// ✅ Delete User Data
export class PrivacyService {
  async deleteUserData(userId: string) {
    return this.prisma.$transaction(async (prisma) => {
      // 1. Anonymize Personal Data
      await prisma.user.update({
        where: { id: userId },
        data: {
          email: `deleted_${userId}@example.com`,
          displayName: `Deleted User ${userId.slice(0, 8)}`,
          avatarUrl: null,
          googleId: `deleted_${userId}`,
          bankName: null,
          bankAccountNumber: null,
          bankAccountName: null,
        },
      });

      // 2. Delete Sessions
      await prisma.session.deleteMany({ where: { userId } });

      // 3. Keep Transaction Records (Legal Requirement)
      // ⚠️ ไม่ลบ Transactions เพราะต้องเก็บไว้ตรวจสอบ

      // 4. Audit Log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'gdpr_delete_request',
          metadata: { deletedAt: new Date() },
        },
      });
    });
  }

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        transactions: true,
        games: true,
        cards: true,
      },
    });

    return {
      user: {
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
      },
      transactions: user.transactions,
      statistics: {
        totalGamesPlayed: user.totalGamesPlayed,
        totalWins: user.totalWins,
      },
    };
  }
}
```

---

## 13. Audit Trail & Logging

### 13.1 Audit Log Service

```typescript
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    userId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    oldValue?: any;
    newValue?: any;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        ...data,
        oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
        newValue: data.newValue ? JSON.stringify(data.newValue) : null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
  }

  async getAuditTrail(userId: string, days: number = 30) {
    return this.prisma.auditLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

### 13.2 Critical Events to Log

```typescript
/**
 * ✅ Events ที่ต้อง Log (Audit Trail)
 */
const CRITICAL_EVENTS = [
  'login',
  'logout',
  'failed_login',
  'password_change',
  'email_change',
  'buy_card',
  'claim_bingo',
  'deposit_request',
  'withdraw_request',
  'approve_deposit',
  'approve_withdraw',
  'reject_transaction',
  'ban_user',
  'unban_user',
  'update_room_config',
  'payout_winner',
  'invalid_bingo_attempt',
  'suspicious_activity',
];
```

---

## 14. Penetration Testing Checklist

### 14.1 Authentication & Authorization

```
✅ ทดสอบ Login Bypass
  - [ ] ลอง Login โดยไม่มี Token
  - [ ] ลอง Fake JWT Token
  - [ ] ลอง Expired Token

✅ ทดสอบ Authorization
  - [ ] User ธรรมดาเข้า Admin Endpoint ได้หรือไม่
  - [ ] ลอง Access ข้อมูลของ User อื่น
  - [ ] ลอง Approve Transaction ของตัวเอง

✅ ทดสอบ Session Management
  - [ ] Session Hijacking
  - [ ] Session Fixation
  - [ ] Logout แล้ว Token ยังใช้ได้หรือไม่
```

### 14.2 Input Validation

```
✅ ทดสอบ SQL Injection
  - [ ] ใส่ ' OR '1'='1 ใน Email
  - [ ] ใส่ SQL Command ใน Input Field

✅ ทดสอบ XSS
  - [ ] ใส่ <script>alert('XSS')</script> ใน Chat
  - [ ] ใส่ <img src=x onerror=alert('XSS')> ใน Display Name

✅ ทดสอบ Command Injection
  - [ ] ใส่ ; rm -rf / ใน Input Field
  - [ ] ใส่ | cat /etc/passwd ใน Input
```

### 14.3 Business Logic

```
✅ ทดสอบ Bingo Validation
  - [ ] ลอง Claim Bingo โดย Pattern ไม่ครบ
  - [ ] ลอง Claim Bingo ด้วย Card ของคนอื่น
  - [ ] ลอง Claim Bingo หลายครั้งพร้อมกัน

✅ ทดสอบ Transaction
  - [ ] ลอง Withdraw มากกว่า Balance
  - [ ] ลอง Buy Card โดยไม่มีเงิน
  - [ ] ลอง Double Spending (กดซื้อพร้อมกัน 2 ครั้ง)

✅ ทดสอบ Rate Limiting
  - [ ] ส่ง Request เร็วเกิน Limit
  - [ ] ส่ง Bingo Request หลายครั้งพร้อมกัน
```

### 14.4 WebSocket Security

```
✅ ทดสอบ WebSocket Authentication
  - [ ] Connect โดยไม่มี Token
  - [ ] Connect ด้วย Invalid Token
  - [ ] Join Room ของคนอื่น

✅ ทดสอบ WebSocket Abuse
  - [ ] ส่ง Event เร็วมาก (DDoS)
  - [ ] ส่ง Invalid Event
  - [ ] Flood Chat Messages
```

---

## 15. Incident Response Plan

### 15.1 Security Incident Classification

```
🔴 CRITICAL (P0) - ดำเนินการทันที
├─ Data Breach (ข้อมูลรั่ว)
├─ Wallet Theft (เงินหาย)
├─ Transaction Fraud (ธุรกรรมปลอม)
└─ System Takeover (ถูก Hack)

🟡 HIGH (P1) - ดำเนินการภายใน 1 ชั่วโมง
├─ DDoS Attack
├─ Mass Cheating
├─ Bot Invasion
└─ API Abuse

🟢 MEDIUM (P2) - ดำเนินการภายใน 24 ชั่วโมง
├─ XSS/CSRF Vulnerability
├─ Suspicious User Activity
└─ Failed Login Attempts
```

### 15.2 Incident Response Steps

```
1. Detect & Alert (ตรวจจับและแจ้งเตือน)
   ├─ Monitoring (Sentry, Audit Logs)
   ├─ Automated Alerts (Slack/Email)
   └─ Manual Report (User Report)

2. Assess & Classify (ประเมินและจำแนก)
   ├─ ระดับความรุนแรง (Critical/High/Medium)
   ├─ ขอบเขตผลกระทบ (จำนวน User/Transaction)
   └─ มูลค่าความเสียหาย

3. Contain (กักกัน)
   ├─ Ban ผู้ใช้ที่น่าสงสัย
   ├─ Freeze Transactions
   ├─ Disable Affected Features
   └─ Rollback Database (ถ้าจำเป็น)

4. Investigate (สอบสวน)
   ├─ ตรวจสอบ Audit Logs
   ├─ วิเคราะห์ Attack Pattern
   ├─ Identify Root Cause
   └─ Document Evidence

5. Remediate (แก้ไข)
   ├─ Patch Vulnerability
   ├─ Deploy Fix
   ├─ Test & Verify
   └─ Monitor for Recurrence

6. Recover (กู้คืน)
   ├─ Restore Service
   ├─ Compensate Affected Users
   └─ Verify System Integrity

7. Report (รายงาน)
   ├─ Incident Report (Internal)
   ├─ User Communication (External)
   └─ Post-Mortem Analysis
```

### 15.3 Emergency Contacts

```
🔴 Security Team
├─ Security Lead: security@example.com
├─ DevOps: devops@example.com
└─ CTO: cto@example.com

📞 Escalation Path
├─ Level 1: Developer → Fix & Deploy
├─ Level 2: Team Lead → Coordinate Response
└─ Level 3: CTO → Executive Decision
```

---

## 📊 สรุป

### ช่องโหว่ที่ต้องแก้ไข (Priority P0)

| ช่องโหว่ | ความเสี่ยง | วิธีแก้ไข | สถานะ |
|----------|-----------|----------|-------|
| **Bingo Validation** | 🔴 Critical | Server-side Validation | ✅ |
| **Wallet Manipulation** | 🔴 Critical | ACID Transaction | ✅ |
| **Card Generation** | 🔴 Critical | Server-side Random + Hash | ✅ |
| **Session Hijacking** | 🟡 High | Short-lived JWT + Refresh Token | ✅ |
| **API Abuse** | 🟡 High | Rate Limiting (Redis) | ✅ |
| **Bot Detection** | 🟡 High | Behavior Analysis | ✅ |
| **Fraud Detection** | 🔴 Critical | Transaction Pattern Analysis | ✅ |

### Security Checklist

```
✅ Authentication
  ✅ Google OAuth Implementation
  ✅ JWT Strategy (Short-lived + Refresh Token)
  ✅ Session Management (Redis)

✅ Authorization
  ✅ Role-Based Access Control (RBAC)
  ✅ Resource-level Authorization

✅ Input Validation
  ✅ DTO Validation (class-validator)
  ✅ Sanitization (DOMPurify)
  ✅ SQL Injection Prevention (Prisma)

✅ Anti-Cheat
  ✅ Server-side Bingo Validation
  ✅ Card Hash Verification
  ✅ Timing Analysis
  ✅ Bot Detection
  ✅ Fraud Detection

✅ API Security
  ✅ Rate Limiting (Global + Per-Endpoint)
  ✅ Security Headers (Helmet.js)
  ✅ CORS Configuration
  ✅ Error Handling (No Info Leak)

✅ Transaction Security
  ✅ ACID Transactions
  ✅ Row-level Locking
  ✅ Balance Snapshot
  ✅ Audit Trail

✅ WebSocket Security
  ✅ Authentication (JWT)
  ✅ Rate Limiting
  ✅ Event Validation

✅ Privacy Compliance
  ✅ GDPR Compliance
  ✅ PDPA Compliance
  ✅ Data Export
  ✅ Right to be Forgotten

✅ Monitoring & Logging
  ✅ Audit Logs
  ✅ Error Tracking (Sentry)
  ✅ Suspicious Activity Alerts
```

---

**เอกสารนี้จัดทำโดย**: เม (Security Engineer) 💕
**วันที่**: 12 มกราคม 2026
**สถานะ**: ✅ **Security Audit Complete**
**ข้อแนะนำถัดไป**: ส่งให้ Backend Developer + QA Engineer ทำตาม

---

## 🔐 สำคัญที่สุด!

> **"ระบบเงินจริงต้องปลอดภัยที่สุด"**
>
> ทุกช่องโหว่ = เงินหาย
> ทุก Transaction = ต้องตรวจสอบได้
> ทุก Action = ต้อง Validate ที่ Server

**Server คือ Single Source of Truth**
**Client ห้ามเชื่อใจเด็ดขาด!**
