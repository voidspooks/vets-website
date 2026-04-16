import { expect } from 'chai';
import sinon from 'sinon';
import {
  parseISODate,
  formatISOPartialDate,
  hasFieldsOtherThanArray,
  transformForSubmit,
  getArrayFields,
  setArrayRecordTouched,
  getNonArraySchema,
  checkValidSchema,
  formatReviewDate,
  expandArrayPages,
  omitRequired,
  showReviewField,
  stringifyUrlParams,
  getUrlPathIndex,
  convertUrlPathToPageConfigPath,
  getPageProperties,
  getActivePageProperties,
  deleteNestedProperty,
  filterInactiveNestedPageData,
  createFormPageList,
  isActivePage,
} from '../../src/js/helpers';

describe('Schemaform helpers:', () => {
  describe('parseISODate', () => {
    it('should parse an ISO date', () => {
      expect(parseISODate('2001-02-03')).to.eql({
        month: '2',
        day: '3',
        year: '2001',
      });
    });
    it('should parse a partial ISO date', () => {
      expect(parseISODate('XXXX-02-03')).to.eql({
        month: '2',
        day: '3',
        year: '',
      });
      expect(parseISODate('2003-XX-03')).to.eql({
        month: '',
        day: '3',
        year: '2003',
      });
      expect(parseISODate('2003-02-XX')).to.eql({
        month: '2',
        day: null,
        year: '2003',
      });
      expect(parseISODate('2003-02')).to.eql({
        month: '2',
        day: null,
        year: '2003',
      });
      expect(parseISODate('2003')).to.eql({
        month: '',
        day: null,
        year: '2003',
      });
    });
  });
  describe('formatISOPartialDate', () => {
    it('should format a regular date', () => {
      const date = {
        month: '3',
        day: '29',
        year: '2005',
      };
      expect(formatISOPartialDate(date)).to.equal('2005-03-29');
    });
    it('should format a partial date', () => {
      const date = {
        month: '2',
        day: '',
        year: '2005',
      };
      expect(formatISOPartialDate(date)).to.equal('2005-02-XX');
    });
    it('should format an empty date as undefined', () => {
      const date = {
        month: '',
        day: '',
        year: '',
      };
      expect(formatISOPartialDate(date)).to.be.undefined;
    });
  });
  describe('hasFieldsOtherThanArray', () => {
    it('should return true if non-array fields', () => {
      const schema = {
        type: 'object',
        properties: {
          test: {
            type: 'array',
          },
          test2: {
            type: 'string',
          },
        },
      };

      expect(hasFieldsOtherThanArray(schema)).to.be.true;
    });
    it('should return true if nested non-array fields', () => {
      const schema = {
        type: 'object',
        properties: {
          test: {
            type: 'array',
          },
          test2: {
            type: 'object',
            properties: {
              test3: {
                type: 'number',
              },
            },
          },
        },
      };

      expect(hasFieldsOtherThanArray(schema)).to.be.true;
    });
    it('should return false if only array fields', () => {
      const schema = {
        type: 'object',
        properties: {
          test: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                test: {
                  type: 'string',
                },
              },
            },
          },
        },
      };

      expect(hasFieldsOtherThanArray(schema)).to.be.false;
    });
  });
  describe('getArrayFields', () => {
    it('should get array', () => {
      const data = {
        schema: {
          type: 'array',
        },
        uiSchema: {},
      };

      const fields = getArrayFields(data);

      expect(fields).not.to.be.empty;
    });
    it('should skip array using option', () => {
      const data = {
        schema: {
          type: 'array',
        },
        uiSchema: {
          'ui:options': {
            keepInPageOnReview: true,
          },
        },
      };

      const fields = getArrayFields(data);

      expect(fields).to.be.empty;
    });
    it('should get array in object', () => {
      const data = {
        schema: {
          type: 'object',
          properties: {
            field: {
              type: 'array',
            },
          },
        },
        uiSchema: {},
      };

      const fields = getArrayFields(data, {});

      expect(fields).not.to.be.empty;
      expect(fields[0].path).to.eql(['field']);
    });
    it('should not get hidden array', () => {
      const data = {
        schema: {
          type: 'array',
          'ui:hidden': true,
        },
        uiSchema: {},
      };

      const fields = getArrayFields(data, {});

      expect(fields).to.be.empty;
    });
    it('should not get array in hidden object', () => {
      const data = {
        schema: {
          type: 'object',
          'ui:collapsed': true,
          properties: {
            field: {
              type: 'array',
            },
          },
        },
        uiSchema: {},
      };

      const fields = getArrayFields(data, {});

      expect(fields).to.be.empty;
    });
    it('should not throw an error', () => {
      const data = {
        schema: {
          type: 'object',
          properties: {
            veteran: {
              type: 'object',
              required: ['address'],
              properties: {
                address: {
                  type: 'object',
                  required: [],
                  properties: {},
                },
              },
            },
          },
        },
        uiSchema: {},
      };
      // TypeError: Cannot read property 'address' of undefined is thrown
      // without optional chaining
      const fields = getArrayFields(data);

      expect(fields).to.be.empty;
    });
  });
  describe('transformForSubmit', () => {
    it('should flatten page data within chapter', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {},
              page2: {},
            },
          },
        },
      };
      const formData = {
        data: {
          otherField: 'testing2',
          field: 'testing',
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));

      expect(output).to.eql({
        otherField: 'testing2',
        field: 'testing',
      });
    });
    it('should flatten page data across chapters', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {},
            },
          },
          chapter2: {
            pages: {
              page2: {},
            },
          },
        },
      };
      const formData = {
        data: {
          otherField: 'testing2',
          field: 'testing',
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));

      expect(output).to.eql({
        otherField: 'testing2',
        field: 'testing',
      });
    });
    it('should remove view fields', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {},
            },
          },
        },
      };
      const formData = {
        data: {
          'view:Test': 'thing',
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));

      expect(output['view:Test']).to.be.undefined;
    });
    it('should flatten view objects', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {},
            },
          },
        },
      };
      const formData = {
        data: {
          'view:Test': {
            field: 'testing',
          },
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));

      expect(output['view:Test']).to.be.undefined;
      expect(output).to.eql({
        field: 'testing',
      });
    });
    it('should flatten view objects and remove null, undefined, or empty fields', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {},
            },
          },
        },
      };
      const formData = {
        data: {
          'view:Test': {
            field: 'testing',
            fieldObject: {
              field: 'testing',
              nullField: null,
              undefinedField: undefined,
            },
            nullField: null,
            undefinedField: undefined,
            nullObject: {
              nullField: null,
            },
            undefinedObject: {
              undefinedField: undefined,
            },
            empty: {},
          },
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));
      expect(output['view:Test']).to.be.undefined;
      expect(output).to.eql({
        field: 'testing',
        fieldObject: {
          field: 'testing',
        },
      });
    });
    it('should remove inactive pages', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {
                schema: {
                  type: 'object',
                  properties: {
                    otherField: {
                      type: 'string',
                    },
                  },
                },
                depends: {
                  field: 'something',
                },
              },
            },
          },
          chapter2: {
            pages: {
              page2: {
                schema: {
                  type: 'object',
                  properties: {},
                },
              },
            },
          },
        },
      };
      const formData = {
        data: {
          otherField: 'testing2',
          field: 'testing',
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));

      expect(output).to.eql({
        field: 'testing',
      });
    });
    it('should not remove properties that are on both active and inactive pages', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {
                schema: {
                  type: 'object',
                  properties: {
                    otherField: {
                      type: 'string',
                    },
                    anotherField: {
                      type: 'string',
                    },
                  },
                },
                depends: {
                  field: 'something',
                },
              },
            },
          },
          chapter2: {
            pages: {
              page2: {
                schema: {
                  type: 'object',
                  properties: {
                    anotherField: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      };
      const formData = {
        data: {
          otherField: 'testing2',
          anotherField: 'testing3',
          field: 'testing',
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));

      expect(output).to.eql({
        field: 'testing',
        anotherField: 'testing3',
      });
    });
    it('should remove empty addresses', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {},
            },
          },
        },
      };
      const formData = {
        data: {
          address: {
            country: 'testing',
          },
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));

      expect(output.address).to.be.undefined;
    });
    it('should not remove empty addresses if allowPartialAddress is true', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {},
            },
          },
        },
      };
      const formData = {
        data: {
          address: {
            country: 'testing',
          },
        },
      };

      const output = JSON.parse(
        transformForSubmit(formConfig, formData, {
          allowPartialAddress: true,
        }),
      );

      expect(output.address.country).to.eql('testing');
    });
    it('should remove empty objects, null fields, and undefined fields', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {},
            },
          },
        },
      };
      const formData = {
        data: {
          someField1: {},
          someField2: {
            someData: undefined,
          },
          someField3: {
            someData: null,
          },
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));

      expect(output).to.deep.equal({});
    });
    it('should remove nested empty objects, null fields, and undefined fields', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {},
            },
          },
        },
      };
      const formData = {
        data: {
          someField1: {
            someData: {
              someOtherData: null,
            },
          },
          someField2: {
            someData: {
              someOtherData: undefined,
            },
          },
          someField3: {
            someData: {
              someOtherData: null,
              someValue: 'some value',
            },
          },
          someField4: {
            someData: {
              someOtherData: undefined,
              someValue: 'some value',
            },
          },
          someField5: {
            someData: {
              someOtherData: {
                yetMoreData: null,
                yetMoreValue: 'yet more value',
              },
              someValue: 'some value',
            },
          },
          someField6: {
            someData: {
              someOtherData: {
                yetMoreData: undefined,
                yetMoreValue: 'yet more value',
              },
              someValue: 'some value',
            },
          },
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));

      expect(output).to.deep.equal({
        someField1: {},
        someField2: {},
        someField3: { someData: { someValue: 'some value' } },
        someField4: { someData: { someValue: 'some value' } },
        someField5: {
          someData: {
            someOtherData: { yetMoreValue: 'yet more value' },
            someValue: 'some value',
          },
        },
        someField6: {
          someData: {
            someOtherData: { yetMoreValue: 'yet more value' },
            someValue: 'some value',
          },
        },
      });
    });
    it('should remove empty objects, null fields, and undefined fields within an array', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {},
            },
          },
        },
      };
      const formData = {
        data: {
          someField: {
            subField: [
              { foo: 'bar' },
              {},
              { someField1: null },
              { someField2: undefined },
              {
                someField3: {
                  someData: 'some data',
                  notSomeData: null,
                  alsoNotSomeData: undefined,
                },
              },
            ],
          },
          arrayField: [
            { foo: 'bar' },
            {},
            { someField1: null },
            { someField2: undefined },
          ],
          emptyArray: [{}, {}, { someField1: null }, { someField2: undefined }],
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));

      expect(output).to.deep.equal({
        someField: {
          subField: [{ foo: 'bar' }, { someField3: { someData: 'some data' } }],
        },
        arrayField: [{ foo: 'bar' }],
      });
    });
    it('should convert autosuggest field to id', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {},
            },
          },
        },
      };
      const formData = {
        data: {
          someField2: {
            widget: 'autosuggest',
            id: '1',
            label: 'test',
          },
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));

      expect(output.someField2).to.equal('1');
    });
    it('should not remove inactive pagePerItem pages if some of the pages are active', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {
                showPagePerItem: true,
                arrayPath: 'testArray',
                path: '/test/:index',
                schema: {
                  type: 'object',
                  properties: {
                    testArray: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          isActive: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
                depends: (data, index) => data.testArray[index].isActive,
              },
            },
          },
        },
      };
      const formData = {
        data: {
          testArray: [{ isActive: true }, { isActive: false }],
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));

      expect(output.testArray).not.to.be.undefined;
    });
    it('should remove inactive pagePerItem pages if none of the pages are active', () => {
      const formConfig = {
        chapters: {
          chapter1: {
            pages: {
              page1: {
                showPagePerItem: true,
                arrayPath: 'testArray',
                path: '/test/:index',
                schema: {
                  type: 'object',
                  properties: {
                    testArray: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          isActive: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
                depends: (data, index) => data.testArray[index].isActive,
              },
            },
          },
        },
      };
      const formData = {
        data: {
          testArray: [{ isActive: false }, { isActive: false }],
        },
      };

      const output = JSON.parse(transformForSubmit(formConfig, formData));

      expect(output.testArray).to.be.undefined;
    });
    it('should serialize without `null` array entries after inactive pruning', () => {
      // Minimal form config with one active array page & one inactive array page
      const formConfig = {
        urlPrefix: '/test/',
        chapters: {
          c1: {
            pages: {
              employers: {
                path: 'employers/:index',
                showPagePerItem: true,
                arrayPath: 'currentEmployers',
                schema: {
                  type: 'object',
                  properties: {
                    currentEmployers: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          phone: { type: 'string' },
                        },
                      },
                    },
                  },
                },
                depends: () => true, // active
              },
              centers: {
                path: 'centers/:index',
                showPagePerItem: true,
                arrayPath: 'vaMedicalCenters',
                schema: {
                  type: 'object',
                  properties: {
                    vaMedicalCenters: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          facility: { type: 'string' },
                          city: { type: 'string' },
                        },
                      },
                    },
                  },
                },
                depends: () => false, // inactive
              },
            },
          },
        },
      };

      const form = {
        data: {
          currentEmployers: [{ name: 'Acme', phone: '555-1234' }],
          vaMedicalCenters: [{ facility: 'ABC', city: 'X' }],
        },
      };

      // Build page list to ensure expandArrayPages behaves
      const pageList = createFormPageList(formConfig);
      expect(pageList).to.have.length(2); // sanity

      const json = transformForSubmit(formConfig, form);
      expect(json).to.be.a('string');
      expect(json).to.not.include('[null]');
    });
  });
  describe('setArrayRecordTouched', () => {
    /* eslint-disable camelcase */
    it('should set field as touched', () => {
      const touched = setArrayRecordTouched('root', 0);

      expect(touched).to.eql({
        root_0: true,
      });
    });
    /* eslint-enable camelcase */
  });
  describe('getNonArraySchema', () => {
    it('should return undefined if array', () => {
      const result = getNonArraySchema({ type: 'array' });

      expect(result.schema).to.be.undefined;
    });
    it('should skip array fields using option', () => {
      const result = getNonArraySchema(
        { type: 'array' },
        { 'ui:option': { keepInPageOnReview: true } },
      );

      expect(result.schema).to.be.undefined;
    });
    it('should return undefined if nested array', () => {
      const result = getNonArraySchema({
        type: 'object',
        properties: {
          field: {
            type: 'array',
          },
        },
      });

      expect(result.schema).to.be.undefined;
    });
    it('should return fields without array', () => {
      const result = getNonArraySchema({
        type: 'object',
        required: ['field', 'field2'],
        properties: {
          field: {
            type: 'string',
          },
          field2: {
            type: 'array',
          },
        },
      });

      expect(result.schema).to.eql({
        type: 'object',
        required: ['field'],
        properties: {
          field: {
            type: 'string',
          },
        },
      });
    });

    it('should return original input fields if ui:options.displayEmptyObjectOnReview is true', () => {
      const result = getNonArraySchema(
        {
          type: 'object',
          required: [],
          properties: {
            field1: {
              type: 'object',
              properties: {},
            },
            field2: {
              type: 'object',
              properties: {},
            },
          },
        },
        {
          field1: {
            'ui:description': 'My field1 text',
            'ui:options': {
              displayEmptyObjectOnReview: true,
            },
          },
          field2: {
            'ui:description': 'My field2 text',
            'ui:options': {
              displayEmptyObjectOnReview: true,
            },
          },
        },
      );

      expect(result.schema).to.eql({
        type: 'object',
        required: [],
        properties: {
          field1: {
            type: 'object',
            properties: {},
          },
          field2: {
            type: 'object',
            properties: {},
          },
        },
      });

      expect(result.uiSchema).to.eql({
        field1: {
          'ui:description': 'My field1 text',
          'ui:options': {
            displayEmptyObjectOnReview: true,
          },
        },
        field2: {
          'ui:description': 'My field2 text',
          'ui:options': {
            displayEmptyObjectOnReview: true,
          },
        },
      });
    });

    it('should return fields without array', () => {
      const result = getNonArraySchema(
        {
          type: 'object',
          required: ['field1', 'field2'],
          properties: {
            field1: {
              type: 'string',
              properties: {},
            },
            field2: {
              type: 'object',
              properties: {},
            },
          },
        },
        {
          'ui:order': ['field1', 'field2'],
          field1: {
            'ui:description': 'My field1 text',
          },
          field2: {
            'ui:description': 'My field2 text',
          },
        },
      );

      expect(result.uiSchema).to.eql({
        'ui:order': ['field1'],
        field1: {
          'ui:description': 'My field1 text',
        },
        field2: {
          'ui:description': 'My field2 text',
        },
      });
    });
  });

  describe('checkValidSchema', () => {
    it('should return true for valid schema', () => {
      const s = {
        type: 'object',
        properties: {
          // Only type
          field1: {
            type: 'string',
          },
          // Object with blank properties
          field2: {
            type: 'object',
            properties: {},
          },
          // Nested object properties
          field3: {
            type: 'object',
            properties: {
              nestedField: { type: 'string' }, // Missing type
            },
          },
          // Array with items object
          field4: {
            type: 'array',
            items: { type: 'string' },
          },
          // Array with items array
          field5: {
            type: 'array',
            additionalItems: { type: 'string' },
            items: [{ type: 'string' }],
          },
        },
      };

      // If this throws an error, the test will fail
      expect(checkValidSchema(s)).to.equal(true);
    });
    it('should throw an error for invalid schemas', () => {
      const s = {
        type: 'object',
        properties: {
          // Missing type
          field1: {
            // type: 'object'
          },
          // Missing properties inside
          field2: {
            type: 'object',
            // properties: {}
          },
          // Invalid nested property
          field3: {
            type: 'object',
            properties: {
              nestedField: {}, // Missing type
            },
          },
          // Missing items
          field4: {
            type: 'array',
            // items: {}
          },
          // Invalid additionalItems
          field5: {
            type: 'array',
            items: [
              {
                type: 'object',
                properties: {
                  nestedField: { type: 'string' },
                },
              },
            ],
            additionalItems: {
              type: 'object',
              // properties: {} // Missing properties
            },
          },
          // Invalid items array
          field6: {
            type: 'array',
            additionalItems: { type: 'string' },
            items: [
              {
                /* type: 'string' */
              },
            ],
          },
          // Invalid items object
          field7: {
            type: 'array',
            items: {
              /* type: 'string' */
            },
          },
          // Missing additionalItems when items is an array
          field8: {
            type: 'array',
            // additionalItems: { type: 'string' },
            items: [{ type: 'string' }],
          },
          // Shouldn't have additionalItems when items is an object
          field9: {
            type: 'array',
            additionalItems: { type: 'string' },
            items: { type: 'string' },
          },
          field10: () => {}, // Function type
        },
      };

      let isValid;
      try {
        isValid = checkValidSchema(s);
      } catch (err) {
        expect(err.message).to.equal(
          'Errors found in schema: ' +
            'Invalid schema at "root.field1": missing or invalid "type" property. Expected an object with a "type" string. ' +
            'Missing object properties in root.field2 schema. ' +
            'Invalid schema at "root.field3.nestedField": missing or invalid "type" property. Expected an object with a "type" string. ' +
            'Missing items schema in root.field4. ' +
            'Missing object properties in root.field5.additionalItems schema. ' +
            'Invalid schema at "root.field6.items.0": missing or invalid "type" property. Expected an object with a "type" string. ' +
            'Invalid schema at "root.field7.items": missing or invalid "type" property. Expected an object with a "type" string. ' +
            'root.field8 should contain additionalItems when items is an array. ' +
            'root.field9 should not contain additionalItems when items is an object. ' +
            'Invalid schema at "root.field10": expected a schema object, but received the function "field10". JSON schemas must be plain objects. Did you forget to call "field10()"?',
        );
      }
      expect(isValid).to.equal(undefined);
    });
  });
  describe('expandArrayPages', () => {
    it('should expand array page for single item', () => {
      const pageList = [
        {
          showPagePerItem: true,
          arrayPath: 'test',
          path: 'test/:index',
        },
      ];
      const data = {
        test: [{}],
      };

      const newPageList = expandArrayPages(pageList, data);

      expect(newPageList.length).to.equal(data.test.length);
      expect(newPageList[0].path).to.equal('test/0');
      expect(newPageList[0].index).to.equal(0);
    });
    it('should expand array page for multiple items', () => {
      const pageList = [
        {
          showPagePerItem: true,
          arrayPath: 'test',
          path: 'test/:index',
        },
      ];
      const data = {
        test: [{}, {}],
      };

      const newPageList = expandArrayPages(pageList, data);

      expect(newPageList.length).to.equal(data.test.length);
      expect(newPageList[0].path).to.equal('test/0');
      expect(newPageList[0].index).to.equal(0);
      expect(newPageList[1].path).to.equal('test/1');
      expect(newPageList[1].index).to.equal(1);
    });
    it('should expand array pages in correct position in list', () => {
      const pageList = [
        {
          path: 'other-path',
        },
        {
          showPagePerItem: true,
          arrayPath: 'test',
          path: 'test/:index',
        },
        {
          path: 'some-path',
        },
      ];
      const data = {
        test: [{}],
      };

      const newPageList = expandArrayPages(pageList, data);

      expect(newPageList.length).to.equal(data.test.length + 2);
      expect(newPageList[0].showPagePerItem).not.to.be.true;
      expect(newPageList[1].path).to.equal('test/0');
      expect(newPageList[1].index).to.equal(0);
      expect(newPageList[2].showPagePerItem).not.to.be.true;
    });
    it('should expand multiple array pages', () => {
      const pageList = [
        {
          showPagePerItem: true,
          arrayPath: 'test',
          path: 'path/:index',
        },
        {
          showPagePerItem: true,
          arrayPath: 'test',
          path: 'other-path/:index',
        },
      ];
      const data = {
        test: [{}, {}],
      };

      const newPageList = expandArrayPages(pageList, data);

      expect(newPageList.length).to.equal(data.test.length * pageList.length);
      expect(newPageList[0].path).to.equal('path/0');
      expect(newPageList[1].path).to.equal('other-path/0');
      expect(newPageList[2].path).to.equal('path/1');
      expect(newPageList[3].path).to.equal('other-path/1');
    });
    it('should skip filtered out array pages', () => {
      const pageList = [
        {
          showPagePerItem: true,
          arrayPath: 'test',
          path: 'path/:index',
          itemFilter: data => !data.filterOut,
        },
        {
          showPagePerItem: true,
          arrayPath: 'test',
          path: 'other-path/:index',
        },
      ];
      const data = {
        test: [{ filterOut: true }, {}],
      };

      const newPageList = expandArrayPages(pageList, data);

      expect(newPageList.length).to.equal(3);
      expect(newPageList[0].path).to.equal('other-path/0');
      expect(newPageList[1].path).to.equal('path/1');
      expect(newPageList[2].path).to.equal('other-path/1');
    });

    it('should accept data as a second itemFilter parameter', () => {
      const data = {
        arbitraryFlag: true,
        test: ['item1', 'item2', 'item3', 'item4'],
      };
      const spy = sinon.spy(data.test, 'filter');
      const pageList = [
        {
          showPagePerItem: true,
          arrayPath: 'test',
          path: 'path/:index',
          itemFilter: () => data.arbitraryFlag,
        },
      ];

      const newPageList = expandArrayPages(pageList, data);
      expect(spy.calledOnce);
      expect(spy.calledWith({}, data)); // this demonstrates itemFilter being called with item (as object), and data
      expect(spy.returned(newPageList));
      expect(newPageList.length).to.equal(4);
      expect(newPageList[0].path).to.equal('path/0');
      expect(newPageList[1].path).to.equal('path/1');
      expect(newPageList[2].path).to.equal('path/2');
      expect(newPageList[3].path).to.equal('path/3');
    });

    it('should pass through list with no array pages', () => {
      const pageList = [
        {
          path: 'test',
        },
      ];
      const data = {
        test: [{}],
      };

      const newPageList = expandArrayPages(pageList, data);

      expect(newPageList.length).to.equal(pageList.length);
      expect(newPageList[0].path).to.equal('test');
    });
    it('should not generate array pages if array is empty', () => {
      const pageList = [
        {
          showPagePerItem: true,
          arrayPath: 'test',
          path: 'path/:index',
        },
        {
          path: 'test',
        },
      ];
      const data = {
        test: [],
      };

      const newPageList = expandArrayPages(pageList, data);

      expect(newPageList.length).to.equal(pageList.length - 1);
      expect(newPageList[0].path).to.equal('test');
    });
  });
  describe('formatReviewDate', () => {
    it('should format full date', () => {
      expect(formatReviewDate('2010-01-01')).to.equal('01/01/2010');
    });
    it('should format partial date', () => {
      expect(formatReviewDate('2010-01-XX')).to.equal('01/XX/2010');
    });
    it('should format month year date', () => {
      expect(formatReviewDate('2010-01-XX', true)).to.equal('01/2010');
    });
    it('should format full date (no dashes)', () => {
      expect(formatReviewDate('20100102')).to.equal('01/02/2010');
    });
    it('should format partial date (no dashes)', () => {
      expect(formatReviewDate('201001XX')).to.equal('01/XX/2010');
    });
    it('should format month year date (no dashes)', () => {
      expect(formatReviewDate('201001XX', true)).to.equal('01/2010');
    });
  });
  describe('omitRequired', () => {
    it('should omit all required arrays', () => {
      const schema = {
        type: 'object',
        properties: {
          field1: {
            type: 'object',
            properties: {
              nestedField: {
                type: 'string',
                enum: ['option1', 'option2'],
              },
            },
            required: ['nestedField'],
          },
        },
        required: ['field1'],
      };
      const expected = {
        type: 'object',
        properties: {
          field1: {
            type: 'object',
            properties: {
              nestedField: {
                type: 'string',
                enum: ['option1', 'option2'],
              },
            },
          },
        },
      };
      expect(omitRequired(schema)).to.eql(expected);
    });
  });

  describe('showReviewField', () => {
    it('should show visible field', () => {
      expect(
        showReviewField(
          'field1',
          {
            properties: {
              field1: {
                type: 'boolean',
              },
            },
          },
          {},
          {},
          {},
        ),
      ).to.eql(true);
    });
    it('should not show field using hiddenOnSchema', () => {
      expect(
        showReviewField(
          'field1',
          {
            properties: {
              field1: {
                type: 'boolean',
                'ui:hidden': true,
              },
            },
          },
          {},
          {},
          {},
        ),
      ).to.eql(false);
    });

    it('should not show field using collapsedOnSchema', () => {
      expect(
        showReviewField(
          'field1',
          {
            properties: {
              field1: {
                type: 'boolean',
                'ui:collapsed': true,
              },
            },
          },
          {},
          {},
          {},
        ),
      ).to.eql(false);
    });

    it('should not show field using ui schema hideOnReview', () => {
      expect(
        showReviewField(
          'field1',
          {
            properties: {
              field1: {
                type: 'boolean',
              },
            },
          },
          {
            field1: {
              'ui:options': {
                hideOnReview: true,
              },
            },
          },
          {},
          {},
        ),
      ).to.eql(false);
    });

    it('should not show field using ui schema hideOnReview function', () => {
      expect(
        showReviewField(
          'field1',
          {
            properties: {
              field1: {
                type: 'boolean',
              },
            },
          },
          {
            field1: {
              'ui:options': {
                hideOnReview: () => true,
              },
            },
          },
          {},
          {},
        ),
      ).to.eql(false);
    });

    it('should not show field using ui schema hideOnReviewIfFalse', () => {
      expect(
        showReviewField(
          'field1',
          {
            properties: {
              field1: {
                type: 'boolean',
              },
            },
          },
          {
            field1: {
              'ui:options': {
                hideOnReviewIfFalse: true,
              },
            },
          },
          { field1: false },
          {},
        ),
      ).to.eql(false);
    });
  });

  describe('getPageProperties', () => {
    const makeArrayPage = (
      properties,
      index = 0,
      arrayPath = 'dependents',
      itemSchema = { properties },
    ) => ({
      arrayPath,
      index,
      schema: { properties: { [arrayPath]: { items: itemSchema } } },
    });

    it('should return array item property paths', () => {
      const page = makeArrayPage({ dob: {}, ssn: {} });
      const expected = ['dependents.0.dob', 'dependents.0.ssn'];
      expect(getPageProperties(page)).to.eql(expected);
    });

    it('should return leaf paths for nested object fields in an array item', () => {
      const page = makeArrayPage(
        {
          schoolInformation: {
            type: 'object',
            properties: { name: {}, city: {} },
          },
        },
        1,
        'studentInformation',
      );
      const expected = [
        'studentInformation.1.schoolInformation.name',
        'studentInformation.1.schoolInformation.city',
      ];
      expect(getPageProperties(page)).to.eql(expected);
    });

    it('should return shallow properties when not an array page', () => {
      const page = {
        schema: {
          properties: {
            dob: {},
            ssn: {},
            providers: {
              type: 'array',
              items: { properties: { name: {}, code: {} } },
            },
          },
        },
      };
      const expected = ['dob', 'ssn', 'providers'];
      expect(getPageProperties(page)).to.eql(expected);
    });

    it('should return empty array if no schema', () => {
      expect(getPageProperties({})).to.eql([]);
    });

    it('should return indexed child keys for an array page', () => {
      const page = makeArrayPage({ first: {}, last: {} }, 0, 'previousNames');
      const expected = ['previousNames.0.first', 'previousNames.0.last'];
      expect(getPageProperties(page)).to.have.members(expected);
    });
  });
  describe('getActivePageProperties', () => {
    const makeRootPage = properties => ({ schema: { properties } });
    const makeArrayPage = (
      properties,
      index = 0,
      arrayPath = 'dependents',
      items = { properties },
    ) => ({
      arrayPath,
      index,
      schema: { properties: { [arrayPath]: items } },
    });

    it('should return unique flattened props across pages', () => {
      const pages = [
        makeRootPage({
          dob: {},
          ssn: {},
          providers: {
            type: 'array',
            items: { properties: { name: {}, code: {} } },
          },
        }),
        makeRootPage({ dob: {}, email: {} }),
      ];
      const expected = ['dob', 'ssn', 'providers', 'email'];
      expect(getActivePageProperties(pages)).to.eql(expected);
    });

    it('should fall back to the parent path when array items use $ref', () => {
      const pages = [
        makeArrayPage(undefined, 0, 'events', {
          items: { $ref: '#/definitions/EventItem' },
        }),
      ];
      expect(getActivePageProperties(pages)).to.eql(['events']);
    });
  });
  describe('deleteNestedProperties', () => {
    const runDelete = (obj, path) => {
      deleteNestedProperty(obj, path);
      return obj;
    };

    it('should delete a nested property', () => {
      const result = runDelete({ a: { b: { c: 123 } } }, 'a.b.c');
      const expected = { a: { b: {} } };
      expect(result).to.eql(expected);
    });

    it('should do nothing if the path is invalid', () => {
      const result = runDelete({ a: { b: 123 } }, 'a.b.c');
      const expected = { a: { b: 123 } };
      expect(result).to.eql(expected);
    });

    it('should not crash on a missing nested path', () => {
      const result = runDelete({}, 'x.y.z');
      expect(result).to.eql({});
    });

    it('should remove an array child path', () => {
      const result = runDelete(
        { dependents: [{ ssn: '411111111', dob: '2000-01-01' }] },
        'dependents.0.ssn',
      );
      const expected = { dependents: [{ dob: '2000-01-01' }] };
      expect(result).to.eql(expected);
    });

    it('should ignore paths containing "__proto__" as not to pollute prototypes', () => {
      const result = runDelete({ a: { b: { c: 123 } } }, '__proto__.polluted');
      const expected = { a: { b: { c: 123 } } };
      expect(result).to.eql(expected);
      expect(Object.prototype).to.not.have.property('polluted');
    });

    it('should ignore paths containing "constructor"', () => {
      const result = runDelete(
        { a: { constructor: { b: 1 }, safe: true } },
        'a.constructor.b',
      );
      const expected = { a: { constructor: { b: 1 }, safe: true } };
      expect(result).to.eql(expected);
    });

    it('should ignore a final "prototype" segment', () => {
      const result = runDelete(
        { a: { b: { prototype: 1, c: 2 } } },
        'a.b.prototype',
      );
      const expected = { a: { b: { prototype: 1, c: 2 } } };
      expect(result).to.eql(expected);
    });

    it('should guard against prototype pollution anywhere in the path', () => {
      runDelete({}, '__proto__.polluted');
      expect(Object.prototype).to.not.have.property('polluted');
    });

    it('should remove an array element without creating a sparse array', () => {
      const result = runDelete(
        { arr: [{ a: 1 }, { b: 2 }, { c: 3 }] },
        'arr.1',
      );
      const expected = [{ a: 1 }, { c: 3 }];
      expect(result.arr).to.deep.equal(expected);
    });

    it('should delete a nested property inside an array item and keep the item', () => {
      const result = runDelete({ arr: [{ a: 1, keep: true }] }, 'arr.0.a');
      const expected = [{ keep: true }];
      expect(result.arr).to.deep.equal(expected);
    });
  });
  describe('filterInactiveNestedPageData', () => {
    const makeRootPage = properties => ({ schema: { properties } });
    const makeArrayPage = (arrayPath, index, properties) => ({
      arrayPath,
      index,
      schema: { properties: { [arrayPath]: { items: { properties } } } },
    });
    const filterData = ({ data, activePages = [], inactivePages = [] }) =>
      filterInactiveNestedPageData(inactivePages, activePages, { data });

    it('should remove inactive root-level fields', () => {
      const result = filterData({
        data: {
          dob: '1990-01-01',
          ssn: '211111111',
          email: 'email@domain.com',
        },
        activePages: [makeRootPage({ dob: {}, ssn: {} })],
        inactivePages: [makeRootPage({ email: {} })],
      });
      const expected = { dob: '1990-01-01', ssn: '211111111' };
      expect(result).to.eql(expected);
    });

    it('should not remove a property shared by active and inactive pages', () => {
      const result = filterData({
        data: { shared: 'keep me', inactiveOnly: 'remove me' },
        activePages: [makeRootPage({ shared: {} })],
        inactivePages: [makeRootPage({ shared: {}, inactiveOnly: {} })],
      });
      const expected = { shared: 'keep me' };
      expect(result).to.eql(expected);
    });

    it('should remove inactive array-item fields for only the targeted index', () => {
      const result = filterData({
        data: {
          dependents: [
            { ssn: '411111111', dob: '2000-01-01' },
            { ssn: '511111111', dob: '2002-01-01' },
          ],
        },
        activePages: [makeArrayPage('dependents', 0, { ssn: {} })],
        inactivePages: [makeArrayPage('dependents', 0, { dob: {} })],
      });
      const expected = {
        dependents: [
          { ssn: '411111111' },
          { ssn: '511111111', dob: '2002-01-01' },
        ],
      };
      expect(result).to.eql(expected);
    });

    it('should not remove fields from a different array index', () => {
      const result = filterData({
        data: {
          dependents: [
            { ssn: '411111111', dob: '2000-01-01' },
            { ssn: '511111111', dob: '2002-01-01' },
          ],
        },
        activePages: [makeArrayPage('dependents', 0, { ssn: {} })],
        inactivePages: [makeArrayPage('dependents', 1, { dob: {} })],
      });
      const expected = {
        dependents: [
          { ssn: '411111111', dob: '2000-01-01' },
          { ssn: '511111111' },
        ],
      };
      expect(result).to.eql(expected);
    });

    it('should remove an inactive sibling in an array item while other sibling fields are active', () => {
      const result = filterData({
        data: {
          events: [{ details: 'd', location: 'l', agency: 'x' }],
        },
        activePages: [
          makeArrayPage('events', 0, { details: {} }),
          makeArrayPage('events', 0, { location: {} }),
        ],
        inactivePages: [makeArrayPage('events', 0, { agency: {} })],
      });
      const expected = { events: [{ details: 'd', location: 'l' }] };
      expect(result).to.eql(expected);
    });

    it('should remove only the inactive nested leaf in an array item while preserving active sibling fields', () => {
      const result = filterData({
        data: {
          studentInformation: [
            {
              schoolInformation: {
                name: 'Notre Dame',
                city: 'South Bend',
                state: 'IN',
              },
            },
          ],
        },
        activePages: [
          makeArrayPage('studentInformation', 0, {
            schoolInformation: {
              type: 'object',
              properties: { city: {}, state: {} },
            },
          }),
        ],
        inactivePages: [
          makeArrayPage('studentInformation', 0, {
            schoolInformation: {
              type: 'object',
              properties: { name: {} },
            },
          }),
        ],
      });
      const expected = {
        studentInformation: [
          { schoolInformation: { city: 'South Bend', state: 'IN' } },
        ],
      };
      expect(result).to.eql(expected);
    });

    it('should preserve a parent object when it has active descendant fields', () => {
      const result = filterData({
        data: {
          providers: [{ name: 'Big Insurance Co', policyNum: '2342344' }],
        },
        activePages: [
          makeArrayPage('providers', 0, { name: {}, policyNum: {} }),
        ],
        inactivePages: [makeRootPage({ providers: { type: 'array' } })],
      });
      const expected = {
        providers: [{ name: 'Big Insurance Co', policyNum: '2342344' }],
      };
      expect(result).to.eql(expected);
    });

    it('should remove the whole parent array when it is inactive and has no active descendants', () => {
      const result = filterData({
        data: { dependents: [{ ssn: '411111111', dob: '2000-01-01' }] },
        activePages: [makeRootPage({ unrelated: {} })],
        inactivePages: [makeRootPage({ dependents: { type: 'array' } })],
      });
      expect(result).to.eql({});
    });

    it('should remove inactive nested root fields while preserving active nested descendants', () => {
      const result = filterData({
        data: {
          veteran: {
            fullName: { first: 'John', last: 'Smith' },
            dob: '1980-01-01',
            ssn: '311111111',
          },
          spouse: { ssn: '211111111' },
        },
        activePages: [
          makeRootPage({
            'veteran.fullName.first': {},
            'veteran.fullName.last': {},
            'veteran.dob': {},
          }),
        ],
        inactivePages: [makeRootPage({ 'veteran.ssn': {}, 'spouse.ssn': {} })],
      });
      const expected = {
        veteran: {
          fullName: { first: 'John', last: 'Smith' },
          dob: '1980-01-01',
        },
      };
      expect(result).to.eql(expected);
    });

    it('should remove empty array items and remove the array when it becomes empty', () => {
      const result = filterData({
        data: { medCenters: [{ facility: 'ABC', city: 'Marion' }] },
        activePages: [],
        inactivePages: [
          makeArrayPage('medCenters', 0, { facility: {}, city: {} }),
        ],
      });
      expect(result).to.eql({});
    });

    it('should not mutate the original form data', () => {
      const formData = {
        dependents: [{ ssn: '1', dob: '2000-01-01' }],
        email: 'email@domain.com',
      };
      const original = JSON.parse(JSON.stringify(formData));

      filterInactiveNestedPageData(
        [
          makeRootPage({ email: {} }),
          makeArrayPage('dependents', 0, { dob: {} }),
        ],
        [makeArrayPage('dependents', 0, { ssn: {} })],
        { data: formData },
      );

      expect(formData).to.eql(original);
    });
  });
});

describe('stringifyUrlParams ', () => {
  it('should convert an object to a url query string', () => {
    expect(stringifyUrlParams(null)).to.eql('');
    expect(stringifyUrlParams({})).to.eql('');
    expect(
      stringifyUrlParams({
        add: true,
      }),
    ).to.eql('?add=true');
    expect(
      stringifyUrlParams({
        time: '123',
        rate: 24,
      }),
    ).to.eql('?time=123&rate=24');
  });
});

describe('getUrlPathIndex', () => {
  it('should return the index of a url path', () => {
    expect(getUrlPathIndex(null)).to.eql(undefined);
    expect(getUrlPathIndex('/form-1/path-2')).to.eql(undefined);
    expect(getUrlPathIndex('form-1/path-2/0')).to.eql(0);
    expect(getUrlPathIndex('/form-1/path-2/3')).to.eql(3);
    expect(getUrlPathIndex('/form-1/path-2/3?add')).to.eql(3);
    expect(getUrlPathIndex('/form-1/path-2/0/the-page?add')).to.eql(0);
    expect(getUrlPathIndex('/form-1/path-2/1/page-3')).to.eql(1);
  });
});

describe('convertUrlPathToPageConfigPath', () => {
  it('should convert a url path to a page config path', () => {
    let urlPath;
    let expectedPagePath;
    expect(convertUrlPathToPageConfigPath(urlPath)).to.equal(expectedPagePath);

    urlPath = null;
    expectedPagePath = null;
    expect(convertUrlPathToPageConfigPath(urlPath)).to.equal(expectedPagePath);

    urlPath = '/veteran-information';
    expectedPagePath = 'veteran-information';
    expect(convertUrlPathToPageConfigPath(urlPath)).to.equal(expectedPagePath);

    urlPath = '/mental-health/0/events-details';
    expectedPagePath = 'mental-health/:index/events-details';
    expect(convertUrlPathToPageConfigPath(urlPath)).to.equal(expectedPagePath);

    urlPath = '/mental-health/0';
    expectedPagePath = 'mental-health/:index';
    expect(convertUrlPathToPageConfigPath(urlPath)).to.equal(expectedPagePath);

    urlPath = 'mental-health/0/';
    expectedPagePath = 'mental-health/:index';
    expect(convertUrlPathToPageConfigPath(urlPath)).to.equal(expectedPagePath);

    urlPath = '/root-form/specific-name/mental-health/0/events-details';
    let rootUrl = '/root-form/specific-name';
    expectedPagePath = 'mental-health/:index/events-details';
    expect(convertUrlPathToPageConfigPath(urlPath, rootUrl)).to.equal(
      expectedPagePath,
    );

    urlPath = '/root-form/specific-name/mental-health/0/events-details';
    rootUrl = 'root-form/specific-name/';
    expectedPagePath = 'mental-health/:index/events-details';
    expect(convertUrlPathToPageConfigPath(urlPath, rootUrl)).to.equal(
      expectedPagePath,
    );

    urlPath = 'root-form/specific-name/mental-health/0/events-details';
    rootUrl = '/root-form/specific-name/';
    expectedPagePath = 'mental-health/:index/events-details';
    expect(convertUrlPathToPageConfigPath(urlPath, rootUrl)).to.equal(
      expectedPagePath,
    );
  });
});

describe('Chapter-level depends', () => {
  const createPage = (overrides = {}) => ({
    depends: undefined,
    chapterDepends: undefined,
    ...overrides,
  });
  const createFormConfig = (chapters, enableChapterDepends = true) => ({
    formOptions: { enableChapterDepends },
    chapters,
  });
  const createChapter = (depends, fieldName, pageDepends = undefined) => ({
    depends,
    pages: {
      page1: {
        depends: pageDepends,
        schema: {
          type: 'object',
          properties: { [fieldName]: { type: 'string' } },
        },
      },
    },
  });

  describe('isActivePage with chapter depends', () => {
    const testCases = [
      {
        desc:
          'should return false when chapter depends is false, regardless of page depends',
        page: createPage({ depends: () => true, chapterDepends: () => false }),
        expected: false,
      },
      {
        desc: 'should evaluate page depends when chapter depends is true',
        page: createPage({ depends: () => false, chapterDepends: () => true }),
        expected: false,
      },
      {
        desc:
          'should return true when chapter depends is true and page has no depends',
        page: createPage({ chapterDepends: () => true }),
        expected: true,
      },
      {
        desc: 'should ignore chapter depends when it is undefined',
        page: createPage({ depends: () => true }),
        expected: true,
      },
    ];

    testCases.forEach(({ desc, page, expected }) => {
      it(desc, () => {
        expect(isActivePage(page, {})).to.equal(expected);
      });
    });

    it('should support array pattern for chapter depends', () => {
      const page = createPage({ chapterDepends: [{ field: 'test' }] });
      expect(isActivePage(page, { field: 'test' })).to.be.true;
      expect(isActivePage(page, { field: 'other' })).to.be.false;
    });

    it('should support object pattern for chapter depends', () => {
      const page = createPage({ chapterDepends: { field: 'test' } });
      expect(isActivePage(page, { field: 'test' })).to.be.true;
      expect(isActivePage(page, { field: 'other' })).to.be.false;
    });
  });

  describe('createFormPageList with enableChapterDepends', () => {
    const baseChapter = {
      depends: () => true,
      pages: { page1: { path: 'page1' } },
    };

    [
      { enabled: true, expected: 'function' },
      { enabled: false, expected: 'undefined' },
    ].forEach(({ enabled, expected }) => {
      it(`should ${
        enabled ? '' : 'not '
      }add chapterDepends when enableChapterDepends is ${enabled}`, () => {
        const formConfig = createFormConfig({ chapter1: baseChapter }, enabled);
        const pageList = createFormPageList(formConfig);

        if (expected === 'function') {
          expect(pageList[0].chapterDepends).to.be.a('function');
        } else {
          expect(pageList[0].chapterDepends).to.be.undefined;
        }
      });
    });

    it('should not add chapterDepends when chapter has no depends', () => {
      const formConfig = createFormConfig({
        chapter1: { pages: { page1: { path: 'page1' } } },
      });
      const pageList = createFormPageList(formConfig);
      expect(pageList[0].chapterDepends).to.be.undefined;
    });
  });

  describe('transformForSubmit with chapter depends', () => {
    it('should remove data from pages in inactive chapters', () => {
      const formConfig = createFormConfig({
        activeChapter: createChapter(() => true, 'activeField'),
        inactiveChapter: createChapter(() => false, 'inactiveField'),
      });
      const formData = {
        data: {
          activeField: 'keep this',
          inactiveField: 'remove this',
        },
      };
      const output = JSON.parse(transformForSubmit(formConfig, formData));
      expect(output.activeField).to.equal('keep this');
      expect(output.inactiveField).to.be.undefined;
    });

    it('should respect page depends when chapter is active', () => {
      const formConfig = createFormConfig({
        chapter1: {
          depends: () => true,
          pages: {
            page1: createChapter(undefined, 'field1').pages.page1,
            page2: {
              depends: () => true,
              schema: {
                type: 'object',
                properties: { field2: { type: 'string' } },
              },
            },
          },
        },
      });
      formConfig.chapters.chapter1.pages.page1.depends = () => false;
      const formData = {
        data: {
          field1: 'should be removed',
          field2: 'should be kept',
        },
      };
      const output = JSON.parse(transformForSubmit(formConfig, formData));
      expect(output.field1).to.be.undefined;
      expect(output.field2).to.equal('should be kept');
    });
  });
});
