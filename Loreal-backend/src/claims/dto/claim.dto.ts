import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import { RESULT_LABELS, STATUS_LABELS } from '../claim.mapper';

export class CreateClaimDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  claim: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;
}

/** Partial update used by the claim manager, scientist and evaluator steps. */
export class UpdateClaimDto {
  @IsOptional()
  @IsIn(Object.values(STATUS_LABELS))
  status?: string;

  @IsOptional() @IsBoolean() applicability?: boolean;
  @IsOptional() @IsBoolean() feasibility?: boolean;
  @IsOptional() @IsString() @MaxLength(5000) managerComments?: string;

  @IsOptional() @IsString() @MaxLength(500) scientistTest?: string;

  @IsOptional()
  @IsIn(Object.values(RESULT_LABELS))
  scientistResult?: string;

  @IsOptional() @IsString() @MaxLength(5000) scientistComments?: string;
  @IsOptional() @IsString() @MaxLength(5000) finalComments?: string;
}

/** Body of POST /api/claims/assess */
export class AssessClaimDto {
  @IsInt()
  @IsPositive()
  claimId: number;

  /** Clinical study results attached by the evaluator. */
  @IsString()
  @MinLength(20, { message: 'evidence must describe the study (at least 20 characters)' })
  @MaxLength(20000)
  evidence: string;
}
