-- Cache key for reusing an LLM verdict: same claim + evidence + model + prompt version.
ALTER TABLE "Assessment" ADD COLUMN "evidenceHash" TEXT,
ADD COLUMN "promptVersion" TEXT NOT NULL DEFAULT 'v1';

-- Backfill existing rows with the same normalization as src/claims/evidence-hash.ts:
-- collapse whitespace to single spaces, trim, then sha256 as lowercase hex.
UPDATE "Assessment"
SET "evidenceHash" = encode(sha256(convert_to(btrim(regexp_replace("evidence", '\s+', ' ', 'g')), 'UTF8')), 'hex');

ALTER TABLE "Assessment" ALTER COLUMN "evidenceHash" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Assessment_claimId_evidenceHash_model_promptVersion_idx" ON "Assessment"("claimId", "evidenceHash", "model", "promptVersion");
