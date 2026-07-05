import axios from 'axios';
import * as cheerio from 'cheerio';

export interface FetchPageResult {
  html: string;
  wordCount: number;
  text: string;
  error?: string;
}

export async function fetchPage(url: string, attempt = 1): Promise<FetchPageResult> {
  const targetUrl = url.startsWith('http') ? url : `https://${url}`;
  
  try {
    const response = await axios.get(targetUrl, {
      timeout: 5000,
      headers: {
        'User-Agent': 'AEOAnalyzer/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    const html = response.data;
    if (typeof html !== 'string') {
      throw new Error('Response data is not a string');
    }

    const $ = cheerio.load(html);
    
    // Strip script, style, nav, footer tags for accurate word counting
    $('script, style, nav, footer, iframe, noscript').remove();
    const bodyText = $('body').text() || '';
    const cleanText = bodyText.replace(/\s+/g, ' ').trim();
    const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;

    return {
      html,
      wordCount,
      text: cleanText
    };
  } catch (error: any) {
    // Retry once for network/timeout errors, but not for 4xx/5xx errors
    const isNetworkError = !error.response;
    if (attempt === 1 && isNetworkError) {
      console.warn(`Fetch failed for ${targetUrl}, retrying...`, error.message);
      return fetchPage(targetUrl, 2);
    }

    console.error(`Fetch error for ${targetUrl}:`, error.message);
    return {
      html: '',
      wordCount: 0,
      text: '',
      error: error.message || 'Could not reach domain'
    };
  }
}
