import { Body, Controller, Post } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { AssessClaimDto } from './dto/claim.dto';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claims: ClaimsService) {}

  /** POST /api/claims/assess  { productName, claim, evidence }  ->  saved assessment */
  @Post('assess')
  assess(@Body() dto: AssessClaimDto) {
    return this.claims.assess(dto);
  }
}
