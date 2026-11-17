import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { AssessClaimDto, CreateClaimDto, UpdateClaimDto } from './dto/claim.dto';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claims: ClaimsService) {}

  @Get()
  findAll() {
    return this.claims.findAll();
  }

  @Post()
  create(@Body() dto: CreateClaimDto) {
    return this.claims.create(dto);
  }

  /** POST /api/claims/assess  { claimId, evidence }  ->  saved Assessment */
  @Post('assess')
  @HttpCode(201)
  assess(@Body() dto: AssessClaimDto) {
    return this.claims.assess(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClaimDto) {
    return this.claims.update(id, dto);
  }

  @Get(':id/assessments')
  listAssessments(@Param('id', ParseIntPipe) id: number) {
    return this.claims.listAssessments(id);
  }
}
