import { createHash } from 'node:crypto';

/**
 * Same evidence => same hash, ignoring whitespace differences (PDF line breaks, extra spaces).
 * The SQL backfill in the add_assessment_cache_key migration uses the same normalization.
 */
export const hashEvidence = (evidence: string) =>
  createHash('sha256').update(evidence.replace(/\s+/g, ' ').trim(), 'utf8').digest('hex');
