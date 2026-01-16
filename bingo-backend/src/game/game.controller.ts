import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GameService } from './game.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BuyCardsDto } from './dto/buy-cards.dto';
import { ClaimBingoDto } from './dto/claim-bingo.dto';

@ApiTags('game')
@ApiBearerAuth()
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) { }

  @Post(':roomId/join')
  async joinRoom(@CurrentUser('id') userId: string, @Param('roomId') roomId: string) {
    return this.gameService.joinRoom(userId, roomId);
  }

  @Post(':gameId/buy-cards')
  async buyCards(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
    @Body() dto: BuyCardsDto,
  ) {
    return this.gameService.buyCards(userId, gameId, dto.quantity);
  }

  @Post(':gameId/bingo')
  async claimBingo(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
    @Body() dto: ClaimBingoDto,
  ) {
    return this.gameService.claimBingo(userId, gameId, dto.cardId, dto.pattern);
  }

  @Get(':gameId')
  async getGame(@Param('gameId') gameId: string) {
    return this.gameService.getGameState(gameId);
  }

  @Get(':gameId/cards')
  async getMyCards(@CurrentUser('id') userId: string, @Param('gameId') gameId: string) {
    return this.gameService.getMyCards(userId, gameId);
  }

  /**
   * Manual Draw - Host จับเลขเอง
   */
  @Post(':gameId/manual-draw')
  async manualDraw(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
    @Body() dto: { number?: number },
  ) {
    return this.gameService.manualDraw(userId, gameId, dto.number);
  }

  /**
   * Get available numbers สำหรับ manual draw
   */
  @Get(':gameId/available-numbers')
  async getAvailableNumbers(@Param('gameId') gameId: string) {
    return this.gameService.getAvailableNumbers(gameId);
  }
}
