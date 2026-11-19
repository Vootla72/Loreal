/**
 * Dummy data for demos: realistic claims with a mix of justified and unjustified
 * assessments. Safe to run more than once: claims are matched like the API matches
 * them, and a claim that already has assessments is left alone.
 *
 * Run: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import { normalizeClaim } from '../src/utils/normalize-claim';
import { hashEvidence } from '../src/claims/evidence-hash';

const prisma = new PrismaClient();

interface SeedAssessment {
  evidence: string;
  isJustified: boolean;
  confidenceScore: number;
  reasoning: string;
  daysAgo: number;
}

interface SeedClaim {
  productName: string;
  claimText: string;
  assessments: SeedAssessment[];
}

const MODEL = 'seed-data';

const CLAIMS: SeedClaim[] = [
  {
    productName: 'Revitalift Night Cream',
    claimText: 'Reduces wrinkles by 20% in 4 weeks',
    assessments: [
      {
        daysAgo: 21,
        evidence:
          'Open-label pilot, 12 volunteers. Participants self-reported smoother skin after 6 weeks. No instrumental measurement.',
        isJustified: false,
        confidenceScore: 0.91,
        reasoning:
          'The pilot relies on self-assessment, not a measured wrinkle endpoint, and reports results at 6 weeks rather than 4. ' +
          'With 12 volunteers and no control group, it cannot substantiate a quantified 20% reduction.',
      },
      {
        daysAgo: 3,
        evidence:
          'Randomised, double-blind, vehicle-controlled study, n=60 women aged 40-65. Crow\'s-feet wrinkle depth measured by ' +
          'fringe projection profilometry. Mean depth reduced by 22% at week 4 vs baseline (p<0.01); vehicle showed no significant change.',
        isJustified: true,
        confidenceScore: 0.88,
        reasoning:
          'The study measures wrinkle depth instrumentally, which matches the claim endpoint. The 22% mean reduction at week 4 ' +
          'meets both the 20% magnitude and the 4-week timeframe, with statistical significance against a vehicle control.',
      },
    ],
  },
  {
    productName: 'Hydra Genius Serum',
    claimText: 'Provides 72-hour hydration',
    assessments: [
      {
        daysAgo: 10,
        evidence:
          'Randomised, vehicle-controlled study, n=40. Corneometer readings at baseline, 24h, 48h and 72h after one application. ' +
          'Hydration +38% at 24h, +29% at 48h and +21% at 72h vs baseline (all p<0.01).',
        isJustified: true,
        confidenceScore: 0.9,
        reasoning:
          'Corneometry directly measures skin hydration, and a significant increase is still present at the 72-hour timepoint. ' +
          'The controlled design and panel size of 40 are adequate for this claim.',
      },
    ],
  },
  {
    productName: 'UV Defender SPF 50+',
    claimText: 'Protects against 99% of UVB rays',
    assessments: [
      {
        daysAgo: 7,
        evidence:
          'In-vitro SPF measurement on PMMA plates gave SPF 52. No in-vivo ISO 24444 testing performed.',
        isJustified: false,
        confidenceScore: 0.76,
        reasoning:
          'SPF 50 corresponds to about 98% UVB filtration, so a 99% figure overstates protection. In-vitro results alone are not ' +
          'accepted for SPF labelling; in-vivo ISO 24444 testing is required.',
      },
    ],
  },
  {
    productName: 'Elseve Dream Lengths Shampoo',
    claimText: 'Up to 8x less breakage',
    assessments: [
      {
        daysAgo: 14,
        evidence:
          'Instrumental combing test on 10 hair tresses, shampoo vs non-conditioning base. Breakage events reduced by 8.3x ' +
          '(p<0.05) after 5 wash cycles.',
        isJustified: true,
        confidenceScore: 0.67,
        reasoning:
          'The combing test measures breakage directly and the 8.3x reduction supports "up to 8x". Confidence is moderate because ' +
          'the test uses hair tresses rather than consumers, which is common practice but limits real-world generalisation.',
      },
    ],
  },
  {
    productName: 'Pure Clay Detox Mask',
    claimText: 'Visibly reduces pores in 1 use',
    assessments: [
      {
        daysAgo: 1,
        evidence: 'Consumer perception survey, n=110. 68% agreed "my pores look smaller" immediately after one use.',
        isJustified: false,
        confidenceScore: 0.58,
        reasoning:
          'Perception data can support "visibly" wording, but there is no control arm and no instrumental pore measurement. ' +
          'A 68% agreement rate is suggestive, so the verdict is uncertain rather than a clear rejection.',
      },
    ],
  },
  {
    // Proposed but not yet assessed: shows a claim with no history.
    productName: 'Age Perfect Day Cream',
    claimText: 'Firmer skin in 2 weeks',
    assessments: [],
  },
];

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function main() {
  let createdAssessments = 0;

  for (const seed of CLAIMS) {
    const normalizedText = normalizeClaim(seed.claimText);
    const claim = await prisma.claim.upsert({
      where: { productName_normalizedText: { productName: seed.productName, normalizedText } },
      update: {},
      create: {
        productName: seed.productName,
        claimText: seed.claimText,
        normalizedText,
        createdAt: daysAgo(Math.max(0, ...seed.assessments.map((a) => a.daysAgo)) + 1),
      },
    });

    if ((await prisma.assessment.count({ where: { claimId: claim.id } })) > 0) continue;

    for (const a of seed.assessments) {
      await prisma.assessment.create({
        data: {
          claimId: claim.id,
          evidence: a.evidence,
          evidenceHash: hashEvidence(a.evidence),
          isJustified: a.isJustified,
          confidenceScore: a.confidenceScore,
          reasoning: a.reasoning,
          model: MODEL,
          createdAt: daysAgo(a.daysAgo),
        },
      });
      createdAssessments++;
    }
  }

  const [claims, assessments] = await Promise.all([prisma.claim.count(), prisma.assessment.count()]);
  console.log(`Seed complete: added ${createdAssessments} assessments. Database now has ${claims} claims, ${assessments} assessments.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
