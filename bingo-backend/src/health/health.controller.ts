import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'bingo-backend',
      };
    } catch (error) {
      throw new ServiceUnavailableException('Database unavailable');
    }
  }
}
