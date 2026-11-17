-- CreateTable
CREATE TABLE "Claim" (
    "id" SERIAL NOT NULL,
    "productName" TEXT NOT NULL,
    "claimText" TEXT NOT NULL,
    "normalizedText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" SERIAL NOT NULL,
    "claimId" INTEGER NOT NULL,
    "evidence" TEXT NOT NULL,
    "isJustified" BOOLEAN NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Claim_productName_normalizedText_key" ON "Claim"("productName", "normalizedText");

-- CreateIndex
CREATE INDEX "Assessment_claimId_createdAt_idx" ON "Assessment"("claimId", "createdAt");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
