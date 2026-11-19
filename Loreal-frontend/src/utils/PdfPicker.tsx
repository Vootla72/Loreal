import { memo, useCallback } from "react";
import type { ChangeEvent } from "react";
import { FileUp } from "lucide-react";

import { MAX_PDF_MB } from "../constants";

interface PdfPickerProps {
  id: string;
  file: File | null;
  error: string | null;
  disabled: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}

export const PdfPicker = memo(function PdfPicker({ id, file, error, disabled, onPick, onRemove }: PdfPickerProps) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const picked = event.target.files?.[0];
      event.target.value = ""; // allows choosing the same file again later
      if (picked) onPick(picked);
    },
    [onPick],
  );

  return (
    <>
      <div className="file-picker">
        <input
          id={id}
          type="file"
          className="visually-hidden"
          accept="application/pdf,.pdf"
          onChange={handleChange}
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
});
