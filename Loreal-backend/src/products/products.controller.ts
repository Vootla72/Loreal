import { Body, ConflictException, Controller, Get, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, description: true, category: true },
    });
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: dto,
        select: { id: true, name: true, description: true, category: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`A product named "${dto.name}" already exists.`);
      }
      throw error;
    }
  }
}
