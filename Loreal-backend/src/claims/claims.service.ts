import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { PROMPT_VERSION } from '../llm/assessment.prompt';
import { AssessClaimDto } from './dto/claim.dto';
import { hashEvidence } from '../utils/evidence-hash';
import { normalizeClaim } from '../utils/normalize-claim';
import { AssessmentResponse, RESPONSE_SELECT, SavedAssessment, toResponse } from './assessment.response';

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
  ) {}

  async assess(dto: Required<AssessClaimDto>): Promise<AssessmentResponse> {
    const normalizedText = normalizeClaim(dto.claim);
    const evidenceHash = hashEvidence(dto.evidence);
    const model = this.llm.modelId;

    // Same product, claim, evidence, model and prompt => same verdict (temperature 0), so reuse it
    // instead of paying for another LLM call. Uses the (claimId, evidenceHash, model, promptVersion) index.
    const cached = await this.prisma.assessment.findFirst({
      where: {
        evidenceHash,
        model,
        promptVersion: PROMPT_VERSION,
        claim: { productName: dto.productName, normalizedText },
      },
      orderBy: { createdAt: 'desc' },
      select: RESPONSE_SELECT,
    });
    if (cached) {
      this.logger.log(`Cache hit: reused assessment #${cached.id}, LLM not called`);
      return toResponse(cached, true);
    }

    // Call the LLM first, so a failed call leaves nothing half-saved.
    const verdict = await this.llm.assessClaim({
      productName: dto.productName,
      claimText: dto.claim,
      evidence: dto.evidence,
    });

    const save = () => this.prisma.assessment.create({
      data: {
        evidence: dto.evidence,
        evidenceHash,
        promptVersion: PROMPT_VERSION,
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
      select: RESPONSE_SELECT,
    });

    let assessment: SavedAssessment;
    try {
      assessment = await save();
    } catch (error) {
      // Two identical requests can race to create the same claim. The loser hits the
      // unique constraint; retrying then finds the claim and links to it.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) throw error;
      assessment = await save();
    }

    return toResponse(assessment, false);
  }
}
