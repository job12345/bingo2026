import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { WebsocketModule } from '../websocket/websocket.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WebsocketModule, WalletModule],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
