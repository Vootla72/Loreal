import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { AssessClaimDto } from './dto/claim.dto';

/** "Reduces  Wrinkles by 20%" and "reduces wrinkles by 20%" are the same claim. */
export const normalizeClaim = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase();

@Injectable()
export class ClaimsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
  ) {}

  /**
   * Ask the LLM whether the evidence justifies the claim, save the verdict, and return it.
   * The claim is matched on product + normalized wording: reused if it exists, created if not.
   */
  async assess(dto: AssessClaimDto) {
    // Call the LLM first, so a failed call leaves nothing half-saved.
    const verdict = await this.llm.assessClaim({
      productName: dto.productName,
      claimText: dto.claim,
      evidence: dto.evidence,
    });

    const normalizedText = normalizeClaim(dto.claim);

    // One write: link to the existing claim or create it, then store the assessment.
    const save = () => this.prisma.assessment.create({
      data: {
        evidence: dto.evidence,
        isJustified: verdict.isJustified,
        confidenceScore: verdict.confidenceScore,
        reasoning: verdict.reasoning,
        model: verdict.model,
        claim: {
          connectOrCreate: {
            where: { productName_normalizedText: { productName: dto.productName, normalizedText } },
            create: { productName: dto.productName, claimText: dto.claim, normalizedText },
          },
        },
      },
      include: { claim: true },
    });

    let assessment: Awaited<ReturnType<typeof save>>;
    try {
      assessment = await save();
    } catch (error) {
      // Two identical requests can race to create the same claim. The loser hits the
      // unique constraint; retrying then finds the claim and links to it.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) throw error;
      assessment = await save();
    }

    return {
      id: assessment.id,
      claimId: assessment.claimId,
      productName: assessment.claim.productName,
      claim: assessment.claim.claimText,
      isJustified: assessment.isJustified,
      confidenceScore: assessment.confidenceScore,
      reasoning: assessment.reasoning,
      model: assessment.model,
      createdAt: assessment.createdAt.toISOString(),
    };
  }
}
