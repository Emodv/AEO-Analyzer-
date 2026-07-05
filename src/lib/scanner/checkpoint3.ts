import axios from 'axios';
import { CheckpointResult } from '../../types';

export async function checkLlmsTxt(domain: string): Promise<CheckpointResult> {
  const targetUrl = `https://${domain}/llms.txt`;
  
  try {
    const response = await axios.get(targetUrl, {
      timeout: 5000,
      headers: { 'User-Agent': 'AEOAnalyzer/1.0' },
      validateStatus: () => true // Allow handling non-200 states
    });

    if (response.status === 200 && response.data && typeof response.data === 'string' && response.data.trim().length >= 10) {
      return {
        pass: true,
        label: 'llms.txt Presence',
        detail: `Valid llms.txt found at root (${response.data.trim().length} characters). Provides dense, machine-optimized context.`
      };
    }

    if (response.status === 404) {
      return {
        pass: false,
        label: 'llms.txt Presence',
        detail: 'File not found (404). AI engines rely on llms.txt at root to index your site context efficiently.'
      };
    }

    return {
      pass: false,
      label: 'llms.txt Presence',
      detail: `File returned invalid status ${response.status} or was too short. Needs a clean, Markdown-formatted llms.txt.`
    };
  } catch (error: any) {
    console.error('Error checking llms.txt:', error.message);
    return {
      pass: false,
      label: 'llms.txt Presence',
      detail: `Could not check llms.txt: ${error.message}. Please configure a public file at /llms.txt.`
    };
  }
}
