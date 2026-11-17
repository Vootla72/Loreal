import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { AssessClaimDto, CreateClaimDto, UpdateClaimDto } from './dto/claim.dto';
import { RESULT_FROM_LABEL, STATUS_FROM_LABEL, toAssessmentResponse, toClaimResponse } from './claim.mapper';

const CLAIM_INCLUDE = {
  product: true,
  assessments: { orderBy: { createdAt: 'desc' }, take: 1 },
} satisfies Prisma.ClaimInclude;

@Injectable()
export class ClaimsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
  ) {}

  async findAll() {
    const claims = await this.prisma.claim.findMany({ include: CLAIM_INCLUDE, orderBy: { createdAt: 'asc' } });
    return claims.map(toClaimResponse);
  }

  async create(dto: CreateClaimDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);
    const claim = await this.prisma.claim.create({
      data: { productId: dto.productId, claimText: dto.claim, category: dto.category },
      include: CLAIM_INCLUDE,
    });
    return toClaimResponse(claim);
  }

  async update(id: number, dto: UpdateClaimDto) {
    await this.getOrThrow(id);
    const { status, scientistResult, ...rest } = dto;
    const claim = await this.prisma.claim.update({
      where: { id },
      data: {
        ...rest,
        ...(status && { status: STATUS_FROM_LABEL[status] }),
        ...(scientistResult && { scientistResult: RESULT_FROM_LABEL[scientistResult] }),
      },
      include: CLAIM_INCLUDE,
    });
    return toClaimResponse(claim);
  }

  async listAssessments(claimId: number) {
    await this.getOrThrow(claimId);
    const rows = await this.prisma.assessment.findMany({ where: { claimId }, orderBy: { createdAt: 'desc' } });
    return rows.map(toAssessmentResponse);
  }

  /**
   * Core feature: ask the LLM whether the clinical evidence justifies the claim,
   * persist the verdict, and return it.
   */
  async assess(dto: AssessClaimDto) {
    const claim = await this.getOrThrow(dto.claimId);
    if (claim.status !== 'READY_FOR_EVALUATION') {
      throw new BadRequestException('Only claims that are "Ready for Evaluation" can be assessed.');
    }

    const scientistSummary = claim.scientistTest
      ? `Test: ${claim.scientistTest}. Result: ${claim.scientistResult ?? 'n/a'}. Notes: ${claim.scientistComments || 'none'}`
      : undefined;

    const verdict = await this.llm.assessClaim({
      productName: claim.product.name,
      productCategory: claim.product.category,
      claimText: claim.claimText,
      evidence: dto.evidence,
      scientistSummary,
    });

    const saved = await this.prisma.assessment.create({
      data: { claimId: claim.id, evidence: dto.evidence, ...verdict },
    });
    return toAssessmentResponse(saved);
  }

  private async getOrThrow(id: number) {
    const claim = await this.prisma.claim.findUnique({ where: { id }, include: { product: true } });
    if (!claim) throw new NotFoundException(`Claim ${id} not found`);
    return claim;
  }
}
