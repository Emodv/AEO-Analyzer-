import axios from 'axios';
import { CheckpointResult } from '../../types';

export async function checkCoreWebVitals(domain: string, responseTimeMs: number): Promise<CheckpointResult> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const targetUrl = `https://${domain}`;

  if (!apiKey) {
    return {
      pass: false,
      label: 'Mobile performance',
      detail: `Not measured: Google PageSpeed Insights is not configured. The server responded in ${responseTimeMs}ms, but server response time is not a Core Web Vitals measurement and is not used as a substitute score.`
    };
  }

  try {
    const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&strategy=mobile&key=${apiKey}`;
    const response = await axios.get(apiEndpoint, { timeout: 8000 });

    const performanceScore = response.data?.lighthouseResult?.categories?.performance?.score;
    if (typeof performanceScore === 'number') {
      const pass = performanceScore >= 0.75;
      return {
        pass,
        label: 'Mobile performance',
        detail: `Lighthouse mobile performance score: ${Math.round(performanceScore * 100)}/100 (Google PageSpeed Insights). This is a lab performance score, not a Core Web Vitals field-data result.`
      };
    }

    return {
      pass: false,
      label: 'Mobile performance',
      detail: 'Not measured: Google PageSpeed Insights returned no Lighthouse mobile performance score.'
    };
  } catch (error: any) {
    console.error('Error fetching mobile performance via PageSpeed API:', error.message);
    return {
      pass: false,
      label: 'Mobile performance',
      detail: `Not measured: Google PageSpeed Insights was unavailable. The server responded in ${responseTimeMs}ms; no performance score was inferred from that timing.`
    };
  }
}
