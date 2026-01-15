import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { Prisma, GameState, TransactionStatus, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import * as crypto from 'crypto';
import { BingoPatternDto } from './dto/claim-bingo.dto';

@Injectable()
export class GameService {
  private readonly drawLoops = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async joinRoom(userId: string, roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        isActive: true,
        currentState: true,
        currentRound: true,
        maxPlayers: true,
        ballSet: true,
        feePercentage: true,
      },
    });

    if (!room || !room.isActive) {
      throw new NotFoundException('ไม่พบห้องนี้ หรือห้องถูกปิดแล้ว');
    }

    // หาเกมที่ยังไม่จบของห้องนี้ (latest)
    let game = await this.prisma.game.findFirst({
      where: {
        roomId,
        state: { in: [GameState.waiting, GameState.sitting, GameState.buying, GameState.running, GameState.bingo_race] },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, roundNumber: true, state: true },
    });

    // ถ้ายังไม่มีเกม ให้สร้างเกมใหม่ (เริ่มที่ sitting)
    if (!game) {
      const created = await this.prisma.game.create({
        data: {
          roomId,
          roundNumber: room.currentRound,
          state: GameState.sitting,
          drawnNumbers: [],
          totalBallsDrawn: 0,
          potSize: new Prisma.Decimal(0),
          feeAmount: new Prisma.Decimal(0),
          payoutAmount: new Prisma.Decimal(0),
          startedAt: new Date(),
        },
        select: { id: true, roundNumber: true, state: true },
      });

      game = created;

      await this.prisma.room.update({
        where: { id: roomId },
        data: { currentState: GameState.sitting },
      });

      this.websocketGateway.broadcastToRoom(roomId, 'game_started', {
        gameId: created.id,
        roundNumber: created.roundNumber,
        state: created.state,
      });
    }

    await this.prisma.gameParticipant.upsert({
      where: { gameId_userId: { gameId: game.id, userId } },
      create: { gameId: game.id, userId, isSpectator: false },
      update: {},
    });

    return { gameId: game.id, state: game.state, roundNumber: game.roundNumber };
  }

  async getGameState(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        room: { select: { feePercentage: true } },
      },
    });

    if (!game) {
      throw new NotFoundException('ไม่พบเกมนี้');
    }

    return {
      ...game,
      feePercentage: game.room.feePercentage,
    };
  }

  async getMyCards(userId: string, gameId: string) {
    const cards = await this.prisma.card.findMany({
      where: { gameId, userId },
      orderBy: { createdAt: 'asc' },
    });

    return cards.map((c) => ({
      id: c.id,
      gameId: c.gameId,
      userId: c.userId,
      numbers: c.numbers,
      cardHash: c.cardHash,
      purchasePrice: c.purchasePrice,
      isWinner: c.isWinner,
      createdAt: c.createdAt,
    }));
  }

  async buyCards(userId: string, gameId: string, quantity: number) {
    if (quantity < 1 || quantity > 10) {
      throw new BadRequestException('จำนวนการ์ดไม่ถูกต้อง');
    }

    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { room: true },
    });

    if (!game) {
      throw new NotFoundException('ไม่พบเกมนี้');
    }

    if (
      game.state !== GameState.sitting &&
      game.state !== GameState.buying &&
      game.state !== GameState.running
    ) {
      throw new BadRequestException('ไม่สามารถซื้อการ์ดในสถานะเกมปัจจุบันได้');
    }

    const room = game.room;
    const maxCardsPerPlayer = room.maxCardsPerPlayer;

    const participant = await this.prisma.gameParticipant.findFirst({
      where: { gameId, userId },
      select: { id: true, cardsBought: true },
    });

    if (!participant) {
      throw new ForbiddenException('คุณยังไม่ได้เข้าร่วมห้องนี้');
    }

    if (participant.cardsBought + quantity > maxCardsPerPlayer) {
      throw new BadRequestException(`ซื้อการ์ดได้สูงสุด ${maxCardsPerPlayer} ใบต่อคน`);
    }

    const cardPrice = new Decimal(room.cardPrice);
    const totalCost = cardPrice.mul(new Decimal(quantity));

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { pointBalance: true, role: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const balanceBefore = new Decimal(user.pointBalance);
      if (balanceBefore.lt(totalCost)) {
        throw new ForbiddenException('ยอดเงินไม่เพียงพอ');
      }

      const balanceAfter = balanceBefore.sub(totalCost);

      await tx.user.update({
        where: { id: userId },
        data: { pointBalance: balanceAfter },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.card_purchase,
          amount: totalCost,
          status: TransactionStatus.completed,
          balanceBefore,
          balanceAfter,
          metadata: { gameId, roomId: room.id, quantity },
        },
      });

      const createdCards = [] as any[];
      for (let i = 0; i < quantity; i++) {
        const numbers = this.generate75BallCard();
        const cardHash = this.hashCard({ gameId, userId, numbers, nonce: crypto.randomUUID() });

        const card = await tx.card.create({
          data: {
            gameId,
            userId,
            numbers,
            cardHash,
            purchasePrice: cardPrice,
          },
        });
        createdCards.push(card);
      }

      await tx.gameParticipant.update({
        where: { id: participant.id },
        data: {
          cardsBought: { increment: quantity },
          totalSpent: { increment: totalCost },
        },
      });

      const updatedGame = await tx.game.update({
        where: { id: gameId },
        data: {
          potSize: { increment: totalCost },
          state: game.state === GameState.sitting ? GameState.buying : game.state,
        },
        select: {
          id: true,
          roomId: true,
          state: true,
          potSize: true,
          drawnNumbers: true,
          currentBall: true,
          totalBallsDrawn: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          userRole: user.role,
          action: 'CARD_PURCHASE',
          entityType: 'Game',
          entityId: gameId,
          metadata: { roomId: room.id, quantity, totalCost: totalCost.toString() },
        },
      });

      return {
        cards: createdCards,
        newBalance: balanceAfter,
        game: updatedGame,
      };
    });

    this.websocketGateway.broadcastToRoom(game.roomId, 'room_state_changed', {
      state: result.game.state,
    });

    // เริ่ม auto-draw ทันทีเมื่อมีการ์ดใบแรก และเกมยังไม่เริ่ม
    if (result.game.state !== GameState.running) {
      await this.tryStartRunning(gameId);
    }

    return {
      cards: result.cards,
      newBalance: result.newBalance,
    };
  }

  async claimBingo(userId: string, gameId: string, cardId: string, pattern: BingoPatternDto) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { room: true },
    });

    if (!game) {
      throw new NotFoundException('ไม่พบเกมนี้');
    }

    if (game.state !== GameState.running && game.state !== GameState.bingo_race) {
      throw new BadRequestException('ยังไม่สามารถกดบิงโกได้');
    }

    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card || card.gameId !== gameId) {
      throw new NotFoundException('ไม่พบการ์ดนี้');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์ใช้การ์ดนี้');
    }

    const validation = this.validateBingo({
      numbers: card.numbers as any,
      drawnNumbers: game.drawnNumbers,
      pattern,
    });

    const isValid = validation.isValid;

    // บันทึกคำขอ (Anti-cheat)
    const bingoRequest = await this.prisma.bingoRequest.create({
      data: {
        gameId,
        userId,
        cardId,
        claimedPattern: pattern,
        isValid,
        validationResult: validation,
        ballsWhenRequested: game.drawnNumbers.length,
        serverTimestamp: new Date(),
      },
    });

    this.websocketGateway.broadcastToRoom(game.roomId, 'bingo_claimed', {
      userId,
      displayName: 'player',
      cardId,
      pattern,
      isValid,
      rank: isValid ? 1 : 0,
    });

    if (!isValid) {
      return { isValid: false };
    }

    // ถ้ามีผู้ชนะแล้ว ให้ตอบกลับว่า valid แต่ไม่ได้ rank 1
    if (game.winnerId) {
      return { isValid: true, rank: 2 };
    }

    // ตัดสินผู้ชนะคนแรก และจ่ายเงิน (ACID)
    const payout = await this.prisma.$transaction(async (tx) => {
      const winner = await tx.user.findUnique({
        where: { id: userId },
        select: { pointBalance: true, role: true, displayName: true },
      });

      if (!winner) {
        throw new NotFoundException('User not found');
      }

      const potSize = new Decimal(game.potSize);
      const feeAmount = potSize.mul(new Decimal(game.room.feePercentage)).div(new Decimal(100));
      const payoutAmount = potSize.sub(feeAmount);

      await tx.card.update({
        where: { id: cardId },
        data: { isWinner: true },
      });

      await tx.bingoRequest.update({
        where: { id: bingoRequest.id },
        data: { isWinner: true, winnerRank: 1 },
      });

      await tx.game.update({
        where: { id: gameId },
        data: {
          state: GameState.winner_declared,
          winnerId: userId,
          winnerCardId: cardId,
          winningPattern: pattern,
          ballsToWin: game.drawnNumbers.length,
          feeAmount,
          payoutAmount,
          endedAt: new Date(),
        },
      });

      const balanceBefore = new Decimal(winner.pointBalance);
      const balanceAfter = balanceBefore.add(payoutAmount);

      await tx.user.update({
        where: { id: userId },
        data: { pointBalance: balanceAfter },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.payout,
          amount: payoutAmount,
          status: TransactionStatus.completed,
          balanceBefore,
          balanceAfter,
          metadata: { gameId, roomId: game.roomId, pattern },
        },
      });

      await tx.room.update({
        where: { id: game.roomId },
        data: {
          totalRoundsPlayed: { increment: 1 },
          totalPotCollected: { increment: potSize },
          totalFeeCollected: { increment: feeAmount },
          topWinnerId: userId,
          topWinnerAmount: payoutAmount,
          currentState: GameState.cooldown,
          currentRound: { increment: 1 },
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          userRole: winner.role,
          action: 'GAME_WINNER',
          entityType: 'Game',
          entityId: gameId,
          metadata: {
            roomId: game.roomId,
            potSize: potSize.toString(),
            feeAmount: feeAmount.toString(),
            payoutAmount: payoutAmount.toString(),
            ballsToWin: game.drawnNumbers.length,
            pattern,
          },
        },
      });

      return {
        winnerId: userId,
        winnerName: winner.displayName,
        payoutAmount,
        feeAmount,
        newBalance: balanceAfter,
        ballsToWin: game.drawnNumbers.length,
      };
    });

    this.stopDrawLoop(gameId);

    this.websocketGateway.broadcastToRoom(game.roomId, 'game_ended', {
      winnerId: payout.winnerId,
      winnerName: payout.winnerName,
      pattern,
      payoutAmount: Number(payout.payoutAmount),
      ballsToWin: payout.ballsToWin,
    });

    this.websocketGateway.broadcastToRoom(game.roomId, 'payout_completed', {
      winnerId: payout.winnerId,
      amount: Number(payout.payoutAmount),
      newBalance: Number(payout.newBalance),
    });

    return { isValid: true, rank: 1 };
  }

  private async tryStartRunning(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { room: true },
    });

    if (!game) return;
    if (game.state === GameState.running) {
      this.startDrawLoop(game);
      return;
    }

    // ต้องมีอย่างน้อย 1 ใบที่ถูกซื้อ
    const hasCards = await this.prisma.card.findFirst({
      where: { gameId },
      select: { id: true },
    });

    if (!hasCards) return;

    const updated = await this.prisma.game.update({
      where: { id: gameId },
      data: { state: GameState.running },
      include: { room: true },
    });

    await this.prisma.room.update({
      where: { id: updated.roomId },
      data: { currentState: GameState.running },
    });

    this.websocketGateway.broadcastToRoom(updated.roomId, 'room_state_changed', {
      state: updated.state,
    });

    this.startDrawLoop(updated);
  }

  private startDrawLoop(game: any) {
    if (this.drawLoops.has(game.id)) return;

    const intervalMs = parseInt(process.env.DRAW_INTERVAL_MS || '2500', 10);
    const maxBall = game.room.ballSet === 'BALL_90' ? 90 : 75;

    const timer = setInterval(async () => {
      try {
        const latest = await this.prisma.game.findUnique({
          where: { id: game.id },
          include: { room: true },
        });

        if (!latest || latest.state !== GameState.running) {
          this.stopDrawLoop(game.id);
          return;
        }

        const already = new Set(latest.drawnNumbers);
        if (already.size >= maxBall) {
          // จบเกมแบบไม่มีผู้ชนะ
          await this.prisma.game.update({
            where: { id: game.id },
            data: { state: GameState.cooldown, endedAt: new Date() },
          });
          await this.prisma.room.update({
            where: { id: latest.roomId },
            data: { currentState: GameState.cooldown },
          });
          this.stopDrawLoop(game.id);
          return;
        }

        const next = this.pickNextBall(already, maxBall);
        const updated = await this.prisma.game.update({
          where: { id: game.id },
          data: {
            drawnNumbers: { push: next },
            currentBall: next,
            totalBallsDrawn: { increment: 1 },
          },
          select: {
            roomId: true,
            drawnNumbers: true,
            totalBallsDrawn: true,
          },
        });

        this.websocketGateway.broadcastToRoom(updated.roomId, 'number_drawn', {
          number: next,
          totalDrawn: updated.totalBallsDrawn,
          drawnNumbers: updated.drawnNumbers,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        // กันลูปตาย
        this.stopDrawLoop(game.id);
      }
    }, intervalMs);

    this.drawLoops.set(game.id, timer);
  }

  private stopDrawLoop(gameId: string) {
    const timer = this.drawLoops.get(gameId);
    if (timer) {
      clearInterval(timer);
      this.drawLoops.delete(gameId);
    }
  }

  private pickNextBall(already: Set<number>, maxBall: number) {
    // สุ่มแบบง่าย (MVP)
    for (let i = 0; i < 1000; i++) {
      const n = Math.floor(Math.random() * maxBall) + 1;
      if (!already.has(n)) return n;
    }

    // fallback
    for (let n = 1; n <= maxBall; n++) {
      if (!already.has(n)) return n;
    }
    return 1;
  }

  private generate75BallCard(): number[][] {
    const colRanges: Array<[number, number]> = [
      [1, 15],
      [16, 30],
      [31, 45],
      [46, 60],
      [61, 75],
    ];

    const cols: number[][] = colRanges.map(([start, end]) => this.pickUniqueNumbers(start, end, 5));
    // 5x5 grid row-major
    const grid: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 5; r++) {
        grid[r][c] = cols[c][r];
      }
    }
    // Free space ตรงกลาง (มาตรฐาน) ตั้งเป็น 0
    grid[2][2] = 0;
    return grid;
  }

  private pickUniqueNumbers(start: number, end: number, count: number): number[] {
    const nums = [] as number[];
    const pool = [] as number[];
    for (let n = start; n <= end; n++) pool.push(n);
    while (nums.length < count && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      nums.push(pool.splice(idx, 1)[0]);
    }
    return nums;
  }

  private hashCard(input: { gameId: string; userId: string; numbers: number[][]; nonce: string }) {
    const raw = JSON.stringify({ gameId: input.gameId, userId: input.userId, numbers: input.numbers, nonce: input.nonce });
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  private validateBingo(params: { numbers: number[][]; drawnNumbers: number[]; pattern: BingoPatternDto }) {
    const drawn = new Set(params.drawnNumbers);
    const has = (r: number, c: number) => {
      const v = params.numbers?.[r]?.[c];
      if (v === 0) return true; // free
      return drawn.has(v);
    };

    const missing: number[] = [];
    const pushMissing = (r: number, c: number) => {
      const v = params.numbers?.[r]?.[c];
      if (v && v !== 0 && !drawn.has(v)) missing.push(v);
    };

    const checkRow = (r: number) => {
      missing.length = 0;
      for (let c = 0; c < 5; c++) {
        if (!has(r, c)) pushMissing(r, c);
      }
      return missing.length === 0;
    };

    const checkCol = (c: number) => {
      missing.length = 0;
      for (let r = 0; r < 5; r++) {
        if (!has(r, c)) pushMissing(r, c);
      }
      return missing.length === 0;
    };

    const checkDiag1 = () => {
      missing.length = 0;
      for (let i = 0; i < 5; i++) {
        if (!has(i, i)) pushMissing(i, i);
      }
      return missing.length === 0;
    };

    const checkDiag2 = () => {
      missing.length = 0;
      for (let i = 0; i < 5; i++) {
        if (!has(i, 4 - i)) pushMissing(i, 4 - i);
      }
      return missing.length === 0;
    };

    const checkFourCorners = () => {
      missing.length = 0;
      const corners: Array<[number, number]> = [
        [0, 0],
        [0, 4],
        [4, 0],
        [4, 4],
      ];
      for (const [r, c] of corners) {
        if (!has(r, c)) pushMissing(r, c);
      }
      return missing.length === 0;
    };

    const pattern = params.pattern;
    let ok = false;
    let missingSnapshot: number[] = [];

    const rowMap: Record<string, number> = {
      horizontal_1: 0,
      horizontal_2: 1,
      horizontal_3: 2,
      horizontal_4: 3,
      horizontal_5: 4,
    };
    const colMap: Record<string, number> = {
      vertical_1: 0,
      vertical_2: 1,
      vertical_3: 2,
      vertical_4: 3,
      vertical_5: 4,
    };

    if (pattern in rowMap) {
      ok = checkRow(rowMap[pattern]);
      missingSnapshot = [...missing];
    } else if (pattern in colMap) {
      ok = checkCol(colMap[pattern]);
      missingSnapshot = [...missing];
    } else if (pattern === 'diagonal_1') {
      ok = checkDiag1();
      missingSnapshot = [...missing];
    } else if (pattern === 'diagonal_2') {
      ok = checkDiag2();
      missingSnapshot = [...missing];
    } else if (pattern === 'four_corners') {
      ok = checkFourCorners();
      missingSnapshot = [...missing];
    }

    return {
      isValid: ok,
      pattern,
      drawnCount: params.drawnNumbers.length,
      missingNumbers: missingSnapshot,
    };
  }
}
