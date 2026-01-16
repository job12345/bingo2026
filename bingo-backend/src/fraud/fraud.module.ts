import { Module } from '@nestjs/common';
import { FraudController } from './fraud.controller';
import { FraudService } from './fraud.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TelegramModule } from '../common/telegram/telegram.module';

@Module({
    imports: [PrismaModule, TelegramModule],
    controllers: [FraudController],
    providers: [FraudService],
    exports: [FraudService],
})
export class FraudModule { }
