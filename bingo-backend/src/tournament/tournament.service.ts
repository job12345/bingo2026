import {
    Injectable,
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TournamentStatus, TransactionType, TransactionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Default prize distribution: [50%, 30%, 20%]
const DEFAULT_PRIZE_DISTRIBUTION = [50, 30, 20];

@Injectable()
export class TournamentService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get all tournaments (with optional status filter)
     */
    async getTournaments(status?: TournamentStatus) {
        const where = status ? { status } : undefined;

        const tournaments = await this.prisma.tournament.findMany({
            where,
            include: {
                _count: { select: { participants: true } },
            },
            orderBy: { startsAt: 'asc' },
        });

        return tournaments.map((t) => ({
            ...t,
            participantCount: t._count.participants,
            _count: undefined,
        }));
    }

    /**
     * Get single tournament details
     */
    async getTournament(id: string) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id },
            include: {
                participants: {
                    orderBy: { score: 'desc' },
                    take: 50,
                },
                _count: { select: { participants: true } },
            },
        });

        if (!tournament) {
            throw new NotFoundException('ไม่พบทัวร์นาเมนต์นี้');
        }

        return {
            ...tournament,
            participantCount: tournament._count.participants,
            _count: undefined,
        };
    }

    /**
     * Join tournament (register)
     */
    async joinTournament(userId: string, tournamentId: string) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id: tournamentId },
            include: { _count: { select: { participants: true } } },
        });

        if (!tournament) {
            throw new NotFoundException('ไม่พบทัวร์นาเมนต์นี้');
        }

        if (tournament.status !== TournamentStatus.registration) {
            throw new BadRequestException('ทัวร์นาเมนต์ไม่เปิดรับสมัครแล้ว');
        }

        if (tournament._count.participants >= tournament.maxPlayers) {
            throw new BadRequestException('ทัวร์นาเมนต์เต็มแล้ว');
        }

        // Check if already joined
        const existing = await this.prisma.tournamentParticipant.findUnique({
            where: { tournamentId_userId: { tournamentId, userId } },
        });

        if (existing) {
            throw new BadRequestException('คุณสมัครทัวร์นาเมนต์นี้แล้ว');
        }

        // Pay entry fee
        const entryFee = new Decimal(tournament.entryFee);

        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { pointBalance: true },
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const balanceBefore = new Decimal(user.pointBalance);
            if (balanceBefore.lt(entryFee)) {
                throw new ForbiddenException('ยอดเงินไม่เพียงพอ');
            }

            const balanceAfter = balanceBefore.sub(entryFee);

            await tx.user.update({
                where: { id: userId },
                data: { pointBalance: balanceAfter },
            });

            await tx.transaction.create({
                data: {
                    userId,
                    type: TransactionType.card_purchase,
                    amount: entryFee,
                    status: TransactionStatus.completed,
                    balanceBefore,
                    balanceAfter,
                    metadata: { type: 'tournament_entry', tournamentId },
                    notes: `สมัครทัวร์นาเมนต์ ${tournament.name}`,
                },
            });

            // Create participant
            const participant = await tx.tournamentParticipant.create({
                data: { tournamentId, userId },
            });

            // Add to prize pool
            await tx.tournament.update({
                where: { id: tournamentId },
                data: { prizePool: { increment: entryFee } },
            });

            return {
                participant,
                newBalance: balanceAfter,
            };
        });

        return result;
    }

    /**
     * Get tournament leaderboard
     */
    async getLeaderboard(tournamentId: string) {
        const participants = await this.prisma.tournamentParticipant.findMany({
            where: { tournamentId },
            orderBy: { score: 'desc' },
            take: 100,
        });

        return participants.map((p, index) => ({
            rank: index + 1,
            ...p,
        }));
    }

    /**
     * Update participant score (called after game ends)
     */
    async updateParticipantScore(tournamentId: string, userId: string, won: boolean) {
        const participant = await this.prisma.tournamentParticipant.findUnique({
            where: { tournamentId_userId: { tournamentId, userId } },
        });

        if (!participant) return;

        const scoreIncrement = won ? 10 : 1; // Win = 10 points, Play = 1 point

        await this.prisma.tournamentParticipant.update({
            where: { id: participant.id },
            data: {
                score: { increment: scoreIncrement },
                gamesPlayed: { increment: 1 },
                ...(won ? { gamesWon: { increment: 1 } } : {}),
            },
        });
    }

    /**
     * End tournament and distribute prizes
     */
    async endTournament(tournamentId: string) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id: tournamentId },
            include: {
                participants: {
                    orderBy: { score: 'desc' },
                },
            },
        });

        if (!tournament) {
            throw new NotFoundException('ไม่พบทัวร์นาเมนต์นี้');
        }

        if (tournament.status === TournamentStatus.completed) {
            throw new BadRequestException('ทัวร์นาเมนต์จบแล้ว');
        }

        const prizeDistribution = (tournament.prizeDistribution as number[]) || DEFAULT_PRIZE_DISTRIBUTION;
        const prizePool = new Decimal(tournament.prizePool);

        await this.prisma.$transaction(async (tx) => {
            // Update rankings and distribute prizes
            for (let i = 0; i < tournament.participants.length; i++) {
                const participant = tournament.participants[i];
                const ranking = i + 1;

                // Calculate prize
                let prizeAmount = new Decimal(0);
                if (i < prizeDistribution.length && prizePool.gt(0)) {
                    prizeAmount = prizePool.mul(prizeDistribution[i]).div(100);
                }

                // Update participant
                await tx.tournamentParticipant.update({
                    where: { id: participant.id },
                    data: {
                        ranking,
                        prizeWon: prizeAmount,
                    },
                });

                // Pay prize if won
                if (prizeAmount.gt(0)) {
                    const user = await tx.user.findUnique({
                        where: { id: participant.userId },
                        select: { pointBalance: true },
                    });

                    const balanceBefore = new Decimal(user!.pointBalance);
                    const balanceAfter = balanceBefore.add(prizeAmount);

                    await tx.user.update({
                        where: { id: participant.userId },
                        data: { pointBalance: balanceAfter },
                    });

                    await tx.transaction.create({
                        data: {
                            userId: participant.userId,
                            type: TransactionType.payout,
                            amount: prizeAmount,
                            status: TransactionStatus.completed,
                            balanceBefore,
                            balanceAfter,
                            metadata: { type: 'tournament_prize', tournamentId, ranking },
                            notes: `รางวัลอันดับ ${ranking} ทัวร์นาเมนต์ ${tournament.name}`,
                        },
                    });
                }
            }

            // Update tournament status
            await tx.tournament.update({
                where: { id: tournamentId },
                data: {
                    status: TournamentStatus.completed,
                    endsAt: new Date(),
                },
            });
        });

        return { message: 'Tournament completed successfully' };
    }

    /**
     * Create tournament (Admin only)
     */
    async createTournament(
        createdById: string,
        data: {
            name: string;
            description?: string;
            entryFee: number;
            maxPlayers: number;
            totalRounds: number;
            startsAt: Date;
            prizeDistribution?: number[];
        },
    ) {
        const tournament = await this.prisma.tournament.create({
            data: {
                name: data.name,
                description: data.description,
                entryFee: new Decimal(data.entryFee),
                maxPlayers: data.maxPlayers,
                totalRounds: data.totalRounds,
                startsAt: data.startsAt,
                prizeDistribution: data.prizeDistribution || DEFAULT_PRIZE_DISTRIBUTION,
                createdById,
                status: TournamentStatus.upcoming,
            },
        });

        return tournament;
    }

    /**
     * Start tournament registration
     */
    async startRegistration(tournamentId: string) {
        await this.prisma.tournament.update({
            where: { id: tournamentId },
            data: { status: TournamentStatus.registration },
        });
        return { message: 'Registration started' };
    }

    /**
     * Start tournament
     */
    async startTournament(tournamentId: string) {
        await this.prisma.tournament.update({
            where: { id: tournamentId },
            data: { status: TournamentStatus.in_progress },
        });
        return { message: 'Tournament started' };
    }
}
