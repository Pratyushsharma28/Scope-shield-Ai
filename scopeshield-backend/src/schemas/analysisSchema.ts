import { z } from 'zod';

export const MAX_ESTIMATED_EXTRA_HOURS = 500;
export const MAX_HOURLY_RATE_INR = 100_000;

export const pricingInputSchema = z.object({
  estimatedExtraHours: z.number().finite().min(0).max(MAX_ESTIMATED_EXTRA_HOURS),
  hourlyRate: z.number().finite().min(0).max(MAX_HOURLY_RATE_INR)
}).strict();

function multipartNumberSchema(maximum: number) {
  return z.preprocess(
    value => typeof value === 'string' && value.trim() === '' ? Number.NaN : value,
    z.coerce.number().finite().min(0).max(maximum)
  );
}

export const analyzeInputSchema = z.object({
  clientRequest: z.string().trim().min(1).max(4_000),
  estimatedExtraHours: multipartNumberSchema(MAX_ESTIMATED_EXTRA_HOURS),
  hourlyRate: multipartNumberSchema(MAX_HOURLY_RATE_INR)
}).strict();

export const contractAssessmentSchema = z.object({
  status: z.enum(['within_scope', 'potentially_out_of_scope', 'needs_review']),
  summary: z.string().trim().min(1).max(2_000),
  evidence: z.array(z.object({
    clause: z.string().min(1).max(2_000),
    explanation: z.string().trim().min(1).max(1_000)
  }).strict()).max(8),
  uncertaintyReasons: z.array(z.string().trim().min(1).max(500)).max(8),
  requiresHumanReview: z.boolean()
}).strict();

export type ContractAssessment = z.infer<typeof contractAssessmentSchema>;

export const analyzeResponseSchema = contractAssessmentSchema.extend({
  estimatedExtraHours: pricingInputSchema.shape.estimatedExtraHours,
  hourlyRate: pricingInputSchema.shape.hourlyRate,
  estimatedExtraCost: z.number().finite().min(0).max(MAX_ESTIMATED_EXTRA_HOURS * MAX_HOURLY_RATE_INR),
  currency: z.literal('INR')
}).strict().superRefine((response, context) => {
  const expectedCost = Math.round(response.estimatedExtraHours * response.hourlyRate * 100) / 100;
  if (response.estimatedExtraCost !== expectedCost) {
    context.addIssue({
      code: 'custom',
      path: ['estimatedExtraCost'],
      message: 'Estimated cost must equal the validated hours multiplied by the hourly rate.'
    });
  }
});

export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;
