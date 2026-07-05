import * as cheerio from 'cheerio';
import { CheckpointResult } from '../../types';

export function checkJsRenderingAccessibility(html: string): CheckpointResult {
  if (!html) {
    return {
      pass: false,
      label: 'JS Rendering Accessibility',
      detail: '0 words found in server-rendered HTML. No content parsed.'
    };
  }

  const $ = cheerio.load(html);
  
  // Strip non-content blocks for a clean count of actual visible text
  $('script, style, nav, footer, iframe, noscript').remove();
  const bodyText = $('body').text() || '';
  const words = bodyText.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  const pass = wordCount >= 200;
  const detail = pass
    ? `${wordCount} words found in server-rendered HTML. Your page is highly accessible without browser-side JavaScript rendering.`
    : `Only ${wordCount} words found in server-rendered HTML. Under 200 words indicates that your site is a client-side Single Page App (SPA) that blocks AI bots that don't execute JS.`;

  return {
    pass,
    label: 'JS Rendering Accessibility',
    detail
  };
}
