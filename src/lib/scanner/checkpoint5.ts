import * as cheerio from 'cheerio';
import { CheckpointResult } from '../../types';

export function checkContentDiscoverability(html: string): CheckpointResult {
  if (!html) {
    return {
      pass: false,
      label: 'Content Discoverability',
      detail: 'No HTML content was available to audit.'
    };
  }

  const $ = cheerio.load(html);
  const failures: string[] = [];

  // 1. Check if <h1> exists
  const h1Count = $('h1').length;
  if (h1Count === 0) {
    failures.push('Missing h1 heading');
  }

  // 2. Check for skipped heading levels
  let maxHeadingLevelFound = 0;
  const headings: number[] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, elem) => {
    const tagName = elem.name || (elem as any).tagName;
    if (tagName) {
      const level = parseInt(tagName.substring(1), 10);
      if (!isNaN(level)) {
        headings.push(level);
      }
    }
  });

  let skippedHeading = false;
  let activeLevel = 0;
  for (const h of headings) {
    if (h > activeLevel + 1 && activeLevel > 0) {
      skippedHeading = true;
      break;
    }
    if (h > activeLevel) {
      activeLevel = h;
    }
  }
  if (skippedHeading) {
    failures.push('Skipped heading hierarchy level (e.g., h3 without h2)');
  }

  // 3. Main or article landmark exists
  const landmarksCount = $('main, article').length;
  if (landmarksCount === 0) {
    failures.push('Missing semantic container (main or article)');
  }

  // 4. At least one list (ul or ol) exists
  const listsCount = $('ul, ol').length;
  if (listsCount === 0) {
    failures.push('Missing structured lists (ul or ol) for grouping content');
  }

  // 5. Image alt tags (allow up to 10% missing)
  const images = $('img');
  const totalImages = images.length;
  let missingAlt = 0;
  images.each((_, elem) => {
    const alt = $(elem).attr('alt');
    if (!alt || alt.trim() === '') {
      missingAlt++;
    }
  });

  const missingAltRatio = totalImages > 0 ? missingAlt / totalImages : 0;
  if (missingAltRatio > 0.1) {
    failures.push(`Too many images missing 'alt' attributes (${missingAlt} of ${totalImages} missing)`);
  }

  const pass = failures.length === 0;
  const detail = pass
    ? 'All content accessibility checks passed: <h1>, clean semantic hierarchy, main containers, list groupings, and high image alt coverage are optimal.'
    : `Failed checks: ${failures.join('; ')}. Fix these to allow search crawlers to scan semantically.`;

  return {
    pass,
    label: 'Content Discoverability',
    detail
  };
}
