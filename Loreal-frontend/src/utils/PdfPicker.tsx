import type { ChangeEvent } from "react";
import { FileUp } from "lucide-react";

import { MAX_PDF_MB } from "../constants";

interface PdfPickerProps {
  id: string;
  file: File | null;
  error: string | null;
  disabled: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function PdfPicker({ id, file, error, disabled, onChange, onRemove }: PdfPickerProps) {
  return (
    <>
      <div className="file-picker">
        <input
          id={id}
          type="file"
          className="visually-hidden"
          accept="application/pdf,.pdf"
          onChange={onChange}
          disabled={disabled}
        />
        <label htmlFor={id} className="icon-button" title={file ? "Replace PDF" : "Upload PDF"}>
          <FileUp size={22} strokeWidth={1.8} aria-hidden="true" />
        </label>
        <span className={`file-name${file ? "" : " muted"}`} title={file?.name}>
          {file ? file.name : `Upload the study as a PDF (max ${MAX_PDF_MB} MB)`}
        </span>
        {file && (
          <button
            type="button"
            className="remove-file"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remove ${file.name}`}
          >
            ×
          </button>
        )}
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
    </>
  );
}
