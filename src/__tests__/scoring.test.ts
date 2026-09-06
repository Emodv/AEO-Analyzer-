import { ChecksObject, CheckpointResult } from '../types';
import { calculateAeoScore, getAeoStatus, CHECKPOINT_WEIGHTS } from '../lib/scanner/scoring';

const result = (pass: boolean): CheckpointResult => ({ pass, label: 'test', detail: 'test' });
const checks = (passing: Array<keyof ChecksObject>): ChecksObject => ({
  checkpoint_1: result(passing.includes('checkpoint_1')),
  checkpoint_2: result(passing.includes('checkpoint_2')),
  checkpoint_3: result(passing.includes('checkpoint_3')),
  checkpoint_4: result(passing.includes('checkpoint_4')),
  checkpoint_5: result(passing.includes('checkpoint_5')),
  checkpoint_6: result(passing.includes('checkpoint_6')),
  checkpoint_7: result(passing.includes('checkpoint_7')),
  checkpoint_8: result(passing.includes('checkpoint_8')),
});

describe('evidence-weighted AEO scoring', () => {
  it('weights sum to 100', () => {
    expect(Object.values(CHECKPOINT_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it('does not penalize an otherwise strong site for missing experimental agent policy', () => {
    const allExceptExperimental = checks([
      'checkpoint_1','checkpoint_2','checkpoint_3','checkpoint_5','checkpoint_6','checkpoint_7','checkpoint_8'
    ]);
    expect(calculateAeoScore(allExceptExperimental)).toBe(100);
    expect(getAeoStatus(100)).toBe('AI-Ready');
  });

  it('gives llms.txt a small emerging-signal weight rather than equal weight', () => {
    expect(calculateAeoScore(checks(['checkpoint_3']))).toBe(5);
  });

  it('prioritizes established crawlability and structured content fundamentals', () => {
    const score = calculateAeoScore(checks(['checkpoint_1','checkpoint_2','checkpoint_5','checkpoint_6']));
    expect(score).toBe(75);
    expect(getAeoStatus(score)).toBe('Needs Work');
  });

  it('returns urgent status when core retrieval fundamentals are weak', () => {
    expect(getAeoStatus(calculateAeoScore(checks(['checkpoint_3','checkpoint_4'])))).toBe('Urgent Action Required');
  });
});
