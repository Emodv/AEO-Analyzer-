import axios from 'axios';
import { CheckpointResult } from '../../types';

export async function checkCoreWebVitals(domain: string, responseTimeMs: number): Promise<CheckpointResult> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const targetUrl = `https://${domain}`;
  
  if (!apiKey) {
    // Elegant fallback: Calculate a realistic score based on responseTimeMs
    // 0ms - 200ms -> score 0.95 - 1.00
    // 200ms - 800ms -> score 0.75 - 0.94
    // 800ms - 2000ms -> score 0.50 - 0.74
    // > 2000ms -> score < 0.50
    let simulatedScore = 0.85;
    if (responseTimeMs < 200) {
      simulatedScore = 0.95 + Math.random() * 0.04;
    } else if (responseTimeMs < 800) {
      simulatedScore = 0.75 + ((800 - responseTimeMs) / 600) * 0.19;
    } else if (responseTimeMs < 2000) {
      simulatedScore = 0.50 + ((2000 - responseTimeMs) / 1200) * 0.24;
    } else {
      simulatedScore = Math.max(0.1, 0.50 - (responseTimeMs / 5000) * 0.4);
    }
    
    simulatedScore = Math.round(simulatedScore * 100) / 100;
    const pass = simulatedScore >= 0.75;

    return {
      pass,
      label: 'Core Web Vitals',
      detail: `Performance score: ${simulatedScore} (Simulated mobile score based on domain response time of ${responseTimeMs}ms. Configure PageSpeed API Key for real device tests).`
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
        label: 'Core Web Vitals',
        detail: `Performance score: ${performanceScore.toFixed(2)} (Google mobile report).`
      };
    }
    
    throw new Error('Response did not contain performance category');
  } catch (error: any) {
    console.error('Error fetching Core Web Vitals via PageSpeed API:', error.message);
    
    // Graceful fallback to responseTime calculation on API error
    let simulatedScore = 0.65;
    if (responseTimeMs < 500) simulatedScore = 0.82;
    const pass = simulatedScore >= 0.75;
    
    return {
      pass,
      label: 'Core Web Vitals',
      detail: `Performance score: ${simulatedScore} (API request failed, fallback calculation based on speed response time of ${responseTimeMs}ms).`
    };
  }
}
