import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GeminiUpstreamError, validateAssessmentResponse } from './geminiAnalyzer.js';
import { analyzeResponseSchema } from '../schemas/analysisSchema.js';

const contractText = 'The project includes design and delivery of a marketing website.';

function response(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    status: 'within_scope',
    summary: 'The request appears covered by the website delivery clause.',
    evidence: [{
      clause: 'The project includes design and delivery of a marketing website.',
      explanation: 'The request is for work on the contracted website.'
    }],
    uncertaintyReasons: [],
    requiresHumanReview: false,
    ...overrides
  });
}

test('validates structured within-scope output with exact contract evidence', () => {
  const assessment = validateAssessmentResponse(response(), contractText);
  assert.equal(assessment.status, 'within_scope');
  assert.equal(assessment.evidence[0]?.clause, contractText);
});

test('rejects a clause that does not occur in the contract', () => {
  assert.throws(
    () => validateAssessmentResponse(response({
      evidence: [{
        clause: 'Analytics and SEO services are expressly excluded.',
        explanation: 'This exclusion applies to the request.'
      }],
      status: 'potentially_out_of_scope',
      requiresHumanReview: true
    }), contractText),
    GeminiUpstreamError
  );
});

test('rejects missing evidence when classified as outside scope', () => {
  assert.throws(
    () => validateAssessmentResponse(response({
      status: 'potentially_out_of_scope',
      evidence: [],
      requiresHumanReview: true
    }), contractText),
    GeminiUpstreamError
  );
});

test('accepts needs-review output without evidence when uncertainty is explained', () => {
  const assessment = validateAssessmentResponse(response({
    status: 'needs_review',
    evidence: [],
    uncertaintyReasons: ['The contract does not describe analytics work.'],
    requiresHumanReview: true
  }), contractText);
  assert.equal(assessment.status, 'needs_review');
  assert.equal(assessment.requiresHumanReview, true);
});

test('rejects malformed JSON and schema mismatches', () => {
  assert.throws(() => validateAssessmentResponse('{not json', contractText), GeminiUpstreamError);
  assert.throws(() => validateAssessmentResponse(JSON.stringify({ status: 'within_scope' }), contractText), GeminiUpstreamError);
});

test('validates complete analysis responses with the original INR inputs', () => {
  const analysisResponse = analyzeResponseSchema.parse({
    ...JSON.parse(response()),
    estimatedExtraHours: 1.25,
    hourlyRate: 100.25,
    estimatedExtraCost: 125.31,
    currency: 'INR'
  });
  assert.equal(analysisResponse.estimatedExtraHours, 1.25);
  assert.equal(analysisResponse.hourlyRate, 100.25);
  assert.equal(analysisResponse.estimatedExtraCost, 125.31);
  assert.equal(analysisResponse.currency, 'INR');
  assert.equal(analyzeResponseSchema.safeParse({
    ...analysisResponse,
    estimatedExtraCost: 125.3
  }).success, false);
});
