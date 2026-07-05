import axios from 'axios';
import robotsParser from 'robots-parser';
import { CheckpointResult } from '../../types';

export async function checkRobotsTxt(domain: string): Promise<CheckpointResult> {
  const robotsUrl = `https://${domain}/robots.txt`;
  
  try {
    const response = await axios.get(robotsUrl, {
      timeout: 5000,
      headers: { 'User-Agent': 'AEOAnalyzer/1.0' },
      validateStatus: () => true, // Handle any status without throwing
    });

    if (response.status === 404) {
      return {
        pass: true,
        label: 'Robots.txt & AI Crawler Access',
        detail: 'Robots.txt not found (404). Access is open by default to all AI bots.'
      };
    }

    if (response.status >= 400 && response.status !== 404) {
      return {
        pass: true,
        label: 'Robots.txt & AI Crawler Access',
        detail: `Robots.txt returned status ${response.status}. Treated as open by default.`
      };
    }

    const content = typeof response.data === 'string' ? response.data : '';
    const robotsObj = robotsParser(robotsUrl, content);
    
    const targetAgents = ['anthropic-ai', 'GPTBot', 'PerplexityBot', 'Google-Extended', 'CCBot'];
    const blockedAgents: string[] = [];

    for (const agent of targetAgents) {
      // Check if disallowed at root path
      const isAllowed = robotsObj.isAllowed(`https://${domain}/`, agent);
      if (isAllowed === false) {
        blockedAgents.push(agent);
      }
    }

    if (blockedAgents.length > 0) {
      return {
        pass: false,
        label: 'Robots.txt & AI Crawler Access',
        detail: `Blocked AI agents: ${blockedAgents.join(', ')}. AI engines cannot access your site's content.`
      };
    }

    return {
      pass: true,
      label: 'Robots.txt & AI Crawler Access',
      detail: 'All major AI search and LLM crawlers are fully permitted in robots.txt.'
    };
  } catch (error: any) {
    console.error('Error checking robots.txt:', error.message);
    return {
      pass: true, // Fail-safe default is pass (open)
      label: 'Robots.txt & AI Crawler Access',
      detail: `Check completed with warnings: robots.txt inaccessible (${error.message}). Treated as open.`
    };
  }
}
