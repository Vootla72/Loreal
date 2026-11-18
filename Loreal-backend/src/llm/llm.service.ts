import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ASSESSMENT_JSON_SCHEMA, PromptInput, SYSTEM_PROMPT, buildUserPrompt } from './assessment.prompt';

export interface LlmAssessment {
  isJustified: boolean;
  confidenceScore: number;
  reasoning: string;
  model: string;
}

type Verdict = Omit<LlmAssessment, 'model'>;

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly client?: OpenAI;
  private readonly model: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('OPENAI_API_KEY');
    this.model = config.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
    if (apiKey) {
      this.client = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 2 });
    } else {
      this.logger.warn('OPENAI_API_KEY not set: using the offline mock assessor.');
    }
  }

  get mode(): string {
    return this.client ? `openai:${this.model}` : 'mock';
  }

  /** The model id stored with each verdict, known before the call so it can be part of the cache key. */
  get modelId(): string {
    return this.client ? this.model : 'mock';
  }

  async assessClaim(input: PromptInput): Promise<LlmAssessment> {
    const verdict = this.client ? await this.callOpenAi(this.client, input) : this.mockAssess(input);
    return {
      ...verdict,
      confidenceScore: Math.min(1, Math.max(0, verdict.confidenceScore)),
      model: this.modelId,
    };
  }

  private async callOpenAi(client: OpenAI, input: PromptInput): Promise<Verdict> {
    try {
      const completion = await client.chat.completions.create({
        model: this.model,
        temperature: 0,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(input) },
        ],
        response_format: { type: 'json_schema', json_schema: ASSESSMENT_JSON_SCHEMA },
      });
      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from model');
      const parsed = JSON.parse(content) as Verdict;
      if (
        typeof parsed.isJustified !== 'boolean' ||
        typeof parsed.confidenceScore !== 'number' ||
        typeof parsed.reasoning !== 'string'
      ) {
        throw new Error('Model response did not match schema');
      }
      return parsed;
    } catch (error) {
      this.logger.error(`OpenAI assessment failed: ${(error as Error).message}`);
      throw new BadGatewayException('The AI assessment service is unavailable. Please try again.');
    }
  }

  /**
   * Deterministic heuristic used when no API key is configured, so the flow can be
   * demoed offline. It checks that the claim's figures appear in the evidence and
   * looks for basic study-quality signals.
   */
  private mockAssess(input: PromptInput): Verdict {
    const evidence = input.evidence.toLowerCase();
    const claimNumbers = input.claimText.match(/\d+(\.\d+)?/g) ?? [];
    const missingNumbers = claimNumbers.filter((n) => !new RegExp(`\\b${n}\\b`).test(evidence));
    const hasSignificance = /p\s*[<=]\s*0?\.\d+|statistically significant/.test(evidence);
    const hasPanel = /n\s*=\s*\d+|\d+\s+(subjects|participants|volunteers|panelists|women|men)/.test(evidence);
    const hasControl = /placebo|vehicle|control|untreated|randomi[sz]ed|double[- ]blind/.test(evidence);

    const gaps: string[] = [];
    if (missingNumbers.length) gaps.push(`The evidence does not report the claimed figure(s): ${missingNumbers.join(', ')}.`);
    if (!hasSignificance) gaps.push('No statistical significance is reported.');
    if (!hasPanel) gaps.push('The panel size is not stated.');
    if (!hasControl) gaps.push('No control, placebo or randomisation is described.');

    const isJustified = missingNumbers.length === 0 && hasSignificance && hasPanel;
    const confidenceScore = Number((0.5 + 0.1 * (4 - gaps.length)).toFixed(2));
    const note = '(Offline mock assessor.)';
    const reasoning = isJustified
      ? `The evidence reports the claimed figures for "${input.claimText}" with a stated panel size and statistical significance, so the claim appears substantiated. ${note}`
      : `The evidence does not fully substantiate "${input.claimText}". ${gaps.join(' ')} ${note}`;
    return { isJustified, confidenceScore, reasoning };
  }
}
