import { expect } from 'chai';
import {
  addForceDivWrapperToUiSchemaRoot,
  applyForceDivWrapperToFormConfig,
} from '../../../config/uiSchemaHelpers';

describe('uiSchemaHelpers', () => {
  describe('addForceDivWrapperToUiSchemaRoot', () => {
    it('adds forceDivWrapper at the uiSchema root', () => {
      const uiSchema = {
        'ui:options': {
          hideOnReview: true,
        },
      };

      const result = addForceDivWrapperToUiSchemaRoot(uiSchema);

      expect(result['ui:options'].forceDivWrapper).to.be.true;
      expect(result['ui:options'].hideOnReview).to.be.true;
    });

    it('returns a new object and does not mutate the input', () => {
      const uiSchema = {
        claimantFullName: {
          first: {
            'ui:title': 'First name',
          },
        },
      };

      const result = addForceDivWrapperToUiSchemaRoot(uiSchema);

      expect(result).to.not.equal(uiSchema);
      expect(uiSchema['ui:options']).to.be.undefined;
      expect(uiSchema.claimantFullName['ui:options']).to.be.undefined;
    });
  });

  describe('applyForceDivWrapperToFormConfig', () => {
    it('applies forceDivWrapper to each chapter page uiSchema root', () => {
      const formConfig = {
        chapters: {
          chapterA: {
            pages: {
              pageOne: {
                uiSchema: {
                  fieldA: {},
                },
              },
              pageTwo: {
                uiSchema: {},
              },
            },
          },
        },
      };

      const result = applyForceDivWrapperToFormConfig(formConfig);

      expect(result).to.not.equal(formConfig);
      expect(
        result.chapters.chapterA.pages.pageOne.uiSchema['ui:options']
          .forceDivWrapper,
      ).to.be.true;
      expect(
        result.chapters.chapterA.pages.pageTwo.uiSchema['ui:options']
          .forceDivWrapper,
      ).to.be.true;
    });

    it('adds forceDivWrapper to arrayBuilder arrayPath uiSchema node', () => {
      const formConfig = {
        chapters: {
          chapterA: {
            pages: {
              itemPage: {
                arrayPath: 'veteransChildren',
                uiSchema: {
                  veteransChildren: {
                    items: {
                      childFullName: {},
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = applyForceDivWrapperToFormConfig(formConfig);

      expect(
        result.chapters.chapterA.pages.itemPage.uiSchema['ui:options']
          .forceDivWrapper,
      ).to.be.true;
      expect(
        result.chapters.chapterA.pages.itemPage.uiSchema.veteransChildren[
          'ui:options'
        ].forceDivWrapper,
      ).to.be.true;
      expect(
        result.chapters.chapterA.pages.itemPage.uiSchema.veteransChildren.items[
          'ui:options'
        ].forceDivWrapper,
      ).to.be.true;
    });
  });
});
