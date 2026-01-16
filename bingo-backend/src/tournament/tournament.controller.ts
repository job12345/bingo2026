import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TournamentService } from './tournament.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TournamentStatus } from '@prisma/client';

@ApiTags('tournament')
@ApiBearerAuth()
@Controller('tournament')
export class TournamentController {
    constructor(private readonly tournamentService: TournamentService) { }

    /**
     * Get all tournaments
     */
    @Get()
    async getTournaments(@Query('status') status?: TournamentStatus) {
        return this.tournamentService.getTournaments(status);
    }

    /**
     * Get single tournament details
     */
    @Get(':id')
    async getTournament(@Param('id') id: string) {
        return this.tournamentService.getTournament(id);
    }

    /**
     * Join tournament
     */
    @Post(':id/join')
    async joinTournament(
        @CurrentUser('id') userId: string,
        @Param('id') tournamentId: string,
    ) {
        return this.tournamentService.joinTournament(userId, tournamentId);
    }

    /**
     * Get tournament leaderboard
     */
    @Get(':id/leaderboard')
    async getLeaderboard(@Param('id') tournamentId: string) {
        return this.tournamentService.getLeaderboard(tournamentId);
    }

    /**
     * Create tournament (Admin)
     */
    @Post()
    async createTournament(
        @CurrentUser('id') userId: string,
        @Body()
        dto: {
            name: string;
            description?: string;
            entryFee: number;
            maxPlayers: number;
            totalRounds: number;
            startsAt: string;
            prizeDistribution?: number[];
        },
    ) {
        return this.tournamentService.createTournament(userId, {
            ...dto,
            startsAt: new Date(dto.startsAt),
        });
    }

    /**
     * Start registration (Admin)
     */
    @Post(':id/start-registration')
    async startRegistration(@Param('id') tournamentId: string) {
        return this.tournamentService.startRegistration(tournamentId);
    }

    /**
     * Start tournament (Admin)
     */
    @Post(':id/start')
    async startTournament(@Param('id') tournamentId: string) {
        return this.tournamentService.startTournament(tournamentId);
    }

    /**
     * End tournament and distribute prizes (Admin)
     */
    @Post(':id/end')
    async endTournament(@Param('id') tournamentId: string) {
        return this.tournamentService.endTournament(tournamentId);
    }
}
