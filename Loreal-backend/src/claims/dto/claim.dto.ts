import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().replace(/[ \t]+/g, ' ') : value;

/**
 * Fields of POST /api/claims/assess, sent as JSON or as multipart form fields.
 * The evidence is either the `evidence` text or an uploaded PDF `file`.
 */
export class AssessClaimDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  productName: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  claim: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(20, { message: 'evidence must describe the study (at least 20 characters)' })
  @MaxLength(20000)
  evidence?: string;
}
