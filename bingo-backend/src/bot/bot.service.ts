import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BotService {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: Implement ghost bot logic
}
