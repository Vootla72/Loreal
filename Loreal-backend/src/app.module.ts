import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { LlmModule } from './llm/llm.module';
import { ProductsModule } from './products/products.module';
import { ClaimsModule } from './claims/claims.module';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, LlmModule, ProductsModule, ClaimsModule],
  controllers: [HealthController],
})
export class AppModule {}
