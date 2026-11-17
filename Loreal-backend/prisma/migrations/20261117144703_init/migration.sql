-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('Pending', 'Under Review', 'Sent to Scientist', 'Rejected', 'Ready for Evaluation', 'Approved', 'Evaluation Rejected');

-- CreateEnum
CREATE TYPE "ScientistResult" AS ENUM ('PASS', 'FAIL', 'INCONCLUSIVE');

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "claimText" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'Pending',
    "applicability" BOOLEAN,
    "feasibility" BOOLEAN,
    "managerComments" TEXT,
    "scientistTest" TEXT,
    "scientistResult" "ScientistResult",
    "scientistComments" TEXT,
    "finalComments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
    "gaps" TEXT[],
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE INDEX "Claim_productId_idx" ON "Claim"("productId");

-- CreateIndex
CREATE INDEX "Assessment_claimId_createdAt_idx" ON "Assessment"("claimId", "createdAt");

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
