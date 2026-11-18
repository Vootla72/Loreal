import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClaimsService } from './claims.service';
import { AssessClaimDto } from './dto/claim.dto';
import { MAX_PDF_BYTES, readPdfText } from './pdf-text';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claims: ClaimsService) {}

  /**
   * POST /api/claims/assess  ->  saved assessment
   *  - JSON:      { productName, claim, evidence }
   *  - multipart: productName, claim, file (PDF)
   */
  @Post('assess')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_PDF_BYTES } }))
  async assess(@Body() dto: AssessClaimDto, @UploadedFile() file?: Express.Multer.File) {
    if (file && dto.evidence) {
      throw new BadRequestException('Send the evidence as text or as a PDF file, not both.');
    }
    // Read the PDF first, so a bad file never costs an LLM call.
    const evidence = file ? await readPdfText(file) : dto.evidence;
    if (!evidence) {
      throw new BadRequestException('Provide the evidence as text ("evidence") or as a PDF file ("file").');
    }
    return this.claims.assess({ ...dto, evidence });
  }
}
