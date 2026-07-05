// scoring.test.ts
import { CheckpointResult, ChecksObject } from '../types';

export function calculateScore(passesCount: number): { score: number; status: string } {
  const score = Math.round(passesCount * 12.5);
  const status =
    score >= 85 ? 'AI-Ready' :
    score >= 70 ? 'Needs Work' :
                  'Urgent Action Required';
  return { score, status };
}

describe('AEO Scoring Calculations', () => {
  it('should return a score of 0 and Urgent Action Required for 0 passes', () => {
    const { score, status } = calculateScore(0);
    expect(score).toBe(0);
    expect(status).toBe('Urgent Action Required');
  });

  it('should return a score of 50 and Urgent Action Required for 4 passes', () => {
    const { score, status } = calculateScore(4);
    expect(score).toBe(50);
    expect(status).toBe('Urgent Action Required');
  });

  it('should return a score of 100 and AI-Ready for 8 passes', () => {
    const { score, status } = calculateScore(8);
    expect(score).toBe(100);
    expect(status).toBe('AI-Ready');
  });

  it('should return Needs Work for 6 passes (75 score)', () => {
    const { score, status } = calculateScore(6);
    expect(score).toBe(75);
    expect(status).toBe('Needs Work');
  });
});
