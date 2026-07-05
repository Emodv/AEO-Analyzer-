import axios from 'axios';
import * as cheerio from 'cheerio';
import { CheckpointResult } from '../../types';
import { fetchPage } from './fetchPage';

export async function checkSchemaMarkup(domain: string, homepageHtml: string): Promise<CheckpointResult> {
  const pagesToCheck: string[] = [`https://${domain}`];
  
  try {
    // Attempt sitemap.xml
    const sitemapUrl = `https://${domain}/sitemap.xml`;
    const sitemapResponse = await axios.get(sitemapUrl, {
      timeout: 4000,
      headers: { 'User-Agent': 'AEOAnalyzer/1.0' },
      validateStatus: (status) => status === 200
    }).catch(() => null);

    if (sitemapResponse && typeof sitemapResponse.data === 'string') {
      const sitemapContent = sitemapResponse.data;
      // Match all <loc>URLs</loc>
      const locRegex = <RegExp>/<loc>([^<]+)<\/loc>/g;
      let match;
      const foundUrls: string[] = [];
      while ((match = locRegex.exec(sitemapContent)) !== null) {
        const foundUrl = match[1].trim();
        if (foundUrl && foundUrl !== `https://${domain}` && foundUrl !== `https://${domain}/` && !foundUrl.includes('.xml')) {
          foundUrls.push(foundUrl);
        }
      }

      // Add up to 3 non-homepage URLs to our pagesToCheck
      const additionalUrls = foundUrls.slice(0, 3);
      pagesToCheck.push(...additionalUrls);
    }
  } catch (err: any) {
    console.warn('Sitemap lookup warning:', err.message);
  }

  let pagesWithSchema = 0;
  const targetTypes = ['Product', 'Organization', 'Article', 'Review', 'FAQPage', 'HowTo', 'LocalBusiness', 'WebSite', 'BreadcrumbList'];
  const checkedPagesInfo: { url: string; hasSchema: boolean }[] = [];

  // Inspect each page for script application/ld+json blocks
  for (const pageUrl of pagesToCheck) {
    try {
      let html = '';
      if (pageUrl === `https://${domain}` && homepageHtml) {
        html = homepageHtml;
      } else {
        const fetchRes = await fetchPage(pageUrl);
        html = fetchRes.html;
      }

      if (!html) {
        checkedPagesInfo.push({ url: pageUrl, hasSchema: false });
        continue;
      }

      const $ = cheerio.load(html);
      let hasQualifyingSchema = false;

      $('script[type="application/ld+json"]').each((_, elem) => {
        try {
          const jsonText = $(elem).html() || '';
          const cleanJsonText = jsonText.replace(/\/\/[\s\S]*?\n/g, '').trim(); // strip inline double-slash comments
          const parsed = JSON.parse(cleanJsonText);
          
          // Traverse single schema object or list of graphs
          const schemas = Array.isArray(parsed) ? parsed : (parsed['@graph'] ? parsed['@graph'] : [parsed]);
          
          for (const item of schemas) {
            const type = item['@type'];
            if (type) {
              const types = Array.isArray(type) ? type : [type];
              if (types.some((t: string) => targetTypes.some(target => typeof t === 'string' && t.toLowerCase() === target.toLowerCase()))) {
                hasQualifyingSchema = true;
                break;
              }
            }
          }
        } catch (e) {
          // Parse error, ignore this block
        }
      });

      if (hasQualifyingSchema) {
        pagesWithSchema++;
      }
      checkedPagesInfo.push({ url: pageUrl, hasSchema: hasQualifyingSchema });
    } catch (e: any) {
      checkedPagesInfo.push({ url: pageUrl, hasSchema: false });
    }
  }

  const pass = pagesWithSchema >= Math.ceil(pagesToCheck.length / 2);
  const detail = `${pagesWithSchema} of ${pagesToCheck.length} pages checked contain qualifying JSON-LD schema markup (${pagesToCheck.length > 1 ? 'including sitemap entries' : 'homepage only'}).`;

  return {
    pass,
    label: 'Schema Markup Coverage',
    detail
  };
}
