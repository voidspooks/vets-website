/* eslint-disable no-console */
/**
 * Catch form schema keys that silently break when a veteran saves and
 * returns to a form later (save-in-progress / SIP).
 *
 * Here's the problem: form data goes through olive_branch on the backend,
 * which converts keys like this:
 *
 *   camelCase  →  snake_case (on save)  →  camelCase (on return)
 *
 * Most keys survive that round-trip just fine. But two patterns don't:
 *
 *   _isValid    →  _is_valid    →  IsValid       (lost the underscore)
 *   isOutsideUS →  is_outside_us →  isOutsideUs  ("US" became "Us")
 *
 * The veteran's data is still there, but the form can't find it because
 * it's looking for the original key name. So the form looks blank.
 *
 * Note on consecutive capitals: not all of them break. Something like
 * "simulateRTrip" has two caps next to each other (RT), but it survives
 * the round-trip fine because olive_branch splits it cleanly into
 * "simulate_r_trip" and it comes back as "simulateRTrip". The ones that
 * break are cases like "US", "DOB", "API" where the whole acronym gets
 * lowercased and only the first letter comes back capitalized. The script
 * checks the actual round-trip result, so it won't flag false positives —
 * if the key survives, it passes.
 *
 * How to fix:
 *   - Leading underscores: swap to view: prefix  →  view:isValid
 *   - Broken consecutive caps: use standard camelCase →  isOutsideUs
 *
 * This only checks keys inside `schema > properties` blocks, so it won't
 * flag random objects in helper files or unrelated code.
 *
 * Run locally:
 *   CHANGED_FILE_PATHS="src/applications/hca/config/form.js" \
 *     node script/github-actions/check-sip-unsafe-keys.js
 *
 * Or against your current branch diff:
 *   CHANGED_FILE_PATHS=$(git diff --name-only origin/main...HEAD | tr '\n' ' ') \
 *     node script/github-actions/check-sip-unsafe-keys.js
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { execSync } = require('child_process');

const repoRoot = execSync('git rev-parse --show-toplevel', {
  encoding: 'utf8',
  cwd: __dirname,
}).trim();

// -- Allowlist ---------------------------------------------------------------
//
// If there are already keys in the codebase that fail this check, add them
// here so they don't block unrelated PRs. Teams can fix them on their own
// schedule and remove the entry when they do.
//
// See sip-unsafe-keys-allowlist.json for format and instructions.

const ALLOWLIST_PATH = path.join(__dirname, 'sip-unsafe-keys-allowlist.json');

const loadAllowlist = () => {
  try {
    if (fs.existsSync(ALLOWLIST_PATH)) {
      return new Set(
        Object.keys(JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8'))),
      );
    }
  } catch (err) {
    console.warn(`Warning: Could not load allowlist: ${err.message}`);
  }
  return new Set();
};

// -- Round-trip simulation ---------------------------------------------------
//
// This mimics what olive_branch + ActiveSupport do under the hood:
//   1. Turn camelCase into snake_case (what happens when the form saves)
//   2. Turn snake_case back into camelCase (what happens when the form loads)
//
// If the key comes back different, it's going to break.

const simulateRoundTrip = key => {
  const snaked = key
    .replace(/([A-Z\d]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();

  const cameled = snaked.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
  return cameled !== key ? cameled : null;
};

// -- AST scanning ------------------------------------------------------------

// Look at a single key and decide if it's going to cause problems.
const checkKey = (keyName, line) => {
  // view: prefix is the right pattern — no issue here
  if (keyName.startsWith('view:')) return null;

  // Starts with underscore — this will lose the underscore after the round-trip
  if (keyName.startsWith('_')) {
    const stripped = keyName.slice(1);
    return {
      key: keyName,
      line,
      type: 'underscore',
      mutatedTo: simulateRoundTrip(keyName),
      suggestion: `view:${stripped}`,
    };
  }

  // Has consecutive uppercase letters like "US" or "DOB". Not all consecutive
  // caps are a problem — "simulateRTrip" has "RT" next to each other but
  // survives just fine. The regex here is just a quick filter; we run the
  // actual round-trip simulation and only flag it if the key truly changes.
  if (/[A-Z]{2,}/.test(keyName)) {
    const mutated = simulateRoundTrip(keyName);
    if (mutated) {
      return {
        key: keyName,
        line,
        type: 'consecutiveCaps',
        mutatedTo: mutated,
        suggestion: mutated,
      };
    }
  }

  return null;
};

// Pull the key name out of an AST node (either an identifier or a string)
const getKeyName = node => {
  if (node.key.type === 'Identifier' && !node.computed) return node.key.name;
  if (node.key.type === 'StringLiteral') return node.key.value;
  return null;
};

/**
 * Walk through the contents of a `properties` block in a JSON Schema and
 * check every key. Also digs into nested structures:
 *
 *   - Nested objects:  phone.properties._isValid
 *   - Array items:     dependents.items.properties._required
 *   - Combinators:     oneOf / anyOf / allOf containing properties
 */
const walkProperties = (node, violations) => {
  if (!node || node.type !== 'ObjectExpression') return;

  node.properties.forEach(prop => {
    if (prop.type !== 'ObjectProperty') return;

    const keyName = getKeyName(prop);
    if (!keyName) return;

    const line = prop.key.loc?.start?.line ?? '?';
    const violation = checkKey(keyName, line);
    if (violation) {
      violations.push(violation);
    }

    // Keep going deeper if this field has its own nested structure
    if (prop.value && prop.value.type === 'ObjectExpression') {
      prop.value.properties.forEach(child => {
        if (child.type !== 'ObjectProperty') return;
        const childKey = getKeyName(child);

        // Nested object with its own properties
        if (childKey === 'properties') {
          walkProperties(child.value, violations);
        }

        // Array field — check inside items.properties
        if (
          childKey === 'items' &&
          child.value &&
          child.value.type === 'ObjectExpression'
        ) {
          child.value.properties.forEach(itemChild => {
            if (itemChild.type !== 'ObjectProperty') return;
            if (getKeyName(itemChild) === 'properties') {
              walkProperties(itemChild.value, violations);
            }
          });
        }

        // Schema combinators — anyOf, oneOf, allOf can each contain properties
        if (
          (childKey === 'anyOf' ||
            childKey === 'oneOf' ||
            childKey === 'allOf') &&
          child.value &&
          child.value.type === 'ArrayExpression'
        ) {
          child.value.elements.forEach(element => {
            if (element && element.type === 'ObjectExpression') {
              element.properties.forEach(combChild => {
                if (combChild.type !== 'ObjectProperty') return;
                if (getKeyName(combChild) === 'properties') {
                  walkProperties(combChild.value, violations);
                }
              });
            }
          });
        }
      });
    }
  });
};

/**
 * Parse a file and look for SIP-unsafe keys inside schema definitions.
 *
 * We look for any object property called `schema`, then dig into its
 * `properties` block and check every key in there. This keeps us focused
 * on the actual form field definitions and avoids flagging unrelated code.
 */
const scanFile = filePath => {
  let source;
  try {
    source = fs.readFileSync(filePath, 'utf8');
  } catch {
    // File was probably deleted in this PR — that's fine
    return [];
  }

  let ast;
  try {
    ast = parser.parse(source, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'optionalChaining',
        'nullishCoalescingOperator',
        'classProperties',
        'exportDefaultFrom',
        'dynamicImport',
      ],
    });
  } catch {
    // Can't parse this file — the regular build will catch syntax errors
    return [];
  }

  const violations = [];

  traverse(ast, {
    ObjectProperty(astPath) {
      const keyName = getKeyName(astPath.node);
      if (keyName !== 'schema') return;

      const schemaValue = astPath.node.value;
      if (!schemaValue || schemaValue.type !== 'ObjectExpression') return;

      // Found a schema — now look for its `properties` and check those keys
      schemaValue.properties.forEach(prop => {
        if (prop.type !== 'ObjectProperty') return;
        if (getKeyName(prop) === 'properties') {
          walkProperties(prop.value, violations);
        }
      });

      // We already walked everything inside this schema manually
      astPath.skip();
    },
  });

  return violations;
};

// -- File targeting ----------------------------------------------------------
//
// Figure out which files to scan based on what changed in the PR.
// If you changed a page file, we also pull in the app's config/form.js
// since that's where the schemas usually live.

const findFormConfig = filePath => {
  const appPrefix = 'src/applications/';
  if (!filePath.startsWith(appPrefix)) return null;

  // Walk up from the changed file to find the nearest config/form.js
  const relative = filePath.slice(appPrefix.length);
  const parts = relative.split('/');

  for (let depth = parts.length - 1; depth >= 1; depth -= 1) {
    const candidate = path.join(
      repoRoot,
      appPrefix,
      parts.slice(0, depth).join('/'),
      'config/form.js',
    );
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
};

const getFilesToScan = () => {
  const allChanged = (process.env.CHANGED_FILE_PATHS || '')
    .split(/[\s\n]+/)
    .filter(f => /\.(js|jsx|ts|tsx)$/.test(f));

  // Only look at files in areas where schema keys actually get defined.
  // This keeps us from running on every random JS change under src/applications.
  const relevantPatterns = [
    /^src\/applications\/.*\/config\/form\.js$/,
    /^src\/applications\/.*\/chapters\//,
    /^src\/applications\/.*\/pages\//,
    /^src\/platform\/forms-system\/.*\/web-component-fields\//,
    /^src\/platform\/forms-system\/.*\/web-component-patterns\//,
    /^src\/platform\/forms-system\/.*\/patterns\//,
  ];

  const changedFiles = allChanged.filter(f =>
    relevantPatterns.some(pattern => pattern.test(f)),
  );

  const filesToScan = new Set();

  for (const file of changedFiles) {
    const fullPath = path.join(repoRoot, file);
    if (fs.existsSync(fullPath)) {
      filesToScan.add(file);
    }

    // If this is an application file, also grab the form config
    const formConfig = findFormConfig(file);
    if (formConfig) {
      filesToScan.add(path.relative(repoRoot, formConfig));
    }
  }

  return [...filesToScan];
};

// -- Main --------------------------------------------------------------------

const run = () => {
  const filesToScan = getFilesToScan();

  if (filesToScan.length === 0) {
    console.log('No form application files changed. Skipping SIP key check.');
    process.exit(0);
  }

  console.log(`Scanning ${filesToScan.length} file(s) for SIP-unsafe keys:\n`);

  const allowlist = loadAllowlist();
  let totalViolations = 0;
  let allowlistedCount = 0;

  const isAllowlisted = (file, key) => allowlist.has(`${file}::${key}`);

  for (const file of filesToScan) {
    const fullPath = path.join(repoRoot, file);
    const violations = scanFile(fullPath);

    const newViolations = violations.filter(v => !isAllowlisted(file, v.key));
    const skipped = violations.length - newViolations.length;
    allowlistedCount += skipped;

    if (newViolations.length === 0) {
      const suffix = skipped > 0 ? ` (${skipped} allowlisted)` : '';
      console.log(`  ✓ ${file}${suffix}`);
    } else {
      totalViolations += newViolations.length;

      console.error(`  ✗ ${file}`);
      newViolations.forEach(v => {
        console.error(
          `    line ${v.line}: '${v.key}' will come back as '${
            v.mutatedTo
          }' after save-in-progress`,
        );
        console.error(`    fix: rename to '${v.suggestion}'`);
      });
      console.error('');
    }
  }

  if (allowlistedCount > 0) {
    console.log(
      `\n  ${allowlistedCount} known issue(s) skipped (already in the allowlist).`,
    );
  }

  if (totalViolations === 0) {
    console.log('\nAll good — no SIP-unsafe keys found.');
    process.exit(0);
  }

  console.error(
    `\nFound ${totalViolations} key(s) that will break save-in-progress.\n`,
  );
  console.error("What's happening:");
  console.error('  When a veteran saves a form and comes back later, the data');
  console.error(
    '  passes through olive_branch (camelCase → snake_case → camelCase).',
  );
  console.error(
    "  These keys get changed in that process, so the form can't find",
  );
  console.error('  the saved data and the fields look blank.\n');
  console.error('How to fix:');
  console.error('  - Keys starting with underscore: use view: prefix instead');
  console.error('      _isValid  →  view:isValid');
  console.error(
    '  - Keys with consecutive capitals that get mangled: use regular camelCase',
  );
  console.error('      isOutsideUS  →  isOutsideUs');
  console.error('      applicantDOB →  applicantDob');
  console.error('');
  console.error(
    '  Note: not all consecutive caps break. Something like "simulateRTrip"',
  );
  console.error(
    '  has two caps next to each other but round-trips fine. This check only',
  );
  console.error('  flags keys that actually come back different.\n');

  process.exit(1);
};

run();
