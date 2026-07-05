import { checkContentDiscoverability } from '../lib/scanner/checkpoint5';
import { checkJsRenderingAccessibility } from '../lib/scanner/checkpoint6';
import { checkStructuredDataFreshness } from '../lib/scanner/checkpoint8';

describe('AEO Checkpoints Logic', () => {
  // Checkpoint 6: JS Rendering wordcount evaluation
  describe('Checkpoint 6 - JS Rendering Accessibility', () => {
    it('should PASS when raw server text contains 200 or more words', () => {
      // Mock page with 210 words
      const words = Array(210).fill('word').join(' ');
      const html = `<html><body><main>${words}</main></body></html>`;
      const result = checkJsRenderingAccessibility(html);
      
      expect(result.pass).toBe(true);
      expect(result.detail).toContain('210 words found');
    });

    it('should FAIL when raw server text contains fewer than 200 words', () => {
      // Mock page with 50 words
      const words = Array(50).fill('word').join(' ');
      const html = `<html><body><main>${words}</main></body></html>`;
      const result = checkJsRenderingAccessibility(html);
      
      expect(result.pass).toBe(false);
      expect(result.detail).toContain('Only 50 words found');
    });
  });

  // Checkpoint 5: Content discoverability semantic elements
  describe('Checkpoint 5 - Content Discoverability', () => {
    it('should PASS when all semantic constraints are met', () => {
      const html = `
        <html>
          <body>
            <main>
              <h1>Our Landing Page</h1>
              <h2>Feature One</h2>
              <ul>
                <li>Bullet item</li>
              </ul>
              <img src="pic.png" alt="A nice features diagram" />
            </main>
          </body>
        </html>
      `;
      const result = checkContentDiscoverability(html);
      expect(result.pass).toBe(true);
    });

    it('should FAIL if h1 heading is missing', () => {
      const html = `
        <html>
          <body>
            <main>
              <h2>No H1 present here</h2>
              <ul>
                <li>Item</li>
              </ul>
              <img src="pic.png" alt="Valid alt tag" />
            </main>
          </body>
        </html>
      `;
      const result = checkContentDiscoverability(html);
      expect(result.pass).toBe(false);
      expect(result.detail).toContain('Missing h1 heading');
    });
  });

  // Checkpoint 8: Structured Schema Freshness
  describe('Checkpoint 8 - Structured Data Freshness', () => {
    it('should FAIL if there are no structured JSON-LD scripts at all', () => {
      const html = `<html><body><p>No schemas</p></body></html>`;
      const result = checkStructuredDataFreshness(html);
      expect(result.pass).toBe(false);
      expect(result.detail).toContain('No JSON-LD schemas found');
    });

    it('should check for valid parsed schema structure', () => {
      const html = `
        <html>
          <body>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "AEO Guide",
                "author": { "@type": "Person", "name": "Expert" }
              }
            </script>
          </body>
        </html>
      `;
      const result = checkStructuredDataFreshness(html);
      expect(result.pass).toBe(true);
      expect(result.detail).toContain('parsed successfully');
    });
  });
});
