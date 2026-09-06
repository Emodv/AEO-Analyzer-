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
import { calculateAeoScore, getAeoStatus } from './scoring';
import { GoogleGenAI } from '@google/genai';

export async function runFullAeoScan(domain: string): Promise<Omit<AeoReport, 'id' | 'created_at'>> {
  const normalizedDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim().toLowerCase();
  const startTime = Date.now();
  const fetchRes = await fetchPage(normalizedDomain);
  const responseTimeMs = Date.now() - startTime;

  const [c1, c2, c3, c4, c7] = await Promise.all([
    checkRobotsTxt(normalizedDomain),
    checkSchemaMarkup(normalizedDomain, fetchRes.html),
    checkLlmsTxt(normalizedDomain),
    checkAgentPermissions(normalizedDomain),
    checkCoreWebVitals(normalizedDomain, responseTimeMs),
  ]);

  const c5 = checkContentDiscoverability(fetchRes.html);
  const c6 = checkJsRenderingAccessibility(fetchRes.html);
  const c8 = checkStructuredDataFreshness(fetchRes.html);

  const checks: ChecksObject = {
    checkpoint_1: c1, checkpoint_2: c2, checkpoint_3: c3, checkpoint_4: c4,
    checkpoint_5: c5, checkpoint_6: c6, checkpoint_7: c7, checkpoint_8: c8,
  };

  // Evidence-weighted scoring: established retrieval fundamentals matter most;
  // emerging/experimental conventions cannot tank an otherwise accessible site.
  const score = calculateAeoScore(checks);
  const status = getAeoStatus(score);

  let aiSummary = '';
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert in AI search visibility and machine-readable web architecture.\nThe website "${normalizedDomain}" was scanned for AI retrieval compatibility.\nOverall Score: ${score}/100 (${status}).\nRobots/crawler access: ${c1.pass ? 'PASS' : 'FAIL'} (${c1.detail})\nSchema markup: ${c2.pass ? 'PASS' : 'FAIL'} (${c2.detail})\nllms.txt (emerging optional convention; low scoring weight): ${c3.pass ? 'PASS' : 'MISSING/FAIL'} (${c3.detail})\nAgent action-policy manifest (experimental; informational only, zero scoring weight): ${c4.pass ? 'FOUND' : 'NOT FOUND'} (${c4.detail})\nSemantic discoverability: ${c5.pass ? 'PASS' : 'FAIL'} (${c5.detail})\nJS/server-rendered accessibility: ${c6.pass ? 'PASS' : 'FAIL'} (${c6.detail})\nPerformance: ${c7.pass ? 'PASS' : 'FAIL'} (${c7.detail})\nSchema freshness: ${c8.pass ? 'PASS' : 'FAIL'} (${c8.detail})\n\nWrite exactly 3 short, professional, action-oriented sentences. Do not claim that llms.txt or an agent-permissions manifest is a confirmed ranking factor or is required by major AI engines. Focus on the highest-weight failed retrieval fundamental first.`;
      const aiResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      aiSummary = aiResponse.text?.trim() || '';
    } catch (err: any) {
      console.warn('Gemini summary generation warning:', err.message);
    }
  }

  if (!aiSummary) {
    const coreFailures = [c1, c2, c5, c6, c7, c8].filter(c => !c.pass).map(c => c.label);
    if (coreFailures.length === 0) {
      aiSummary = `${normalizedDomain} scores ${score}/100 on this AI-readiness diagnostic and passes the core crawlability, structured-data, content-accessibility, and performance checks. Emerging conventions such as llms.txt are treated as optional signals rather than confirmed ranking factors. Continue monitoring crawler access and structured content quality as the AI discovery ecosystem evolves.`;
    } else {
      aiSummary = `${normalizedDomain} scores ${score}/100 on this AI-readiness diagnostic. The highest-priority issues are ${coreFailures.slice(0, 2).join(' and ')}, because accessible, structured content is foundational to machine retrieval. Fix these core issues before investing heavily in experimental AI-specific files or directives.`;
    }
  }

  return { domain: normalizedDomain, score, status, checks, ...({ aiSummary } as any) };
}
