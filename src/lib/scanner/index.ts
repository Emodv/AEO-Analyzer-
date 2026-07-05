import { CheckpointResult, ChecksObject, AeoReport } from '../../types';
import { fetchPage } from './fetchPage';
import { checkRobotsTxt } from './checkpoint1';
import { checkSchemaMarkup } from './checkpoint2';
import { checkLlmsTxt } from './checkpoint3';
import { checkAgentPermissions } from './checkpoint4';
import { checkContentDiscoverability } from './checkpoint5';
import { checkJsRenderingAccessibility } from './checkpoint6';
import { checkCoreWebVitals } from './checkpoint7';
import { checkStructuredDataFreshness } from './checkpoint8';
import { GoogleGenAI } from '@google/genai';

export async function runFullAeoScan(domain: string): Promise<Omit<AeoReport, 'id' | 'created_at'>> {
  // Normalize domain
  const normalizedDomain = domain
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .trim()
    .toLowerCase();

  const startTime = Date.now();
  const fetchRes = await fetchPage(normalizedDomain);
  const responseTimeMs = Date.now() - startTime;

  // Run the 8 checkpoints in parallel
  const [
    c1, // Robots.txt
    c2, // Schema Markup
    c3, // llms.txt
    c4, // agent-permissions.json
    c7, // Core Web Vitals
  ] = await Promise.all([
    checkRobotsTxt(normalizedDomain),
    checkSchemaMarkup(normalizedDomain, fetchRes.html),
    checkLlmsTxt(normalizedDomain),
    checkAgentPermissions(normalizedDomain),
    checkCoreWebVitals(normalizedDomain, responseTimeMs),
  ]);

  // Synchronous checks based on homepage HTML
  const c5 = checkContentDiscoverability(fetchRes.html);
  const c6 = checkJsRenderingAccessibility(fetchRes.html);
  const c8 = checkStructuredDataFreshness(fetchRes.html);

  const checks: ChecksObject = {
    checkpoint_1: c1,
    checkpoint_2: c2,
    checkpoint_3: c3,
    checkpoint_4: c4,
    checkpoint_5: c5,
    checkpoint_6: c6,
    checkpoint_7: c7,
    checkpoint_8: c8,
  };

  // Scoring logic
  const passes = Object.values(checks).filter((c) => c.pass).length;
  const score = Math.round(passes * 12.5); // 0–100 (12.5 per checkpoint)
  
  let status: 'AI-Ready' | 'Needs Work' | 'Urgent Action Required' = 'Urgent Action Required';
  if (score >= 85) {
    status = 'AI-Ready';
  } else if (score >= 70) {
    status = 'Needs Work';
  }

  // Generate an executive recommendation
  let aiSummary = '';
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert in Agentic Engine Optimization (AEO).
The website "${normalizedDomain}" was scanned for LLM & AI agent search compatibility.
Scan Results:
- Overall Score: ${score}/100
- Status: ${status}
- Checkpoint 1 (Robots.txt): ${c1.pass ? 'PASS' : 'FAIL'} (${c1.detail})
- Checkpoint 2 (Schema Markup): ${c2.pass ? 'PASS' : 'FAIL'} (${c2.detail})
- Checkpoint 3 (llms.txt): ${c3.pass ? 'PASS' : 'FAIL'} (${c3.detail})
- Checkpoint 4 (agent-permissions.json): ${c4.pass ? 'PASS' : 'FAIL'} (${c4.detail})
- Checkpoint 5 (Semantic Discoverability): ${c5.pass ? 'PASS' : 'FAIL'} (${c5.detail})
- Checkpoint 6 (JS Rendering): ${c6.pass ? 'PASS' : 'FAIL'} (${c6.detail})
- Checkpoint 7 (Performance): ${c7.pass ? 'PASS' : 'FAIL'} (${c7.detail})
- Checkpoint 8 (Schema Freshness): ${c8.pass ? 'PASS' : 'FAIL'} (${c8.detail})

Write a concise, professional, and action-oriented executive AEO audit summary for this website in exactly 3 short sentences. Focus on the single biggest opportunity for improvement.`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      aiSummary = aiResponse.text?.trim() || '';
    } catch (err: any) {
      console.warn('Gemini summary generation warning:', err.message);
    }
  }

  // Fallback to rules-based summary if Gemini is not set up or fails
  if (!aiSummary) {
    const failedLabels = Object.values(checks)
      .filter((c) => !c.pass)
      .map((c) => c.label);
    
    if (score === 100) {
      aiSummary = `Excellent work! ${normalizedDomain} achieves full AEO compliance, boasting modern schema files, unrestricted bot access, and rich semantic formatting. Your content is perfectly indexed and instantly discoverable for modern AI crawlers and LLM search queries. No urgent action is required.`;
    } else {
      aiSummary = `Your website has an AEO score of ${score}/100. It faces challenges with ${failedLabels.slice(0, 2).join(' and ')}, which blocks indexing by modern search assistants like ChatGPT, Claude, and Perplexity. We recommend adding missing LLM directives and repairing structured schema elements to maximize your AI-search visibility.`;
    }
  }

  // Inject recommendation into checks metadata or return it
  // We can attach the recommendation to our response object
  return {
    domain: normalizedDomain,
    score,
    status,
    checks,
    // Store metadata like executive summary inside the scan results
    // We can cast or add property for UI convenience
    ...({ aiSummary } as any)
  };
}
