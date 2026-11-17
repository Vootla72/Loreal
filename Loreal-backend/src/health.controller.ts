import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { LlmService } from './llm/llm.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
  ) {}

  @Get()
  async check() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'up', llm: this.llm.mode };
  }
}
