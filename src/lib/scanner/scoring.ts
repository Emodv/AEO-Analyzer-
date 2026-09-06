import { ChecksObject } from '../../types';

/**
 * Evidence-weighted AEO score.
 *
 * Core crawlability, structured data and accessible semantic content carry most
 * of the score because they are established prerequisites for machine retrieval.
 * Emerging conventions such as llms.txt receive a small weight. Experimental
 * agent action-policy manifests are reported diagnostically but do not affect
 * the score until there is credible ecosystem adoption.
 */
export const CHECKPOINT_WEIGHTS: Record<keyof ChecksObject, number> = {
  checkpoint_1: 20, // robots.txt / crawler access
  checkpoint_2: 20, // schema markup
  checkpoint_3: 5,  // llms.txt: emerging, optional convention
  checkpoint_4: 0,  // agent action policy: experimental, informational only
  checkpoint_5: 20, // semantic/content discoverability
  checkpoint_6: 15, // server-rendered accessibility
  checkpoint_7: 10, // performance
  checkpoint_8: 10, // structured-data freshness/quality
};

export function calculateAeoScore(checks: ChecksObject): number {
  return (Object.keys(CHECKPOINT_WEIGHTS) as Array<keyof ChecksObject>)
    .reduce((score, key) => score + (checks[key].pass ? CHECKPOINT_WEIGHTS[key] : 0), 0);
}

export function getAeoStatus(score: number): 'AI-Ready' | 'Needs Work' | 'Urgent Action Required' {
  if (score >= 85) return 'AI-Ready';
  if (score >= 70) return 'Needs Work';
  return 'Urgent Action Required';
}
