const { expect } = require('chai');
const {
  extractJSDocTag,
  extractDescriptionFromJSDocs,
  getCategoryFromFilename,
  getPatternBaseName,
  getPatternTypeFromName,
  getJavaScriptType,
  extractExportsFromFile,
  combinePatterns,
} = require('./generate-web-component-patterns-catalog');

// Helper to create a comment node matching Babel's AST shape
const makeComment = value => [{ value }];

describe('generate-web-component-patterns-catalog', () => {
  describe('extractJSDocTag', () => {
    it('extracts a tag value', () => {
      const comments = makeComment(`*
 * Some description
 * @maturityCategory use
 * @maturityLevel deployed
 `);
      expect(extractJSDocTag(comments, 'maturityCategory')).to.equal('use');
      expect(extractJSDocTag(comments, 'maturityLevel')).to.equal('deployed');
    });

    it('returns null when tag is missing', () => {
      const comments = makeComment(`*
 * Just a description
 `);
      expect(extractJSDocTag(comments, 'maturityCategory')).to.be.null;
    });

    it('returns null for empty comments', () => {
      expect(extractJSDocTag(null, 'maturityCategory')).to.be.null;
      expect(extractJSDocTag([], 'maturityCategory')).to.be.null;
    });

    it('handles tag at end of comment without trailing asterisk', () => {
      const comments = makeComment(`*
 * Description
 * @maturityCategory caution`);
      expect(extractJSDocTag(comments, 'maturityCategory')).to.equal('caution');
    });

    it('stops at next tag', () => {
      const comments = makeComment(`*
 * @maturityCategory use
 * @maturityLevel deployed`);
      expect(extractJSDocTag(comments, 'maturityCategory')).to.equal('use');
    });
  });

  describe('extractDescriptionFromJSDocs', () => {
    it('extracts the first content line', () => {
      const comments = makeComment(`*
 * uiSchema for address
 * @maturityCategory use
 `);
      expect(extractDescriptionFromJSDocs(comments)).to.equal(
        'uiSchema for address',
      );
    });

    it('ignores tag lines', () => {
      const comments = makeComment(`*
 * @returns {Object} schema
 `);
      expect(extractDescriptionFromJSDocs(comments)).to.be.null;
    });

    it('returns null for empty comments', () => {
      expect(extractDescriptionFromJSDocs(null)).to.be.null;
    });
  });

  describe('getCategoryFromFilename', () => {
    it('converts pattern filename to category', () => {
      expect(getCategoryFromFilename('addressPattern.jsx')).to.equal('Address');
      expect(getCategoryFromFilename('fullNamePattern.js')).to.equal(
        'FullName',
      );
      expect(getCategoryFromFilename('yesNoPattern.jsx')).to.equal('YesNo');
    });

    it('handles deprecated suffix', () => {
      expect(getCategoryFromFilename('addressDeprecatedPattern.jsx')).to.equal(
        'AddressDeprecated',
      );
    });

    it('handles multiple-word filenames with hyphens', () => {
      expect(getCategoryFromFilename('file-input-pattern.jsx')).to.equal(
        'File input',
      );
    });
  });

  describe('getPatternBaseName', () => {
    it('strips UI suffix', () => {
      expect(getPatternBaseName('addressUI')).to.equal('address');
    });

    it('strips Schema suffix', () => {
      expect(getPatternBaseName('addressSchema')).to.equal('address');
    });

    it('leaves names without suffix unchanged', () => {
      expect(getPatternBaseName('address')).to.equal('address');
    });
  });

  describe('getPatternTypeFromName', () => {
    it('identifies uiSchema', () => {
      expect(getPatternTypeFromName('addressUI')).to.equal('uiSchema');
    });

    it('identifies schema', () => {
      expect(getPatternTypeFromName('addressSchema')).to.equal('schema');
    });

    it('returns unknown for other names', () => {
      expect(getPatternTypeFromName('address')).to.equal('unknown');
    });
  });

  describe('getJavaScriptType', () => {
    it('identifies function declarations', () => {
      expect(getJavaScriptType({ type: 'FunctionDeclaration' })).to.equal(
        'function',
      );
    });

    it('identifies arrow functions', () => {
      expect(
        getJavaScriptType(null, { type: 'ArrowFunctionExpression' }),
      ).to.equal('function');
    });

    it('identifies classes', () => {
      expect(getJavaScriptType({ type: 'ClassDeclaration' })).to.equal('class');
    });

    it('defaults to object', () => {
      expect(getJavaScriptType(null, null)).to.equal('object');
    });
  });

  describe('extractExportsFromFile', () => {
    it('extracts exported function with JSDoc maturity tags', () => {
      const source = `
/**
 * uiSchema for text input
 * @maturityCategory use
 * @maturityLevel deployed
 * @returns {Object}
 */
export const textUI = (title) => ({ 'ui:title': title });

export const textSchema = { type: 'string' };
`;
      const exports = extractExportsFromFile(source);

      const uiExport = exports.find(e => e.name === 'textUI');
      expect(uiExport).to.exist;
      expect(uiExport.maturityCategory).to.equal('use');
      expect(uiExport.maturityLevel).to.equal('deployed');
      expect(uiExport.patternType).to.equal('uiSchema');
      expect(uiExport.jsType).to.equal('function');

      const schemaExport = exports.find(e => e.name === 'textSchema');
      expect(schemaExport).to.exist;
      expect(schemaExport.patternType).to.equal('schema');
    });

    it('filters out exports without UI or Schema in name', () => {
      const source = `
export const helperFunction = () => {};
export const textUI = () => ({});
`;
      const exports = extractExportsFromFile(source);
      expect(exports).to.have.length(1);
      expect(exports[0].name).to.equal('textUI');
    });

    it('handles re-exports via specifiers', () => {
      const source = `
/**
 * uiSchema for phone
 * @maturityCategory use
 * @maturityLevel deployed
 */
const phoneUI = () => ({});
const phoneSchema = { type: 'string' };

export { phoneUI, phoneSchema };
`;
      const exports = extractExportsFromFile(source);
      expect(exports).to.have.length(2);

      const ui = exports.find(e => e.name === 'phoneUI');
      expect(ui.maturityCategory).to.equal('use');
    });
  });

  describe('combinePatterns', () => {
    it('combines uiSchema and schema into one entry, omitting default maturity', () => {
      const patterns = [
        {
          name: 'textUI',
          category: 'Text',
          patternType: 'uiSchema',
          jsType: 'function',
          description: 'uiSchema for text',
          maturityCategory: 'use',
          maturityLevel: 'deployed',
        },
        {
          name: 'textSchema',
          category: 'Text',
          patternType: 'schema',
          jsType: 'object',
          description: 'schema for text',
          maturityCategory: null,
          maturityLevel: null,
        },
      ];

      const combined = combinePatterns(patterns);
      expect(combined.size).to.equal(1);

      const entry = combined.values().next().value;
      expect(entry.uiSchema).to.equal('textUI');
      expect(entry.schema).to.equal('textSchema');
      // use/deployed is the default, so maturity fields should be omitted
      expect(entry).to.not.have.property('maturityCategory');
      expect(entry).to.not.have.property('maturityLevel');
    });

    it('includes non-default maturity', () => {
      const patterns = [
        {
          name: 'oldUI',
          category: 'Old',
          patternType: 'uiSchema',
          jsType: 'function',
          description: null,
          maturityCategory: "don't use",
          maturityLevel: 'deprecated',
        },
        {
          name: 'oldSchema',
          category: 'Old',
          patternType: 'schema',
          jsType: 'object',
          description: null,
          maturityCategory: null,
          maturityLevel: null,
        },
      ];

      const combined = combinePatterns(patterns);
      const entry = combined.values().next().value;
      expect(entry.maturityCategory).to.equal("don't use");
      expect(entry.maturityLevel).to.equal('deprecated');
    });

    it('prefers uiSchema maturity over schema maturity', () => {
      const patterns = [
        {
          name: 'testUI',
          category: 'Test',
          patternType: 'uiSchema',
          jsType: 'function',
          description: null,
          maturityCategory: "don't use",
          maturityLevel: 'deprecated',
        },
        {
          name: 'testSchema',
          category: 'Test',
          patternType: 'schema',
          jsType: 'object',
          description: null,
          maturityCategory: 'caution',
          maturityLevel: 'candidate',
        },
      ];

      const combined = combinePatterns(patterns);
      const entry = combined.values().next().value;
      expect(entry.maturityCategory).to.equal("don't use");
      expect(entry.maturityLevel).to.equal('deprecated');
    });

    it('handles schema-only patterns without maturity', () => {
      const patterns = [
        {
          name: 'checkboxRequiredSchema',
          category: 'Checkbox',
          patternType: 'schema',
          jsType: 'object',
          description: null,
          maturityCategory: null,
          maturityLevel: null,
        },
      ];

      const combined = combinePatterns(patterns);
      const entry = combined.values().next().value;
      expect(entry.uiSchema).to.be.null;
      expect(entry.schema).to.equal('checkboxRequiredSchema');
      expect(entry).to.not.have.property('maturityCategory');
      expect(entry).to.not.have.property('maturityLevel');
    });
  });
});
