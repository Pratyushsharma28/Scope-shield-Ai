import { pricingInputSchema } from '../schemas/analysisSchema.js';

export function calculateEstimatedCost(estimatedExtraHours: number, hourlyRate: number): number {
  const validated = pricingInputSchema.parse({ estimatedExtraHours, hourlyRate });
  const exactCost = validated.estimatedExtraHours * validated.hourlyRate;
  const roundedCost = Math.round(exactCost * 100) / 100;
  return roundedCost;
}
