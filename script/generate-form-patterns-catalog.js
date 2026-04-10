/* eslint-disable no-console */

/**
 * Script to generate a catalog of form patterns by reading YAML
 * frontmatter from README.md files in the patterns directory.
 *
 * Scans: src/platform/forms-system/src/js/patterns/{pattern}/README.md
 * Output: src/platform/forms-system/src/js/patterns/form-patterns-catalog.json
 *
 * Expected frontmatter format:
 *   ---
 *   slug: array-builder
 *   name: Array Builder
 *   maturityCategory: use          # optional, omit for default (use/best_practice)
 *   maturityLevel: best_practice   # optional, omit for default
 *   guidanceHref: https://...      # optional, string or list
 *   figmaHref: https://...         # optional
 *   stagingHref: https://...       # optional
 *   mockFormPath: src/apps/...     # optional
 *   ---
 *
 * Maturity scale: https://design.va.gov/about/maturity-scale
 */

const fs = require('fs');
const path = require('path');

const patternsDir = path.join(
  __dirname,
  '../src/platform/forms-system/src/js/patterns',
);
const catalogPath = path.join(patternsDir, 'form-patterns-catalog.json');

const DEFAULT_MATURITY_CATEGORY = 'use';
const DEFAULT_MATURITY_LEVEL = 'deployed';

const parseFrontmatter = content => {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const data = {};

  let currentKey = null;
  let currentList = null;

  yaml.split('\n').forEach(line => {
    // List item
    const listMatch = line.match(/^\s+-\s+(.+)/);
    if (listMatch && currentKey) {
      if (!currentList) {
        currentList = [];
      }
      currentList.push(listMatch[1].trim());
      data[currentKey] = currentList;
      return;
    }

    // Key-value pair
    const kvMatch = line.match(/^(\w+):\s*(.*)/);
    if (kvMatch) {
      // Save previous list if any
      [, currentKey] = kvMatch;
      const value = kvMatch[2].trim();
      currentList = null;

      if (value) {
        data[currentKey] = value;
      }
    }
  });

  return data;
};

const buildPatternFromFrontmatter = (frontmatter, dir) => {
  const importPath = `platform/forms-system/src/js/patterns/${dir}`;
  const codePath = `src/platform/forms-system/src/js/patterns/${dir}/`;
  const readmeCodePath = `src/platform/forms-system/src/js/patterns/${dir}/README.md`;

  const pattern = {
    slug: frontmatter.slug || dir,
    name: frontmatter.name,
    importPath,
    codePaths: [codePath, readmeCodePath],
  };

  // Only include maturity when it differs from the default (use/deployed)
  const isDefault =
    !frontmatter.maturityCategory ||
    (frontmatter.maturityCategory === DEFAULT_MATURITY_CATEGORY &&
      (!frontmatter.maturityLevel ||
        frontmatter.maturityLevel === DEFAULT_MATURITY_LEVEL));
  if (!isDefault) {
    pattern.maturityCategory = frontmatter.maturityCategory;
    if (frontmatter.maturityLevel) {
      pattern.maturityLevel = frontmatter.maturityLevel;
    }
  }

  if (frontmatter.guidanceHref) {
    pattern.guidanceHref = frontmatter.guidanceHref;
  }
  if (frontmatter.figmaHref) {
    pattern.figmaHref = frontmatter.figmaHref;
  }
  if (frontmatter.stagingHref) {
    pattern.stagingHref = frontmatter.stagingHref;
  }
  if (frontmatter.mockFormPath) {
    pattern.mockFormPath = frontmatter.mockFormPath;
  }

  return pattern;
};

const generateCatalog = (sourceDir = patternsDir) => {
  const dirs = fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const patterns = [];

  dirs.forEach(dirName => {
    const readmePath = path.join(sourceDir, dirName, 'README.md');
    if (!fs.existsSync(readmePath)) return;

    const content = fs.readFileSync(readmePath, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter || !frontmatter.name) return;

    patterns.push(buildPatternFromFrontmatter(frontmatter, dirName));
  });

  return {
    title: 'VA.gov Form Patterns Catalog',
    description:
      'Catalog of page-level form patterns for VA.gov applications. Auto-generated from YAML frontmatter in each pattern README.md.',
    maturityScale: 'https://design.va.gov/about/maturity-scale',
    totalPatterns: patterns.length,
    patterns: patterns.sort((a, b) => a.name.localeCompare(b.name)),
  };
};

if (require.main === module) {
  const catalog = generateCatalog();

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

  console.log('form-patterns-catalog.json has been generated successfully.');
  console.log(`Total patterns: ${catalog.totalPatterns}`);
}

module.exports = {
  parseFrontmatter,
  buildPatternFromFrontmatter,
  generateCatalog,
};
