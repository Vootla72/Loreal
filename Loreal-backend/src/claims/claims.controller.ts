import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClaimsService } from './claims.service';
import { AssessClaimDto } from './dto/claim.dto';
import { MAX_PDF_BYTES, readPdfText } from '../utils/pdf-text';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claims: ClaimsService) {}

  /**
   * POST /api/claims/assess  ->  saved assessment
   *  multipart: productName, claim, file (PDF evidence)
   */
  @Post('assess')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_PDF_BYTES } }))
  async assess(@Body() dto: AssessClaimDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Upload the evidence as a PDF file ("file").');
    }
    // Read the PDF first, so a bad file never costs an LLM call.
    const evidence = await readPdfText(file);
    return this.claims.assess({ ...dto, evidence });
  }
}
