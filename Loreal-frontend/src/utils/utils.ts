import { MAX_PDF_BYTES, MAX_PDF_MB } from "../constants";

export const checkPdf = (file: File): string | null => {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return "Please choose a PDF file.";
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_PDF_BYTES) return `The PDF is larger than ${MAX_PDF_MB} MB.`;
  return null;
};
