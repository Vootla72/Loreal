import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/** Trim and collapse repeated whitespace, so stored and displayed text is tidy. */
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().replace(/[ \t]+/g, ' ') : value;

/** Body of POST /api/claims/assess */
export class AssessClaimDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  productName: string;

  /** The proposed claim, e.g. "Reduces wrinkles by 20% in 4 weeks". */
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  claim: string;

  /** Clinical study results attached by the evaluator. */
  @Transform(trim)
  @IsString()
  @MinLength(20, { message: 'evidence must describe the study (at least 20 characters)' })
  @MaxLength(20000)
  evidence: string;
}
