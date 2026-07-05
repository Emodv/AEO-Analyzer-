import * as cheerio from 'cheerio';
import { CheckpointResult } from '../../types';

export function checkStructuredDataFreshness(html: string): CheckpointResult {
  if (!html) {
    return {
      pass: false,
      label: 'Structured Data Freshness',
      detail: '0 of 0 schemas valid, 0 deprecated properties found (No content).'
    };
  }

  const $ = cheerio.load(html);
  const jsonLdBlocks: string[] = [];

  $('script[type="application/ld+json"]').each((_, elem) => {
    const text = $(elem).html();
    if (text) {
      jsonLdBlocks.push(text);
    }
  });

  if (jsonLdBlocks.length === 0) {
    return {
      pass: false,
      label: 'Structured Data Freshness',
      detail: 'No JSON-LD schemas found on homepage to evaluate freshness. Add valid structured data.'
    };
  }

  let validCount = 0;
  let deprecatedCount = 0;
  const deprecatedIssues: string[] = [];

  for (const block of jsonLdBlocks) {
    try {
      const cleanBlock = block.replace(/\/\/[\s\S]*?\n/g, '').trim(); // remove comment lines
      const parsed = JSON.parse(cleanBlock);
      validCount++;

      // Deep search for properties
      const inspectObject = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;

        if (Array.isArray(obj)) {
          obj.forEach(inspectObject);
          return;
        }

        // 1. Check for 'creator' instead of 'author'
        if ('creator' in obj && obj['@type'] === 'Article') {
          deprecatedCount++;
          deprecatedIssues.push("Use 'author' instead of 'creator' for Articles");
        }

        // 2. Check for dateCreated without dateModified in articles
        if (obj['@type'] === 'Article' || obj['@type'] === 'BlogPosting') {
          if ('dateCreated' in obj && !('dateModified' in obj)) {
            deprecatedCount++;
            deprecatedIssues.push("Specify 'dateModified' alongside 'dateCreated'");
          }
        }

        // 3. Check for image as raw string in complex types
        if ('image' in obj && typeof obj.image === 'string' && (obj['@type'] === 'Product' || obj['@type'] === 'LocalBusiness')) {
          deprecatedCount++;
          deprecatedIssues.push("Prefer ImageObject structure over simple string URL for 'image'");
        }

        // Recurse
        Object.keys(obj).forEach(key => {
          inspectObject(obj[key]);
        });
      };

      inspectObject(parsed);
    } catch (err) {
      // JSON parse failure
    }
  }

  const parseSuccessRate = jsonLdBlocks.length > 0 ? validCount / jsonLdBlocks.length : 0;
  const hasTooManyDeprecated = deprecatedCount > 0;
  
  // PASS: At least 90% of schemas are valid JSON AND no severe deprecated properties
  const pass = parseSuccessRate >= 0.90 && !hasTooManyDeprecated;

  let detail = `${validCount} of ${jsonLdBlocks.length} schema blocks parsed successfully as valid JSON.`;
  if (deprecatedCount > 0) {
    detail += ` Found ${deprecatedCount} deprecated schema properties (${Array.from(new Set(deprecatedIssues)).join(', ')}).`;
  } else if (validCount > 0) {
    detail += ' All schemas are well-formed and up-to-date with modern Schema.org recommendations.';
  }

  return {
    pass,
    label: 'Structured Data Freshness',
    detail
  };
}
