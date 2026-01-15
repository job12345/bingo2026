# Copilot Instructions - Bingo Party Enterprise

## Project Overview
Real-time online bingo game with **real money** system (1 Point = 1 THB). NestJS backend + React frontend with WebSocket-based gameplay. **Thai language documentation** - all docs and most comments in Thai.

## Critical Architectural Principles

### 1. Server Authoritative Design
- **Server is single source of truth** - all game logic, validation, and state management happens server-side
- Client only renders UI and sends player actions
- Never trust client calculations for: card purchases, bingo validation, point transactions, or game state
- All actions must pass server validation with proper error responses

### 2. Transaction Safety (ACID)
```typescript
// ALWAYS use Prisma transactions for financial operations
await this.prisma.$transaction(async (tx) => {
  // All wallet operations here
  // Atomic: all succeed or all fail
});
```
- Every point transfer MUST be in a transaction
- Create audit logs for all financial operations
- Use optimistic locking for wallet operations to prevent race conditions

### 3. Anti-Cheat Architecture
Three-layer protection:
- **Server validation**: All game actions validated server-side
- **Rate limiting**: ThrottlerModule prevents spam/automation (100 req/min)
- **Audit trail**: AuditLog model tracks suspicious patterns
- Ghost bots have hard-coded win rate limits (≤30%, no consecutive wins)

## Development Environment

### Port Configuration (macOS)
```
Frontend:     3001 (Vite dev server)
Backend REST: 8001 (NestJS HTTP)
WebSocket:    8002 (Socket.io gateway)
PostgreSQL:   5432 (Docker)
Redis:        6379 (Docker)
```
**IMPORTANT**: User runs multiple web apps - avoid default ports (3000, 8000, 8080) to prevent conflicts.

### Quick Start Commands
```bash
# Backend (from bingo-backend/)
npm run start:dev              # Start with hot reload
npm run prisma:migrate         # Run migrations
npm run prisma:studio          # Open Prisma Studio (GUI)

# Frontend (from bingo-frontend/)
npm run dev                    # Start on port 3001

# Infrastructure
docker-compose up -d           # Start PostgreSQL + Redis
```

## Tech Stack & Module Structure

### Backend (NestJS + Prisma)
```
src/
├── auth/          # Google OAuth + JWT (passport-google-oauth20, passport-jwt)
├── users/         # Profile, stats, leaderboard
├── wallet/        # Point deposits/withdrawals (ACID transactions)
├── rooms/         # Game room management
├── game/          # Game engine (TODO: implement full logic)
├── websocket/     # Socket.io gateway (/game namespace)
├── admin/         # Admin approval flows (transactions, user management)
├── bot/           # Ghost bot AI players
├── prisma/        # PrismaService + helpers
└── common/        # Guards, filters, interceptors, decorators
    ├── guards/    # JwtAuthGuard (APP_GUARD), RolesGuard
    ├── telegram/  # TelegramModule for notifications
    └── utils/     # Helper functions
```

**Key Dependencies**:
- `@nestjs/passport`, `passport-google-oauth20`, `passport-jwt` - Auth
- `@prisma/client` - ORM
- `@nestjs/websockets`, `socket.io` - Real-time
- `@nestjs/bull`, `bull` - Background jobs (Redis queue)
- `ioredis` - Redis cache/pub-sub
- `bcrypt` - Password hashing

### Frontend (React + Vite + Zustand)
```
src/
├── pages/         # Route pages (LandingPage, LobbyPage, GameRoomPage, etc.)
├── components/    # Reusable UI components
│   ├── bingo/     # Bingo-specific components (BingoCard, BallDisplay)
│   ├── room/      # Room UI components
│   ├── wallet/    # Wallet UI
│   └── admin/     # Admin panel components
├── stores/        # Zustand state management (useAuthStore, useGameStore, etc.)
├── services/      # API clients
│   ├── api.service.ts       # Axios REST client
│   └── websocket.service.ts # Socket.io client
├── hooks/         # Custom hooks
│   ├── useAuth.ts
│   └── useWebSocketEvents.ts
└── types/         # TypeScript interfaces
```

**Key Dependencies**:
- `react`, `react-dom` - UI framework
- `react-router-dom` - Routing
- `antd`, `@ant-design/icons` - UI components (Thai locale: `thTH`)
- `zustand` - State management
- `socket.io-client` - WebSocket client
- `axios` - HTTP client
- `react-hot-toast` - Notifications
- `framer-motion` - Animations
- `howler` - Sound effects

## Database Schema (Prisma)

### Core Models
- **User**: Auth (googleId/phoneNumber), pointBalance, bank info, stats (totalWins, totalSpent)
- **Transaction**: deposit/withdraw/card_purchase/payout/refund/fee with status (pending/completed/rejected)
- **Room**: capacity (2-20), cardPrice, feePercent, drawSpeed, ballSet (75/90)
- **Game**: roomId, state (idle/waiting/sitting/buying/running/bingo_race/winner_declared/payout/cooldown), drawnBalls[], winnerId
- **Card**: gameId, userId, numbers (2D array), markedPositions (2D boolean array)
- **BingoRequest**: userId, gameId, cardId, winPattern, requestedAt, validatedAt, isValid - **critical for anti-cheat**
- **AuditLog**: action, userId, details (JSON), ipAddress - **required for financial operations**

### Enums
- `UserRole`: player | admin | bot
- `TransactionStatus`: pending | completed | rejected | cancelled
- `GameState`: idle | waiting | sitting | buying | running | bingo_race | winner_declared | payout | cooldown

### Transaction Pattern Example
```typescript
// Always wrap wallet operations in transactions
async withdraw(userId: string, amount: number) {
  return this.prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { pointBalance: { decrement: amount } }
    });
    
    await tx.transaction.create({
      data: { userId, type: 'withdraw', amount, status: 'pending' }
    });
    
    await tx.auditLog.create({
      data: { action: 'WITHDRAW_REQUEST', userId, details: { amount } }
    });
    
    return user;
  });
}
```

## WebSocket Event Patterns

### Server Events (emit from backend)
```typescript
// websocket.gateway.ts broadcasts to rooms
this.server.to(roomId).emit('game:state_changed', { state: 'running' });
this.server.to(`game:${gameId}`).emit('game:ball_drawn', { ball: 42 });
```

### Client Events (listen in frontend)
```typescript
// hooks/useWebSocketEvents.ts
websocketService.on('game:state_changed', (data) => {
  gameStore.setState(data.state);
});
websocketService.on('game:ball_drawn', (data) => {
  gameStore.addBall(data.ball);
});
```

## Code Style & Conventions

### Thai Language Usage
- All README, design docs, and user-facing text in Thai
- Code comments: Thai for business logic explanations, English for technical details
- Variable names: English only (camelCase)
- Commit messages: Thai acceptable

### Authentication Pattern
```typescript
// Controllers use @UseGuards(JwtAuthGuard) - it's global via APP_GUARD
// Extract user from request:
@Get('profile')
getProfile(@Req() req) {
  return req.user; // Populated by JWT strategy
}

// Role-based access:
@UseGuards(RolesGuard)
@Roles('admin')
@Get('admin/users')
```

### Frontend State Management
```typescript
// Zustand stores in stores/ folder
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));

// Usage in components:
const { user, login } = useAuthStore();
```

### Error Handling
```typescript
// Backend: Use HttpException with proper status codes
throw new UnauthorizedException('Invalid token');
throw new ForbiddenException('Insufficient balance');

// Frontend: Use react-hot-toast for user feedback
toast.error('เกิดข้อผิดพลาด: ยอดเงินไม่เพียงพอ');
toast.success('ฝากเงินสำเร็จ');
```

## Common Pitfalls & Gotchas

1. **Ghost Bot Logic**: Bot win rate MUST be validated server-side. See `bot/bot.service.ts` for constraints (max 30% win rate, no consecutive wins).

2. **Prisma Client Generation**: After schema changes, always run `npm run prisma:generate` before starting dev server.

3. **WebSocket Authentication**: Socket.io gateway requires JWT in handshake. See `websocket.gateway.ts` for auth middleware setup.

4. **CORS Configuration**: Frontend URL in `main.ts` and `websocket.gateway.ts` must match (default: http://localhost:3000, should use 3001 for this project).

5. **Bingo Validation**: Never validate bingo patterns on client. All validation in `game/game.service.ts` with BingoRequest model for audit trail.

6. **Decimal Precision**: Use Prisma `@db.Decimal(12, 2)` for currency. JS numbers lose precision - convert to strings or use decimal libraries for calculations.

## Testing & Debugging

### Backend Testing
```bash
npm test              # Unit tests (Jest)
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage report
```

### Database Inspection
```bash
npm run prisma:studio # GUI at http://localhost:5555
docker exec -it bingo-postgres psql -U postgres -d bingo_party
```

### Debugging Tips
- Use Swagger UI at `http://localhost:8001/api` for API testing
- Check Redis keys: `docker exec -it bingo-redis redis-cli KEYS '*'`
- WebSocket debugging: Browser DevTools → Network → WS filter
- Prisma query logging: Set `DATABASE_URL` with `?LOG_LEVEL=debug`

## Deployment Notes

Located in `deploy/` directory:
- `deploy.sh` - Main deployment script (staging/production)
- `backup.sh` - Database backup script
- `rollback.sh` - Rollback to previous version
- `docker-compose.monitoring.yml` - Grafana + Prometheus stack

**Environment-specific configs**: Use `.env.production`, `.env.staging` (not `.env` in production).

## Frequently Needed Patterns

### Adding New API Endpoint
1. Create DTO in `dto/` folder with class-validator decorators
2. Add method to service with business logic
3. Add controller method with proper decorators (@Get, @Post, @UseGuards, @ApiTags)
4. Update Swagger tags in `main.ts` if new module

### Adding WebSocket Event
1. Add event handler in `websocket.gateway.ts` (@SubscribeMessage decorator)
2. Add client listener in `hooks/useWebSocketEvents.ts`
3. Update Zustand store to handle state change
4. Update UI component to reflect new state

### Database Migration
```bash
# After editing schema.prisma
npm run prisma:migrate        # Creates migration + applies
npm run prisma:generate       # Regenerates Prisma Client
```

## AI Agent Persona Note
Per `claude.md`: Developer AI is "เม" - cute, helpful personality. User is "พี่ออฟ" (called "ที่รัก"). Communication in Thai with caring tone. Multiple sub-agents available via `claude --agent <name>` (pm, architect, backend, frontend, qa).
