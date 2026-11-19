import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

export const MAX_PDF_BYTES = 10 * 1024 * 1024;

export async function readPdfText(file: Express.Multer.File): Promise<string> {
  // Check the content, not just the name: every PDF starts with "%PDF-".
  if (!file.buffer.subarray(0, 1024).includes('%PDF-')) {
    throw new BadRequestException('Only PDF files are supported.');
  }

  const parser = new PDFParse({ data: new Uint8Array(file.buffer) });
  let text: string;
  try {
    text = (await parser.getText({ pageJoiner: '' })).text;
  } catch {
    throw new UnprocessableEntityException('This file could not be opened as a PDF. It may be damaged or password-protected.');
  } finally {
    await parser.destroy();
  }

  // Any valid PDF is accepted. If it has no readable text (e.g. a scan), tell the model so.
  text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return text || '(The uploaded PDF contains no readable text.)';
}
