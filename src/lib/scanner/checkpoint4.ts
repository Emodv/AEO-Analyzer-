import axios from 'axios';
import { CheckpointResult } from '../../types';

/**
 * Experimental agent action-policy discovery.
 * This is intentionally informational: there is no broadly adopted web standard
 * that makes this file a prerequisite for AI search visibility.
 */
export async function checkAgentPermissions(domain: string): Promise<CheckpointResult> {
  const candidates = [
    `https://${domain}/.well-known/agent-permissions.json`,
    `https://${domain}/agent-permissions.json`,
  ];

  for (const targetUrl of candidates) {
    try {
      const response = await axios.get(targetUrl, {
        timeout: 5000,
        headers: { 'User-Agent': 'AEOAnalyzer/1.0' },
        validateStatus: () => true,
      });
      if (response.status === 200 && response.data) {
        try {
          const parsed = typeof response.data === 'object' ? response.data : JSON.parse(response.data);
          if (parsed && typeof parsed === 'object') {
            return {
              pass: true,
              label: 'Agent Action Policy (Experimental)',
              detail: `Machine-readable agent policy found at ${new URL(targetUrl).pathname}. This is an emerging convention and is reported for readiness only; it is not treated as a confirmed AI ranking factor.`,
            };
          }
        } catch {
          return {
            pass: false,
            label: 'Agent Action Policy (Experimental)',
            detail: `A policy file exists at ${new URL(targetUrl).pathname}, but it is not valid JSON. This informational check does not affect the AEO score.`,
          };
        }
      }
    } catch {
      // Try the next candidate. Absence/network failure is informational only.
    }
  }

  return {
    pass: false,
    label: 'Agent Action Policy (Experimental)',
    detail: 'No machine-readable agent action-policy manifest detected. This is an emerging convention, not a requirement for major AI search engines, and does not affect the AEO score.',
  };
}
