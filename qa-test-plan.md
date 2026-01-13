# 🧪 Bingo Party Enterprise – QA Test Plan & Test Strategy

**QA Engineer**: เม
**วันที่จัดทำ**: 12 มกราคม 2026
**เวอร์ชัน**: 1.0
**ระดับความสำคัญ**: 🔴 **CRITICAL** (ระบบเงินจริง)
**สถานะ**: QA Test Plan Complete ✅

---

## 📑 สารบัญ

1. [Executive Summary](#1-executive-summary)
2. [Test Strategy](#2-test-strategy)
3. [Test Coverage](#3-test-coverage)
4. [Unit Testing Strategy](#4-unit-testing-strategy)
5. [Integration Testing Strategy](#5-integration-testing-strategy)
6. [E2E Testing Strategy](#6-e2e-testing-strategy)
7. [Performance Testing Strategy](#7-performance-testing-strategy)
8. [Security Testing Strategy](#8-security-testing-strategy)
9. [User Acceptance Testing (UAT)](#9-user-acceptance-testing-uat)
10. [Test Cases - Authentication & Authorization](#10-test-cases---authentication--authorization)
11. [Test Cases - Wallet & Transactions](#11-test-cases---wallet--transactions)
12. [Test Cases - Game Flow](#12-test-cases---game-flow)
13. [Test Cases - Anti-Cheat](#13-test-cases---anti-cheat)
14. [Test Cases - WebSocket Real-time](#14-test-cases---websocket-real-time)
15. [Test Cases - Admin Panel](#15-test-cases---admin-panel)
16. [Test Cases - Ghost Bot](#16-test-cases---ghost-bot)
17. [Test Cases - Error Handling](#17-test-cases---error-handling)
18. [Bug Report Template](#18-bug-report-template)
19. [Test Coverage Report](#19-test-coverage-report)
20. [Performance Benchmarks](#20-performance-benchmarks)

---

## 1. Executive Summary

### 1.1 ภาพรวม QA Testing

Bingo Party Enterprise เป็นระบบ **Real Money Gaming** ที่มีความเสี่ยงสูงหากมี Bug หรือช่องโหว่ดังนี้:

```
🔴 Critical Risks ที่ต้องทดสอบอย่างเข้มงวด:
├─ Transaction Safety (การเงินต้องถูกต้อง 100%)
├─ Anti-Cheat (ป้องกันการโกง)
├─ Race Conditions (ป้องกัน Double Spending)
├─ Data Integrity (ข้อมูลต้องสอดคล้อง)
└─ Security Vulnerabilities (ช่องโหว่ด้านความปลอดภัย)

🟡 High Priority:
├─ Game Flow (เกมต้องทำงานถูกต้อง)
├─ WebSocket Stability (Real-time ต้องเสถียร)
├─ Performance (รองรับผู้เล่นพร้อมกัน)
└─ User Experience (UX ต้องดี)

🟢 Medium Priority:
├─ UI/UX Polish
├─ Edge Cases
└─ Error Messages
```

### 1.2 Test Scope

| Module | Testing Level | Priority | Status |
|--------|--------------|----------|--------|
| **Authentication** | Unit, E2E, Security | 🔴 Critical | Pending |
| **Authorization** | Unit, E2E, Security | 🔴 Critical | Pending |
| **Wallet System** | Unit, Integration, E2E | 🔴 Critical | Pending |
| **Game Engine** | Unit, Integration, E2E | 🔴 Critical | Pending |
| **Anti-Cheat** | Unit, Integration, Security | 🔴 Critical | Pending |
| **WebSocket** | Integration, E2E, Load | 🟡 High | Pending |
| **Admin Panel** | E2E, UAT | 🟡 High | Pending |
| **Ghost Bot** | Unit, Integration | 🟡 High | Pending |

### 1.3 Test Tools & Frameworks

```json
{
  "unitTesting": "Jest (NestJS Default)",
  "e2eTesting": "Supertest + Jest",
  "loadTesting": "Artillery / k6",
  "securityTesting": "OWASP ZAP / Burp Suite",
  "apiTesting": "Postman / Insomnia",
  "coverage": "Jest Coverage Reports",
  "ci/cd": "GitHub Actions / GitLab CI"
}
```

---

## 2. Test Strategy

### 2.1 Testing Pyramid

```
                    E2E Tests (10%)
                 /                  \
              Integration Tests (30%)
            /                          \
         Unit Tests (60%)
```

**หลักการ:**
- **60% Unit Tests** - ทดสอบ Logic แต่ละ Function/Service
- **30% Integration Tests** - ทดสอบการทำงานร่วมกัน (API + Database + Redis)
- **10% E2E Tests** - ทดสอบ User Flow แบบ End-to-End

### 2.2 Testing Approach

```
1. Shift-Left Testing
   ├─ เขียน Test ตั้งแต่เริ่มพัฒนา
   ├─ Test-Driven Development (TDD) สำหรับ Critical Features
   └─ Review Code + Test Coverage ก่อน Merge

2. Risk-Based Testing
   ├─ ทดสอบ Critical Features ก่อน (Wallet, Anti-Cheat)
   ├─ ใช้เวลามากกับ High-Risk Areas
   └─ ทดสอบ Edge Cases และ Negative Scenarios

3. Continuous Testing
   ├─ Run Unit Tests ทุกครั้งที่ Commit
   ├─ Run Integration Tests ทุกครั้งที่ PR
   └─ Run E2E Tests ก่อน Deploy Production

4. Exploratory Testing
   ├─ Manual Testing สำหรับ UX/UI
   ├─ Security Testing (Penetration Testing)
   └─ Performance Testing (Load Testing)
```

### 2.3 Test Automation Goals

| Goal | Target | Current | Status |
|------|--------|---------|--------|
| **Unit Test Coverage** | ≥ 80% | 0% | ❌ Not Started |
| **Integration Test Coverage** | ≥ 70% | 0% | ❌ Not Started |
| **Critical Path E2E** | 100% | 0% | ❌ Not Started |
| **CI/CD Pipeline** | Automated | No | ❌ Not Started |
| **Performance Baseline** | Defined | No | ❌ Not Started |

---

## 3. Test Coverage

### 3.1 Test Coverage Matrix

| Feature | Unit | Integration | E2E | Security | Performance | UAT |
|---------|------|-------------|-----|----------|-------------|-----|
| **Authentication (Google OAuth)** | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| **JWT Token Management** | ✅ | ✅ | ✅ | ✅ | - | - |
| **Authorization (RBAC)** | ✅ | ✅ | ✅ | ✅ | - | - |
| **Wallet - Deposit** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Wallet - Withdraw** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Wallet - Balance Check** | ✅ | ✅ | ✅ | - | - | ✅ |
| **Game - Create Room** | ✅ | ✅ | ✅ | - | - | ✅ |
| **Game - Join Room** | ✅ | ✅ | ✅ | - | ✅ | ✅ |
| **Game - Buy Cards** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Game - Number Drawing** | ✅ | ✅ | ✅ | - | ✅ | ✅ |
| **Game - Bingo Validation** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Game - Payout** | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| **Anti-Cheat - Card Hash** | ✅ | ✅ | - | ✅ | - | - |
| **Anti-Cheat - Timing Check** | ✅ | ✅ | - | ✅ | - | - |
| **Anti-Cheat - Bot Detection** | ✅ | ✅ | - | ✅ | - | - |
| **WebSocket - Connection** | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| **WebSocket - Events** | ✅ | ✅ | ✅ | - | ✅ | ✅ |
| **Admin - Approve Deposit** | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| **Admin - Approve Withdraw** | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| **Admin - Ban User** | ✅ | ✅ | ✅ | - | - | ✅ |
| **Ghost Bot - Auto Play** | ✅ | ✅ | - | - | - | - |
| **Ghost Bot - Win Rate Limit** | ✅ | ✅ | - | - | - | - |

### 3.2 Critical Test Paths (Must Pass)

```
✅ Critical Path 1: Deposit → Buy Cards → Play → Win → Withdraw
   1. User Login (Google OAuth)
   2. Deposit Request (Upload Slip)
   3. Admin Approve Deposit
   4. Join Room
   5. Buy Cards (Balance Deduction)
   6. Play Game (Number Drawing)
   7. Claim Bingo (Validation)
   8. Receive Payout
   9. Withdraw Request
   10. Admin Approve Withdraw

✅ Critical Path 2: Multi-Player Game Flow
   1. Player A, B, C Join Same Room
   2. All Buy Cards
   3. Game Starts
   4. Numbers Draw (Real-time WebSocket)
   5. Player A Claims Bingo First
   6. Server Validates (Server Timestamp)
   7. Player A Wins (Others Lose)
   8. Payout to Player A

✅ Critical Path 3: Anti-Cheat Validation
   1. Player Buys Card (Server Generates + Hash)
   2. Player Claims Bingo with Invalid Pattern
   3. Server Rejects (Log Suspicious Activity)
   4. Player Claims Bingo with Valid Pattern
   5. Server Accepts (Timing Check)
   6. Player Wins
```

---

## 4. Unit Testing Strategy

### 4.1 หลักการ Unit Testing

```
✅ ทดสอบ Function/Method แยกส่วน
✅ Mock Dependencies (Database, Redis, External APIs)
✅ Test Edge Cases และ Error Handling
✅ ใช้ AAA Pattern (Arrange, Act, Assert)
✅ Coverage ≥ 80% สำหรับ Critical Modules
```

### 4.2 Unit Test Cases (Examples)

#### 4.2.1 Card Generator

```typescript
// Test Case: generate75BallCard()
describe('CardGeneratorUtil', () => {
  describe('generate75BallCard', () => {
    it('should generate a 5x5 card', () => {
      const card = CardGeneratorUtil.generate75BallCard();
      expect(card).toHaveLength(5);
      expect(card[0]).toHaveLength(5);
    });

    it('should have FREE space at (2,2)', () => {
      const card = CardGeneratorUtil.generate75BallCard();
      expect(card[2][2]).toBe(0); // 0 = FREE
    });

    it('should have numbers in correct ranges', () => {
      const card = CardGeneratorUtil.generate75BallCard();
      // Column B (0): 1-15
      expect(card[0][0]).toBeGreaterThanOrEqual(1);
      expect(card[0][0]).toBeLessThanOrEqual(15);
      // Column I (1): 16-30
      expect(card[0][1]).toBeGreaterThanOrEqual(16);
      expect(card[0][1]).toBeLessThanOrEqual(30);
    });

    it('should not have duplicate numbers', () => {
      const card = CardGeneratorUtil.generate75BallCard();
      const flatNumbers = card.flat().filter(n => n !== 0);
      const uniqueNumbers = new Set(flatNumbers);
      expect(uniqueNumbers.size).toBe(flatNumbers.length);
    });
  });

  describe('generateCardHash', () => {
    it('should generate consistent hash', () => {
      const numbers = [[1, 2, 3], [4, 5, 6]];
      const gameId = 'game_123';
      const createdAt = new Date('2026-01-12');

      const hash1 = CardGeneratorUtil.generateCardHash(numbers, gameId, createdAt);
      const hash2 = CardGeneratorUtil.generateCardHash(numbers, gameId, createdAt);

      expect(hash1).toBe(hash2); // Same input = Same hash
    });

    it('should generate different hash for different input', () => {
      const numbers1 = [[1, 2, 3]];
      const numbers2 = [[4, 5, 6]];
      const gameId = 'game_123';
      const createdAt = new Date('2026-01-12');

      const hash1 = CardGeneratorUtil.generateCardHash(numbers1, gameId, createdAt);
      const hash2 = CardGeneratorUtil.generateCardHash(numbers2, gameId, createdAt);

      expect(hash1).not.toBe(hash2);
    });
  });
});
```

#### 4.2.2 Bingo Validator

```typescript
describe('BingoValidatorService', () => {
  let service: BingoValidatorService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [BingoValidatorService, PrismaService],
    }).compile();

    service = module.get(BingoValidatorService);
    prisma = module.get(PrismaService);
  });

  describe('validatePattern', () => {
    it('should validate horizontal_1 pattern correctly', async () => {
      const card = [
        [1, 16, 31, 46, 61],
        [2, 17, 32, 47, 62],
        [3, 18, 0, 48, 63], // FREE = 0
        [4, 19, 33, 49, 64],
        [5, 20, 34, 50, 65],
      ];
      const drawnNumbers = [1, 16, 31, 46, 61]; // Complete horizontal_1
      const pattern = 'horizontal_1';

      const result = await service.validatePattern(card, pattern, drawnNumbers);

      expect(result.isValid).toBe(true);
      expect(result.missingNumbers).toBeUndefined();
    });

    it('should reject incomplete pattern', async () => {
      const card = [
        [1, 16, 31, 46, 61],
        [2, 17, 32, 47, 62],
        [3, 18, 0, 48, 63],
        [4, 19, 33, 49, 64],
        [5, 20, 34, 50, 65],
      ];
      const drawnNumbers = [1, 16, 31, 46]; // Missing 61
      const pattern = 'horizontal_1';

      const result = await service.validatePattern(card, pattern, drawnNumbers);

      expect(result.isValid).toBe(false);
      expect(result.missingNumbers).toEqual([61]);
    });

    it('should validate diagonal_1 pattern', async () => {
      const card = [
        [1, 16, 31, 46, 61],
        [2, 17, 32, 47, 62],
        [3, 18, 0, 48, 63], // FREE = 0
        [4, 19, 33, 49, 64],
        [5, 20, 34, 50, 65],
      ];
      const drawnNumbers = [1, 17, 0, 49, 65]; // Diagonal (0 = FREE)
      const pattern = 'diagonal_1';

      const result = await service.validatePattern(card, pattern, drawnNumbers);

      expect(result.isValid).toBe(true);
    });

    it('should handle FREE space correctly', async () => {
      const card = [
        [1, 16, 31, 46, 61],
        [2, 17, 32, 47, 62],
        [3, 18, 0, 48, 63], // FREE = 0 (Center)
        [4, 19, 33, 49, 64],
        [5, 20, 34, 50, 65],
      ];
      const drawnNumbers = [3, 18, 48, 63]; // vertical_3 (ไม่ต้องมี 0)
      const pattern = 'vertical_3';

      const result = await service.validatePattern(card, pattern, drawnNumbers);

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateBingoRequest', () => {
    it('should reject if card does not belong to user', async () => {
      const card = { id: 'card_1', userId: 'user_A', gameId: 'game_1' };
      jest.spyOn(prisma.card, 'findUnique').mockResolvedValue(card as any);

      const result = await service.validateBingoRequest(
        'user_B', // Different user
        'game_1',
        'card_1',
        'horizontal_1',
      );

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Card does not belong to user');
    });

    it('should reject if card already won', async () => {
      const card = {
        id: 'card_1',
        userId: 'user_A',
        gameId: 'game_1',
        isWinner: true, // Already won
      };
      jest.spyOn(prisma.card, 'findUnique').mockResolvedValue(card as any);

      const result = await service.validateBingoRequest(
        'user_A',
        'game_1',
        'card_1',
        'horizontal_1',
      );

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Card already won');
    });

    it('should log suspicious timing (< 200ms)', async () => {
      const card = {
        id: 'card_1',
        userId: 'user_A',
        gameId: 'game_1',
        isWinner: false,
        numbers: [[1, 16, 31, 46, 61], [2, 17, 32, 47, 62], [3, 18, 0, 48, 63], [4, 19, 33, 49, 64], [5, 20, 34, 50, 65]],
      };
      const game = {
        id: 'game_1',
        state: 'running',
        drawnNumbers: [1, 16, 31, 46, 61],
        lastDrawnAt: new Date(Date.now() - 100), // 100ms ago (Suspicious!)
      };

      jest.spyOn(prisma.card, 'findUnique').mockResolvedValue(card as any);
      jest.spyOn(prisma.game, 'findUnique').mockResolvedValue(game as any);

      const auditSpy = jest.spyOn(service['auditService'], 'log').mockResolvedValue(undefined);

      await service.validateBingoRequest('user_A', 'game_1', 'card_1', 'horizontal_1');

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'suspicious_bingo_timing',
        }),
      );
    });
  });
});
```

#### 4.2.3 Wallet Service (Transaction Safety)

```typescript
describe('WalletService', () => {
  let service: WalletService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [WalletService, PrismaService],
    }).compile();

    service = module.get(WalletService);
    prisma = module.get(PrismaService);
  });

  describe('buyCards', () => {
    it('should deduct balance and create cards', async () => {
      const userId = 'user_1';
      const gameId = 'game_1';
      const quantity = 2;
      const cardPrice = 100;

      const user = { id: userId, pointBalance: 500 };
      const room = { cardPrice: 100 };

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
        return callback(prisma);
      });

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...user,
        pointBalance: 300,
      } as any);

      const result = await service.buyCards(userId, gameId, quantity);

      expect(result.cards).toHaveLength(2);
      expect(result.newBalance).toBe(300);
    });

    it('should throw error if insufficient balance', async () => {
      const userId = 'user_1';
      const gameId = 'game_1';
      const quantity = 10;

      const user = { id: userId, pointBalance: 50 }; // Not enough

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
        return callback(prisma);
      });

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);

      await expect(service.buyCards(userId, gameId, quantity)).rejects.toThrow(
        'ยอดเงินไม่เพียงพอ',
      );
    });

    it('should rollback if error occurs', async () => {
      const userId = 'user_1';
      const gameId = 'game_1';
      const quantity = 2;

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
        throw new Error('Database error');
      });

      await expect(service.buyCards(userId, gameId, quantity)).rejects.toThrow(
        'Database error',
      );

      // Balance should not change (Transaction Rollback)
    });
  });

  describe('processWithdraw', () => {
    it('should create withdraw request', async () => {
      const userId = 'user_1';
      const amount = 500;

      const user = { id: userId, pointBalance: 1000 };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);
      jest.spyOn(prisma.transaction, 'create').mockResolvedValue({
        id: 'txn_1',
        type: 'withdraw',
        amount: 500,
        status: 'pending',
      } as any);

      const result = await service.processWithdraw(userId, amount);

      expect(result.status).toBe('pending');
      expect(result.amount).toBe(500);
    });

    it('should throw error if withdraw exceeds balance', async () => {
      const userId = 'user_1';
      const amount = 2000;

      const user = { id: userId, pointBalance: 1000 };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);

      await expect(service.processWithdraw(userId, amount)).rejects.toThrow(
        'ยอดเงินไม่เพียงพอ',
      );
    });
  });
});
```

---

## 5. Integration Testing Strategy

### 5.1 หลักการ Integration Testing

```
✅ ทดสอบ API Endpoints (REST + WebSocket)
✅ ทดสอบการเชื่อมต่อกับ Database (PostgreSQL)
✅ ทดสอบการเชื่อมต่อกับ Redis
✅ ทดสอบ Transaction Integrity
✅ ทดสอบ Real-time Events (WebSocket)
```

### 5.2 Integration Test Cases (Examples)

#### 5.2.1 Authentication Flow

```typescript
describe('AuthController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // 1. Login first to get refresh token
      const loginRes = await request(app.getHttpServer())
        .get('/auth/google/callback')
        .query({ code: 'mock_google_code' });

      const { refreshToken } = loginRes.body;

      // 2. Refresh access token
      const refreshRes = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshRes.body.accessToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid_token' })
        .expect(401);
    });

    it('should reject expired refresh token', async () => {
      const expiredToken = 'expired_jwt_token';

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: expiredToken })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user with valid token', async () => {
      const token = 'valid_jwt_token';

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBeDefined();
      expect(res.body.email).toBeDefined();
    });

    it('should reject without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });
  });
});
```

#### 5.2.2 Wallet Transactions

```typescript
describe('WalletController (Integration)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth token
    const loginRes = await request(app.getHttpServer())
      .get('/auth/google/callback')
      .query({ code: 'mock_code' });

    authToken = loginRes.body.accessToken;
    userId = loginRes.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /wallet/deposit', () => {
    it('should create deposit request', async () => {
      const res = await request(app.getHttpServer())
        .post('/wallet/deposit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 500,
          paymentSlipUrl: 'https://example.com/slip.jpg',
          notes: 'Test deposit',
        })
        .expect(201);

      expect(res.body.transaction.status).toBe('pending');
      expect(res.body.transaction.amount).toBe(500);
    });

    it('should reject deposit < 100 baht', async () => {
      await request(app.getHttpServer())
        .post('/wallet/deposit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 50, // < 100
          paymentSlipUrl: 'https://example.com/slip.jpg',
        })
        .expect(400);
    });

    it('should reject deposit > 100,000 baht', async () => {
      await request(app.getHttpServer())
        .post('/wallet/deposit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 150000, // > 100,000
          paymentSlipUrl: 'https://example.com/slip.jpg',
        })
        .expect(400);
    });
  });

  describe('POST /wallet/withdraw', () => {
    it('should create withdraw request', async () => {
      const res = await request(app.getHttpServer())
        .post('/wallet/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 300,
          notes: 'Test withdraw',
        })
        .expect(201);

      expect(res.body.transaction.status).toBe('pending');
      expect(res.body.transaction.amount).toBe(300);
    });

    it('should reject withdraw if balance insufficient', async () => {
      await request(app.getHttpServer())
        .post('/wallet/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 999999, // More than balance
        })
        .expect(400);
    });
  });

  describe('GET /wallet/balance', () => {
    it('should return current balance', async () => {
      const res = await request(app.getHttpServer())
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.balance).toBeDefined();
      expect(typeof res.body.balance).toBe('number');
    });
  });
});
```

#### 5.2.3 Game Flow

```typescript
describe('GameController (Integration)', () => {
  let app: INestApplication;
  let authToken: string;
  let roomId: string;
  let gameId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup: Login + Create Room
    const loginRes = await request(app.getHttpServer())
      .get('/auth/google/callback')
      .query({ code: 'mock_code' });

    authToken = loginRes.body.accessToken;

    const roomRes = await request(app.getHttpServer())
      .post('/rooms')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Room',
        drawMode: 'auto',
        ballSet: '75',
        maxPlayers: 10,
        maxRounds: 50,
        cardPrice: 100,
        maxCardsPerPlayer: 3,
        feePercentage: 10,
      });

    roomId = roomRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /game/:roomId/join', () => {
    it('should allow user to join room', async () => {
      const res = await request(app.getHttpServer())
        .post(`/game/${roomId}/join`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      gameId = res.body.gameId;
      expect(res.body.success).toBe(true);
    });

    it('should reject if room is full', async () => {
      // TODO: Fill room to max capacity first
      await request(app.getHttpServer())
        .post(`/game/${roomId}/join`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('POST /game/:gameId/buy-cards', () => {
    it('should buy cards and deduct balance', async () => {
      const balanceBefore = await request(app.getHttpServer())
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`);

      const res = await request(app.getHttpServer())
        .post(`/game/${gameId}/buy-cards`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 2 })
        .expect(200);

      expect(res.body.cards).toHaveLength(2);

      const balanceAfter = await request(app.getHttpServer())
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(balanceAfter.body.balance).toBe(balanceBefore.body.balance - 200);
    });

    it('should reject if insufficient balance', async () => {
      await request(app.getHttpServer())
        .post(`/game/${gameId}/buy-cards`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 9999 })
        .expect(400);
    });

    it('should reject if exceeds maxCardsPerPlayer', async () => {
      await request(app.getHttpServer())
        .post(`/game/${gameId}/buy-cards`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 5 }) // Max = 3
        .expect(400);
    });
  });

  describe('POST /game/:gameId/bingo', () => {
    it('should accept valid bingo', async () => {
      // TODO: Setup game state with completed pattern

      const res = await request(app.getHttpServer())
        .post(`/game/${gameId}/bingo`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardId: 'card_1',
          pattern: 'horizontal_1',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.isWinner).toBeDefined();
    });

    it('should reject invalid pattern', async () => {
      await request(app.getHttpServer())
        .post(`/game/${gameId}/bingo`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardId: 'card_1',
          pattern: 'horizontal_1', // Incomplete
        })
        .expect(400);
    });

    it('should reject card that does not belong to user', async () => {
      await request(app.getHttpServer())
        .post(`/game/${gameId}/bingo`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardId: 'card_of_another_user',
          pattern: 'horizontal_1',
        })
        .expect(403);
    });
  });
});
```

---

## 6. E2E Testing Strategy

### 6.1 หลักการ E2E Testing

```
✅ ทดสอบ User Flow แบบครบวงจร
✅ รวมทุก Component (Frontend + Backend + Database + WebSocket)
✅ ทดสอบ Real-time Scenarios
✅ ทดสอบ Multi-User Scenarios
```

### 6.2 E2E Test Scenarios

#### Scenario 1: Complete Game Flow (Single Player)

```
1. User Login (Google OAuth)
2. Navigate to Lobby
3. Create Room
4. Join Room
5. Buy 2 Cards
6. Wait for Game to Start
7. Observe Number Drawing
8. Pattern Complete → Click Bingo
9. Win Game
10. Receive Payout
11. Check Balance Updated
```

#### Scenario 2: Multi-Player Race Condition

```
1. User A, B, C Login
2. All Join Same Room
3. All Buy Cards
4. Game Starts
5. Numbers Draw: 1, 5, 12, 23, 45, ...
6. User A Pattern Complete (12th ball)
7. User A Clicks Bingo (200ms later)
8. User B Pattern Complete (12th ball)
9. User B Clicks Bingo (250ms later)
10. Server Validates: A arrived first (Server Timestamp)
11. User A Wins
12. User B, C Lose
13. Payout to User A
```

#### Scenario 3: Deposit → Play → Withdraw

```
1. User Login
2. Deposit 1,000 Baht (Upload Slip)
3. Wait for Admin Approval
4. Balance Updated to 1,000
5. Join Room (Card Price = 100)
6. Buy 3 Cards (Balance = 700)
7. Play Game
8. Lose (Balance = 700)
9. Withdraw 500 Baht
10. Admin Approve Withdraw
11. Balance Updated to 200
```

---

## 7. Performance Testing Strategy

### 7.1 Performance Goals

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Response Time (p95)** | < 200ms | Artillery/k6 |
| **WebSocket Latency** | < 100ms | Custom Metrics |
| **Concurrent Users** | ≥ 100 | Load Testing |
| **Database Query Time (p95)** | < 50ms | Prisma Metrics |
| **Number Draw Interval** | 3s (Stable) | Real-time Test |

### 7.2 Load Testing Scenarios

#### Scenario 1: API Load Test

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:8001'
  phases:
    - duration: 60
      arrivalRate: 10 # 10 users/second
    - duration: 120
      arrivalRate: 50 # 50 users/second
    - duration: 60
      arrivalRate: 100 # 100 users/second

scenarios:
  - name: "Buy Cards Flow"
    flow:
      - get:
          url: "/auth/me"
          headers:
            Authorization: "Bearer {{ token }}"
      - post:
          url: "/game/{{ gameId }}/buy-cards"
          json:
            quantity: 2
      - get:
          url: "/wallet/balance"
```

#### Scenario 2: WebSocket Stress Test

```typescript
// ws-stress-test.ts
import { io } from 'socket.io-client';

const NUM_CLIENTS = 100;
const clients = [];

for (let i = 0; i < NUM_CLIENTS; i++) {
  const socket = io('ws://localhost:8002', {
    auth: { token: `test_token_${i}` },
  });

  socket.on('number_drawn', (data) => {
    console.log(`Client ${i} received:`, data.number);
  });

  clients.push(socket);
}

// Measure latency
const startTime = Date.now();
socket.emit('claim_bingo', { cardId: 'card_1', pattern: 'horizontal_1' });
socket.on('bingo_result', () => {
  const latency = Date.now() - startTime;
  console.log(`Latency: ${latency}ms`);
});
```

---

## 8. Security Testing Strategy

### 8.1 Security Test Cases

#### 8.1.1 Authentication & Authorization

| Test Case | Expected Result | Priority |
|-----------|-----------------|----------|
| **Login without credentials** | 401 Unauthorized | 🔴 Critical |
| **Login with invalid Google token** | 401 Unauthorized | 🔴 Critical |
| **Access protected endpoint without token** | 401 Unauthorized | 🔴 Critical |
| **Access admin endpoint as normal user** | 403 Forbidden | 🔴 Critical |
| **Use expired JWT token** | 401 Unauthorized | 🔴 Critical |
| **Use refresh token after logout** | 401 Unauthorized | 🟡 High |

#### 8.1.2 Input Validation

| Test Case | Input | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| **SQL Injection** | `email: "' OR '1'='1"` | 400 Bad Request | 🔴 Critical |
| **XSS in Chat** | `content: "<script>alert('XSS')</script>"` | Sanitized | 🔴 Critical |
| **XSS in Display Name** | `displayName: "<img src=x onerror=alert('XSS')>"` | Sanitized | 🔴 Critical |
| **Command Injection** | `notes: "; rm -rf /"` | Sanitized | 🔴 Critical |
| **Large Payload** | `amount: 999999999999` | 400 Bad Request | 🟡 High |

#### 8.1.3 Anti-Cheat

| Test Case | Expected Result | Priority |
|-----------|-----------------|----------|
| **Claim Bingo with incomplete pattern** | 400 Rejected + Log | 🔴 Critical |
| **Claim Bingo with card of another user** | 403 Forbidden | 🔴 Critical |
| **Claim Bingo twice with same card** | 400 Already Won | 🔴 Critical |
| **Send Bingo < 200ms after number draw** | Accept but Log Suspicious | 🔴 Critical |
| **Manipulate card numbers (Client-side)** | Rejected (Hash Mismatch) | 🔴 Critical |
| **Buy cards without balance** | 400 Insufficient Balance | 🔴 Critical |

#### 8.1.4 Rate Limiting

| Test Case | Expected Result | Priority |
|-----------|-----------------|----------|
| **Send 100 requests in 1 second** | 429 Too Many Requests | 🟡 High |
| **Claim Bingo 20 times in 1 minute** | 429 Rate Limit | 🟡 High |
| **Flood Chat Messages** | 429 Rate Limit | 🟡 High |

---

## 9. User Acceptance Testing (UAT)

### 9.1 UAT Test Cases

#### 9.1.1 Authentication Flow

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **Login with Google** | 1. Click "Login with Google"<br>2. Select Google Account<br>3. Approve Permissions | Redirect to Lobby |
| **Logout** | 1. Click "Logout" | Redirect to Login Page |
| **Session Expiry** | 1. Wait for token to expire<br>2. Try to access protected page | Redirect to Login |

#### 9.1.2 Wallet Management

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **Deposit Request** | 1. Click "Deposit"<br>2. Enter Amount (500)<br>3. Upload Slip<br>4. Submit | Status: Pending |
| **Admin Approve Deposit** | 1. Admin sees pending deposit<br>2. Approve | User balance updated |
| **Withdraw Request** | 1. Click "Withdraw"<br>2. Enter Amount (300)<br>3. Submit | Status: Pending |
| **Admin Approve Withdraw** | 1. Admin sees pending withdraw<br>2. Transfer money<br>3. Approve | User balance deducted |

#### 9.1.3 Game Flow

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **Create Room** | 1. Click "Create Room"<br>2. Fill Settings<br>3. Submit | Room Created |
| **Join Room** | 1. Click Room Card<br>2. Click "Join" | Enter Sitting Phase |
| **Buy Cards** | 1. In Buying Phase<br>2. Select Quantity (2)<br>3. Click "Buy" | Balance Deducted, Cards Shown |
| **Play Game** | 1. Observe Numbers Drawing<br>2. See Cards Auto-Mark | Real-time Updates |
| **Win Game** | 1. Pattern Complete<br>2. Click "Bingo"<br>3. Server Validates | Win Announcement + Payout |
| **Lose Game** | 1. Another Player Wins<br>2. Observe Result | Lose Message |

---

## 10. Test Cases - Authentication & Authorization

### 10.1 Google OAuth Login

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **AUTH-001** | Login with valid Google account | 1. Click "Login with Google"<br>2. Select account<br>3. Approve | Redirect to Lobby + JWT Token | 🔴 Critical |
| **AUTH-002** | Login with invalid Google token | 1. Mock invalid Google response | 401 Unauthorized | 🔴 Critical |
| **AUTH-003** | Login with unverified email | 1. Use Google account with unverified email | 401 Email Not Verified | 🟡 High |
| **AUTH-004** | Login with banned account | 1. Login with banned user | 403 Forbidden + Ban Reason | 🔴 Critical |

### 10.2 JWT Token Management

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **AUTH-010** | Access protected endpoint with valid token | 1. GET /users/me with valid token | 200 OK + User Data | 🔴 Critical |
| **AUTH-011** | Access protected endpoint without token | 1. GET /users/me without token | 401 Unauthorized | 🔴 Critical |
| **AUTH-012** | Access with expired token | 1. Use expired JWT | 401 Token Expired | 🔴 Critical |
| **AUTH-013** | Refresh access token | 1. POST /auth/refresh with refreshToken | 200 OK + New Access Token | 🔴 Critical |
| **AUTH-014** | Refresh with invalid refresh token | 1. POST /auth/refresh with invalid token | 401 Invalid Token | 🔴 Critical |
| **AUTH-015** | Use refresh token after logout | 1. Logout<br>2. Try to refresh | 401 Token Revoked | 🟡 High |

### 10.3 Authorization (RBAC)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **AUTH-020** | Normal user access admin endpoint | 1. GET /admin/dashboard as player | 403 Forbidden | 🔴 Critical |
| **AUTH-021** | Admin access admin endpoint | 1. GET /admin/dashboard as admin | 200 OK + Dashboard Data | 🔴 Critical |
| **AUTH-022** | User access own data | 1. GET /users/me | 200 OK + Own Data | 🔴 Critical |
| **AUTH-023** | User access other user's data | 1. GET /users/:otherId | 403 Forbidden | 🔴 Critical |

---

## 11. Test Cases - Wallet & Transactions

### 11.1 Deposit Flow

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **WAL-001** | Deposit 500 baht | 1. POST /wallet/deposit<br>2. amount: 500<br>3. Upload slip | Status: Pending | 🔴 Critical |
| **WAL-002** | Admin approve deposit | 1. POST /admin/transactions/:id/approve | User balance +500 | 🔴 Critical |
| **WAL-003** | Admin reject deposit | 1. POST /admin/transactions/:id/reject | Status: Rejected | 🟡 High |
| **WAL-004** | Deposit < 100 baht | 1. POST /wallet/deposit<br>2. amount: 50 | 400 Bad Request | 🔴 Critical |
| **WAL-005** | Deposit > 100,000 baht | 1. POST /wallet/deposit<br>2. amount: 150000 | 400 Bad Request | 🔴 Critical |
| **WAL-006** | Deposit without slip | 1. POST /wallet/deposit<br>2. No paymentSlipUrl | 400 Bad Request | 🟡 High |

### 11.2 Withdraw Flow

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **WAL-010** | Withdraw 300 baht | 1. POST /wallet/withdraw<br>2. amount: 300 | Status: Pending | 🔴 Critical |
| **WAL-011** | Admin approve withdraw | 1. Transfer money<br>2. POST /admin/transactions/:id/approve | User balance -300 | 🔴 Critical |
| **WAL-012** | Admin reject withdraw | 1. POST /admin/transactions/:id/reject | Status: Rejected | 🟡 High |
| **WAL-013** | Withdraw > balance | 1. POST /wallet/withdraw<br>2. amount: 9999 | 400 Insufficient Balance | 🔴 Critical |
| **WAL-014** | Withdraw without bank info | 1. POST /wallet/withdraw (no bank info) | 400 Bank Info Required | 🟡 High |

### 11.3 Transaction Safety (Race Conditions)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **WAL-020** | Double spending (Buy cards twice) | 1. Click Buy Cards (Qty: 5)<br>2. Click Buy Cards (Qty: 5) simultaneously | Only 1 succeeds or both if balance sufficient | 🔴 Critical |
| **WAL-021** | Buy cards during withdraw | 1. POST /wallet/withdraw (1000)<br>2. POST /game/:id/buy-cards simultaneously | Proper locking / One fails | 🔴 Critical |
| **WAL-022** | Transaction rollback on error | 1. Mock database error during buy cards | Balance unchanged | 🔴 Critical |

---

## 12. Test Cases - Game Flow

### 12.1 Room Management

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **GAME-001** | Create room with valid settings | 1. POST /rooms<br>2. Valid settings | Room created | 🔴 Critical |
| **GAME-002** | Create room with invalid settings | 1. POST /rooms<br>2. maxPlayers: 0 | 400 Bad Request | 🟡 High |
| **GAME-003** | Join room | 1. POST /game/:roomId/join | Success | 🔴 Critical |
| **GAME-004** | Join full room | 1. Fill room to capacity<br>2. Try to join | 400 Room Full | 🟡 High |
| **GAME-005** | Leave room | 1. POST /game/:roomId/leave | Success | 🟡 High |

### 12.2 Card Purchase

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **GAME-010** | Buy 2 cards | 1. POST /game/:id/buy-cards<br>2. quantity: 2 | Balance -200, 2 cards created | 🔴 Critical |
| **GAME-011** | Buy cards without balance | 1. POST /game/:id/buy-cards<br>2. Insufficient balance | 400 Insufficient Balance | 🔴 Critical |
| **GAME-012** | Buy cards > maxCardsPerPlayer | 1. POST /game/:id/buy-cards<br>2. quantity: 10 (max = 3) | 400 Exceeds Limit | 🟡 High |
| **GAME-013** | Buy cards after buying phase | 1. Wait for game to start<br>2. Try to buy cards | 400 Buying Phase Ended | 🟡 High |
| **GAME-014** | Card hash verification | 1. Buy card<br>2. Tamper card numbers<br>3. Claim bingo | 403 Card Integrity Failed | 🔴 Critical |

### 12.3 Number Drawing

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **GAME-020** | Auto draw mode | 1. Start game (auto mode)<br>2. Observe drawing | Number drawn every 3s | 🔴 Critical |
| **GAME-021** | Manual draw mode | 1. Start game (manual mode)<br>2. Player's turn to draw | Player draws or timeout (5s) | 🟡 High |
| **GAME-022** | Manual draw timeout | 1. Manual mode<br>2. Player doesn't draw | Server draws after 5s | 🟡 High |
| **GAME-023** | All numbers drawn | 1. Play until all 75 numbers drawn | Game ends (no winner) | 🟢 Low |

### 12.4 Bingo Validation

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **GAME-030** | Valid bingo (horizontal) | 1. Pattern complete<br>2. POST /game/:id/bingo | Success, Winner | 🔴 Critical |
| **GAME-031** | Invalid bingo (incomplete) | 1. POST /game/:id/bingo<br>2. Pattern not complete | 400 Invalid Pattern | 🔴 Critical |
| **GAME-032** | Bingo with wrong card | 1. POST /game/:id/bingo<br>2. cardId: other_user_card | 403 Forbidden | 🔴 Critical |
| **GAME-033** | Bingo twice | 1. Claim bingo (success)<br>2. Claim again | 400 Already Won | 🔴 Critical |
| **GAME-034** | Race condition (2 players bingo) | 1. Player A claims (100ms)<br>2. Player B claims (200ms) | Player A wins | 🔴 Critical |
| **GAME-035** | Bingo with tampered card | 1. Tamper card hash<br>2. Claim bingo | 403 Card Integrity Failed | 🔴 Critical |

### 12.5 Payout

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **GAME-040** | Payout to winner | 1. Player wins<br>2. Observe payout | Balance += (Pot - Fee) | 🔴 Critical |
| **GAME-041** | Fee calculation | 1. Pot = 1000, Fee = 10%<br>2. Payout | Winner gets 900 | 🔴 Critical |
| **GAME-042** | Payout transaction record | 1. Win game<br>2. Check /wallet/transactions | Transaction created | 🟡 High |

---

## 13. Test Cases - Anti-Cheat

### 13.1 Server-side Validation

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **AC-001** | Card ownership check | 1. Claim bingo with card of another user | 403 Forbidden | 🔴 Critical |
| **AC-002** | Card belongs to game check | 1. Claim bingo with card from different game | 400 Invalid Card | 🔴 Critical |
| **AC-003** | Card already won check | 1. Win with card<br>2. Try to win again | 400 Already Won | 🔴 Critical |
| **AC-004** | Pattern validation | 1. Claim bingo with incomplete pattern | 400 Pattern Incomplete | 🔴 Critical |
| **AC-005** | Timing check (< 200ms) | 1. Claim bingo < 200ms after draw | Accept but log suspicious | 🔴 Critical |

### 13.2 Bot Detection

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **AC-010** | Abnormally fast reaction | 1. Simulate 10 bingos with latency < 300ms | Flag as suspicious | 🟡 High |
| **AC-011** | Too consistent timing | 1. Simulate bingos with low variance | Flag as suspicious | 🟡 High |
| **AC-012** | High win rate (> 60%) | 1. User wins 60% of games | Flag for review | 🟡 High |

### 13.3 Fraud Detection

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **AC-020** | Multiple accounts same bank | 1. 2 users with same bank account | Flag for review | 🟡 High |
| **AC-021** | Rapid deposit/withdraw | 1. 10 transactions in 24h | Flag as suspicious | 🟡 High |
| **AC-022** | Money laundering pattern | 1. Deposit 1000<br>2. Withdraw 990 (no play) | Flag as suspicious | 🟡 High |

---

## 14. Test Cases - WebSocket Real-time

### 14.1 Connection & Authentication

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **WS-001** | Connect with valid token | 1. Connect to ws://localhost:8002<br>2. Send auth token | Connected | 🔴 Critical |
| **WS-002** | Connect without token | 1. Connect without auth | Disconnected | 🔴 Critical |
| **WS-003** | Connect with invalid token | 1. Connect with invalid token | Disconnected | 🔴 Critical |
| **WS-004** | Disconnect and reconnect | 1. Disconnect<br>2. Reconnect | Re-authenticated | 🟡 High |

### 14.2 Room Events

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **WS-010** | Join room | 1. Emit 'join_room' | Broadcast 'player_joined' | 🔴 Critical |
| **WS-011** | Leave room | 1. Emit 'leave_room' | Broadcast 'player_left' | 🟡 High |
| **WS-012** | Room state change | 1. Observe state transitions | Broadcast 'room_state_changed' | 🔴 Critical |

### 14.3 Game Events

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **WS-020** | Number drawn | 1. Observe number drawing | Broadcast 'number_drawn' | 🔴 Critical |
| **WS-021** | Bingo claimed | 1. Player claims bingo | Broadcast 'bingo_claimed' | 🔴 Critical |
| **WS-022** | Game ended | 1. Game ends | Broadcast 'game_ended' | 🔴 Critical |
| **WS-023** | Payout completed | 1. Payout processed | Broadcast 'payout_completed' | 🔴 Critical |

### 14.4 Chat Events

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **WS-030** | Send message | 1. Emit 'send_message' | Broadcast 'new_message' | 🟡 High |
| **WS-031** | Send message (XSS) | 1. Send `<script>alert('XSS')</script>` | Sanitized message | 🔴 Critical |
| **WS-032** | Flood messages | 1. Send 50 messages in 1s | Rate limit | 🟡 High |

---

## 15. Test Cases - Admin Panel

### 15.1 Transaction Approval

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **ADM-001** | View pending deposits | 1. GET /admin/transactions/pending<br>2. type: deposit | List of pending deposits | 🔴 Critical |
| **ADM-002** | Approve deposit | 1. POST /admin/transactions/:id/approve | User balance updated | 🔴 Critical |
| **ADM-003** | Reject deposit | 1. POST /admin/transactions/:id/reject<br>2. reason: "Invalid slip" | Status: Rejected | 🔴 Critical |
| **ADM-004** | Approve withdraw | 1. Transfer money<br>2. POST /admin/transactions/:id/approve | User balance deducted | 🔴 Critical |
| **ADM-005** | Reject withdraw | 1. POST /admin/transactions/:id/reject | Status: Rejected | 🔴 Critical |

### 15.2 User Management

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **ADM-010** | View all users | 1. GET /admin/users | List of users | 🟡 High |
| **ADM-011** | Ban user | 1. POST /admin/users/:id/ban<br>2. reason: "Cheating" | User banned | 🔴 Critical |
| **ADM-012** | Unban user | 1. POST /admin/users/:id/unban | User unbanned | 🟡 High |
| **ADM-013** | Banned user tries to login | 1. Login with banned user | 403 Forbidden | 🔴 Critical |

### 15.3 Reports

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **ADM-020** | Financial report | 1. GET /admin/reports/financial<br>2. date range | Report data | 🟡 High |
| **ADM-021** | Player risk report | 1. GET /admin/reports/player-risk | List of suspicious players | 🟡 High |
| **ADM-022** | Bot performance report | 1. GET /admin/bots/:id/statistics | Bot stats | 🟢 Low |

---

## 16. Test Cases - Ghost Bot

### 16.1 Bot Behavior

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **BOT-001** | Bot joins room | 1. Bot auto-joins room | Bot in player list | 🟡 High |
| **BOT-002** | Bot buys cards | 1. Bot buys cards | Balance deducted | 🟡 High |
| **BOT-003** | Bot claims bingo | 1. Bot pattern complete<br>2. Observe | Bot claims with delay (0.5-2s) | 🟡 High |
| **BOT-004** | Bot loses | 1. Human wins before bot | Bot loses gracefully | 🟡 High |

### 16.2 Bot Constraints

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **BOT-010** | Max cards limit | 1. Bot tries to buy > limit | Respects limit | 🟢 Low |
| **BOT-011** | Win rate limit | 1. Bot wins too many times | Bot stops winning | 🟡 High |
| **BOT-012** | Consecutive wins limit | 1. Bot wins 3 times | Bot doesn't win 4th time | 🟡 High |

---

## 17. Test Cases - Error Handling

### 17.1 API Errors

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **ERR-001** | 400 Bad Request | 1. Send invalid input | 400 + Error message | 🔴 Critical |
| **ERR-002** | 401 Unauthorized | 1. Access without token | 401 + Error message | 🔴 Critical |
| **ERR-003** | 403 Forbidden | 1. Access restricted resource | 403 + Error message | 🔴 Critical |
| **ERR-004** | 404 Not Found | 1. Access non-existent resource | 404 + Error message | 🟡 High |
| **ERR-005** | 500 Internal Server Error | 1. Mock server error | 500 + Generic message (no stack trace in prod) | 🔴 Critical |

### 17.2 Database Errors

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **ERR-010** | Database connection error | 1. Disconnect database<br>2. Make API call | 500 Error + Retry logic | 🔴 Critical |
| **ERR-011** | Query timeout | 1. Mock slow query | 500 Error + Timeout message | 🟡 High |
| **ERR-012** | Transaction rollback | 1. Mock error during transaction | Transaction rolled back | 🔴 Critical |

### 17.3 WebSocket Errors

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|-----------------|----------|
| **ERR-020** | WebSocket disconnect | 1. Disconnect WebSocket<br>2. Reconnect | Auto-reconnect | 🔴 Critical |
| **ERR-021** | Invalid event | 1. Send invalid event | Error event emitted | 🟡 High |
| **ERR-022** | Event validation error | 1. Send event with invalid data | Error event emitted | 🟡 High |

---

## 18. Bug Report Template

### 18.1 Bug Report Format

```markdown
# Bug Report: [TITLE]

**Reporter**: [Your Name]
**Date**: [YYYY-MM-DD]
**Environment**: [Development / Staging / Production]
**Severity**: [Critical / High / Medium / Low]
**Status**: [Open / In Progress / Resolved / Closed]

---

## Summary
[Brief description of the bug]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]
...

## Expected Result
[What should happen]

## Actual Result
[What actually happens]

## Screenshots / Videos
[Attach if applicable]

## Browser / Device
- **Browser**: [Chrome 120 / Firefox 121 / Safari 17]
- **Device**: [MacBook Pro M2 / iPhone 15]
- **OS**: [macOS 14.2 / iOS 17.2]

## Additional Information
- **Console Errors**: [Paste console errors if any]
- **Network Logs**: [Paste network logs if relevant]
- **User ID**: [If applicable]
- **Transaction ID**: [If applicable]

## Possible Cause
[Your hypothesis about the root cause]

## Suggested Fix
[If you have ideas]
```

### 18.2 Example Bug Report

```markdown
# Bug Report: Balance Not Updated After Deposit Approval

**Reporter**: เม (QA Engineer)
**Date**: 2026-01-12
**Environment**: Staging
**Severity**: Critical
**Status**: Open

---

## Summary
User balance is not updated after admin approves deposit request.

## Steps to Reproduce
1. User submits deposit request (500 baht)
2. Admin goes to /admin/transactions/pending
3. Admin clicks "Approve" for the deposit
4. Check user balance at /wallet/balance

## Expected Result
User balance should increase by 500 baht.

## Actual Result
User balance remains unchanged.

## Screenshots
[Attach screenshot of balance before and after]

## Browser / Device
- **Browser**: Chrome 120
- **Device**: MacBook Pro M2
- **OS**: macOS 14.2

## Additional Information
- **Console Errors**: None
- **Network Logs**: POST /admin/transactions/txn_123/approve returned 200 OK
- **User ID**: user_abc123
- **Transaction ID**: txn_123
- **Database Check**: Transaction status changed to "completed" but user.pointBalance not updated

## Possible Cause
Missing database transaction in approve deposit flow. Only transaction status is updated, but user balance is not incremented.

## Suggested Fix
Wrap approve deposit logic in Prisma.$transaction() to update both transaction status and user balance atomically.
```

---

## 19. Test Coverage Report

### 19.1 Coverage Goals

| Module | Target Coverage | Current Coverage | Status |
|--------|----------------|------------------|--------|
| **Authentication** | ≥ 80% | 0% | ❌ Not Started |
| **Authorization** | ≥ 80% | 0% | ❌ Not Started |
| **Wallet Service** | ≥ 90% | 0% | ❌ Not Started |
| **Game Engine** | ≥ 85% | 0% | ❌ Not Started |
| **Anti-Cheat** | ≥ 90% | 0% | ❌ Not Started |
| **WebSocket Gateway** | ≥ 70% | 0% | ❌ Not Started |
| **Admin Service** | ≥ 75% | 0% | ❌ Not Started |
| **Bot Service** | ≥ 70% | 0% | ❌ Not Started |

### 19.2 Coverage Report (Jest)

```bash
# Generate Coverage Report
npm run test:cov

# Output Example:
----------------------------|---------|----------|---------|---------|
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |   85.23 |    78.45 |   82.11 |   86.01 |
 auth                       |   92.50 |    85.71 |   90.00 |   93.00 |
  auth.service.ts           |   95.00 |    88.89 |   92.31 |   96.00 |
  jwt.strategy.ts           |   90.00 |    82.35 |   87.50 |   90.00 |
 wallet                     |   88.00 |    80.00 |   85.00 |   89.00 |
  wallet.service.ts         |   90.00 |    82.50 |   87.00 |   91.00 |
 game                       |   82.00 |    75.00 |   80.00 |   83.00 |
  game.service.ts           |   80.00 |    72.22 |   78.00 |   81.00 |
  bingo-validator.service.ts|   95.00 |    90.00 |   93.00 |   96.00 |
----------------------------|---------|----------|---------|---------|
```

---

## 20. Performance Benchmarks

### 20.1 API Performance

| Endpoint | Method | Target (p95) | Current (p95) | Status |
|----------|--------|--------------|---------------|--------|
| **GET /auth/me** | GET | < 100ms | - | Not Tested |
| **POST /wallet/deposit** | POST | < 200ms | - | Not Tested |
| **POST /game/:id/buy-cards** | POST | < 300ms | - | Not Tested |
| **POST /game/:id/bingo** | POST | < 200ms | - | Not Tested |
| **GET /wallet/transactions** | GET | < 150ms | - | Not Tested |
| **GET /rooms** | GET | < 100ms | - | Not Tested |

### 20.2 WebSocket Performance

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Connection Time** | < 500ms | - | Not Tested |
| **Event Latency (Number Draw)** | < 100ms | - | Not Tested |
| **Event Latency (Bingo Claim)** | < 150ms | - | Not Tested |
| **Concurrent Connections** | ≥ 100 | - | Not Tested |

### 20.3 Database Performance

| Query | Target (p95) | Current (p95) | Status |
|-------|--------------|---------------|--------|
| **Find User by ID** | < 10ms | - | Not Tested |
| **Find Game by ID (with relations)** | < 50ms | - | Not Tested |
| **Transaction List (Paginated)** | < 100ms | - | Not Tested |
| **Complex Join (Game + Room + Players)** | < 150ms | - | Not Tested |

---

## 📊 สรุป

### ✅ QA Test Plan Complete

เอกสาร QA Test Plan นี้ครอบคลุม:

1. ✅ **Test Strategy** - Pyramid, Approach, Automation Goals
2. ✅ **Test Coverage Matrix** - ครอบคลุมทุก Module
3. ✅ **Unit Testing Strategy** - พร้อมตัวอย่าง Test Cases
4. ✅ **Integration Testing Strategy** - API + Database + Redis
5. ✅ **E2E Testing Strategy** - User Flow Scenarios
6. ✅ **Performance Testing Strategy** - Load Testing + Benchmarks
7. ✅ **Security Testing Strategy** - Anti-Cheat + Penetration Testing
8. ✅ **UAT Test Cases** - User Acceptance Testing
9. ✅ **Test Cases ครบถ้วน** - 100+ Test Cases แบ่งตาม Module
10. ✅ **Bug Report Template** - สำหรับรายงาน Bug
11. ✅ **Coverage Report** - เป้าหมาย Coverage
12. ✅ **Performance Benchmarks** - เป้าหมาย Performance

### 🎯 ขั้นตอนถัดไป

1. **Backend Developer** → เขียน Unit Tests ตาม Test Cases
2. **Frontend Developer** → เขียน E2E Tests (Cypress/Playwright)
3. **DevOps** → Setup CI/CD Pipeline (Run Tests อัตโนมัติ)
4. **QA Engineer** → Run Manual Testing + Security Testing

---

**เอกสารนี้จัดทำโดย**: เม (QA Engineer) 💕
**วันที่**: 12 มกราคม 2026
**สถานะ**: ✅ **QA Test Plan Complete**

---

## 🚀 คำสั่งการใช้งาน

```bash
# เข้าโฟลเดอร์ Backend
cd /Users/masterjob/Claude Code Project/bingo-backend

# รัน Unit Tests
npm run test

# รัน Unit Tests (Watch Mode)
npm run test:watch

# รัน E2E Tests
npm run test:e2e

# รัน Test Coverage
npm run test:cov

# รัน Specific Test File
npm run test -- wallet.service.spec.ts

# รัน Load Testing (Artillery)
artillery run artillery-config.yml
```

**หมายเหตุ**: อย่าลืมตั้งค่า Test Database แยกจาก Production นะคะ! 🔧
