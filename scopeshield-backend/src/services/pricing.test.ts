import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyzeInputSchema } from '../schemas/analysisSchema.js';
import { calculateEstimatedCost } from './pricing.js';

test('calculates and rounds the INR amount to two decimal places', () => {
  assert.equal(calculateEstimatedCost(1.25, 100.25), 125.31);
  assert.equal(calculateEstimatedCost(0.1, 0.05), 0.01);
});

test('allows zero estimated hours and zero hourly rate', () => {
  assert.equal(calculateEstimatedCost(0, 1_000), 0);
  assert.equal(calculateEstimatedCost(2, 0), 0);
});

test('validates multipart pricing fields as finite, non-negative values with upper bounds', () => {
  const valid = analyzeInputSchema.safeParse({
    clientRequest: 'Add a reporting page',
    estimatedExtraHours: '500',
    hourlyRate: '100000'
  });
  assert.equal(valid.success, true);

  for (const [hours, rate] of [
    ['-1', '100'],
    ['1', '-1'],
    ['', '100'],
    ['1', ''],
    ['Infinity', '100'],
    ['1', 'NaN'],
    ['501', '100'],
    ['1', '100001']
  ]) {
    assert.equal(analyzeInputSchema.safeParse({
      clientRequest: 'Add a reporting page',
      estimatedExtraHours: hours,
      hourlyRate: rate
    }).success, false);
  }
});

test('pricing service rejects invalid direct-call inputs', () => {
  for (const [hours, rate] of [
    [-1, 100],
    [1, -1],
    [Number.NaN, 100],
    [1, Number.POSITIVE_INFINITY],
    [501, 100],
    [1, 100_001]
  ]) {
    assert.throws(() => calculateEstimatedCost(hours, rate));
  }
});
