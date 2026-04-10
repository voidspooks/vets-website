const { expect } = require('chai');
const {
  parseFrontmatter,
  buildPatternFromFrontmatter,
} = require('./generate-form-patterns-catalog');

describe('generate-form-patterns-catalog', () => {
  describe('parseFrontmatter', () => {
    it('parses simple key-value pairs', () => {
      const content = `---
name: Array Builder
maturityCategory: use
maturityLevel: best_practice
---

# Array Builder`;

      const result = parseFrontmatter(content);
      expect(result).to.deep.equal({
        name: 'Array Builder',
        maturityCategory: 'use',
        maturityLevel: 'best_practice',
      });
    });

    it('parses list values', () => {
      const content = `---
name: Prefill
guidanceHref:
  - https://example.com/one
  - https://example.com/two
---`;

      const result = parseFrontmatter(content);
      expect(result.name).to.equal('Prefill');
      expect(result.guidanceHref).to.deep.equal([
        'https://example.com/one',
        'https://example.com/two',
      ]);
    });

    it('returns null when no frontmatter delimiters', () => {
      const content = '# Just a heading\n\nSome text.';
      expect(parseFrontmatter(content)).to.be.null;
    });

    it('handles empty values for keys that start a list', () => {
      const content = `---
name: Test
maturityCategory:
maturityLevel: deployed
---`;

      const result = parseFrontmatter(content);
      expect(result.name).to.equal('Test');
      expect(result).to.not.have.property('maturityCategory');
      expect(result.maturityLevel).to.equal('deployed');
    });

    it('parses slug field from frontmatter', () => {
      const content = `---
slug: my-custom-slug
name: My Pattern
maturityCategory: use
---`;

      const result = parseFrontmatter(content);
      expect(result.slug).to.equal('my-custom-slug');
    });
  });

  describe('buildPatternFromFrontmatter', () => {
    it('uses slug from frontmatter when present', () => {
      const frontmatter = {
        slug: 'custom-slug',
        name: 'My Pattern',
        maturityCategory: 'use',
        maturityLevel: 'deployed',
      };

      const result = buildPatternFromFrontmatter(frontmatter, 'dir-name');
      expect(result.slug).to.equal('custom-slug');
    });

    it('falls back to directory name when slug is missing', () => {
      const frontmatter = {
        name: 'My Pattern',
        maturityCategory: 'use',
        maturityLevel: 'deployed',
      };

      const result = buildPatternFromFrontmatter(frontmatter, 'dir-name');
      expect(result.slug).to.equal('dir-name');
    });

    it('omits maturity when not specified (defaults to use/deployed)', () => {
      const frontmatter = { name: 'Bare Pattern' };

      const result = buildPatternFromFrontmatter(frontmatter, 'bare');
      expect(result).to.not.have.property('maturityCategory');
      expect(result).to.not.have.property('maturityLevel');
    });

    it('omits maturity when explicitly use/deployed', () => {
      const frontmatter = {
        name: 'Stable Pattern',
        maturityCategory: 'use',
        maturityLevel: 'deployed',
      };

      const result = buildPatternFromFrontmatter(frontmatter, 'stable');
      expect(result).to.not.have.property('maturityCategory');
      expect(result).to.not.have.property('maturityLevel');
    });

    it('includes maturity when non-default', () => {
      const frontmatter = {
        name: 'Experimental Pattern',
        maturityCategory: 'caution',
        maturityLevel: 'candidate',
      };

      const result = buildPatternFromFrontmatter(frontmatter, 'experimental');
      expect(result.maturityCategory).to.equal('caution');
      expect(result.maturityLevel).to.equal('candidate');
    });

    it('includes optional fields only when present', () => {
      const frontmatter = {
        name: 'Full Pattern',
        slug: 'full',
        maturityCategory: 'use',
        maturityLevel: 'deployed',
        guidanceHref: 'https://example.com/guidance',
        figmaHref: 'https://figma.com/file/123',
        stagingHref: 'https://staging.example.com',
        mockFormPath: 'src/applications/mock-form',
      };

      const result = buildPatternFromFrontmatter(frontmatter, 'full');
      expect(result.guidanceHref).to.equal('https://example.com/guidance');
      expect(result.figmaHref).to.equal('https://figma.com/file/123');
      expect(result.stagingHref).to.equal('https://staging.example.com');
      expect(result.mockFormPath).to.equal('src/applications/mock-form');
    });

    it('omits optional fields when absent', () => {
      const frontmatter = { name: 'Minimal', maturityCategory: 'use' };

      const result = buildPatternFromFrontmatter(frontmatter, 'minimal');
      expect(result).to.not.have.property('guidanceHref');
      expect(result).to.not.have.property('figmaHref');
      expect(result).to.not.have.property('stagingHref');
      expect(result).to.not.have.property('mockFormPath');
    });

    it('builds correct import and code paths', () => {
      const frontmatter = { name: 'Test', slug: 'test-pattern' };

      const result = buildPatternFromFrontmatter(frontmatter, 'test-pattern');
      expect(result.importPath).to.equal(
        'platform/forms-system/src/js/patterns/test-pattern',
      );
      expect(result.codePaths).to.deep.equal([
        'src/platform/forms-system/src/js/patterns/test-pattern/',
        'src/platform/forms-system/src/js/patterns/test-pattern/README.md',
      ]);
    });
  });
});
