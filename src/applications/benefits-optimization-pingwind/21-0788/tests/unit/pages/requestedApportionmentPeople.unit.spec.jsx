import { expect } from 'chai';
import requestedApportionmentPeople from '../../../pages/requestedApportionmentPeople';
import {
  apportionmentInformationText,
  requestedApportionmentPersonFields,
} from '../../../definitions/constants';

const personFields = requestedApportionmentPersonFields;

describe('21-0788 requestedApportionmentPeople', () => {
  const {
    requestedApportionmentPeopleIntro,
    requestedApportionmentPeopleSummary,
    requestedApportionmentPersonIdentityPage,
    requestedApportionmentPersonRelationshipPage,
    requestedApportionmentPersonReceiptPage,
    requestedApportionmentPersonStepchildPage,
    requestedApportionmentPersonAdoptionPage,
  } = requestedApportionmentPeople;

  describe('exports', () => {
    it('includes every page the array builder produces', () => {
      expect(requestedApportionmentPeopleIntro).to.exist;
      expect(requestedApportionmentPeopleSummary).to.exist;
      expect(requestedApportionmentPersonIdentityPage).to.exist;
      expect(requestedApportionmentPersonRelationshipPage).to.exist;
      expect(requestedApportionmentPersonReceiptPage).to.exist;
      expect(requestedApportionmentPersonStepchildPage).to.exist;
      expect(requestedApportionmentPersonAdoptionPage).to.exist;
    });

    it('uses the expected paths', () => {
      expect(requestedApportionmentPeopleIntro.path).to.equal(
        'requested-apportionment-people',
      );
      expect(requestedApportionmentPeopleSummary.path).to.equal(
        'requested-apportionment-people-summary',
      );
      expect(requestedApportionmentPersonIdentityPage.path).to.equal(
        'requested-apportionment-people/:index/name-and-ssn',
      );
      expect(requestedApportionmentPersonRelationshipPage.path).to.equal(
        'requested-apportionment-people/:index/relationship',
      );
      expect(requestedApportionmentPersonReceiptPage.path).to.equal(
        'requested-apportionment-people/:index/current-apportionment',
      );
      expect(requestedApportionmentPersonStepchildPage.path).to.equal(
        'requested-apportionment-people/:index/stepchild-household',
      );
      expect(requestedApportionmentPersonAdoptionPage.path).to.equal(
        'requested-apportionment-people/:index/adoption-question',
      );
    });

    it('gives every builder page a schema and uiSchema object', () => {
      const pages = [
        requestedApportionmentPersonIdentityPage,
        requestedApportionmentPersonRelationshipPage,
        requestedApportionmentPersonReceiptPage,
        requestedApportionmentPersonStepchildPage,
        requestedApportionmentPersonAdoptionPage,
      ];
      pages.forEach(page => {
        expect(page.schema).to.be.an('object');
        expect(page.uiSchema).to.be.an('object');
      });
    });
  });

  describe('stepchild page depends/ui:required/hideIf', () => {
    const page = requestedApportionmentPersonStepchildPage;

    const buildFormData = item => ({
      [personFields.parentObject]: [item],
    });

    const findFieldWithHideIf = node => {
      if (!node || typeof node !== 'object') return null;
      if (
        typeof node['ui:required'] === 'function' &&
        node['ui:options'] &&
        typeof node['ui:options'].hideIf === 'function'
      ) {
        return node;
      }
      for (const value of Object.values(node)) {
        const found = findFieldWithHideIf(value);
        if (found) return found;
      }
      return null;
    };

    it('only shows when the person currently receives apportionment', () => {
      expect(
        page.depends(
          buildFormData({
            [personFields.receivesApportionmentNow]: true,
          }),
          0,
        ),
      ).to.equal(true);
      expect(
        page.depends(
          buildFormData({
            [personFields.receivesApportionmentNow]: false,
          }),
          0,
        ),
      ).to.equal(false);
      expect(page.depends(buildFormData({}), 0)).to.equal(false);
      expect(page.depends(undefined, 0)).to.equal(false);
    });

    it('marks the departure-date ui:required only on negative answers', () => {
      const field = findFieldWithHideIf(page.uiSchema);
      expect(field, 'stepchild departure date field').to.exist;

      expect(
        field['ui:required'](
          buildFormData({ [personFields.stepchildLivesWithVeteran]: false }),
          0,
        ),
      ).to.equal(true);
      expect(
        field['ui:required'](
          buildFormData({ [personFields.stepchildLivesWithVeteran]: 'N' }),
          0,
        ),
      ).to.equal(true);
      expect(
        field['ui:required'](
          buildFormData({ [personFields.stepchildLivesWithVeteran]: true }),
          0,
        ),
      ).to.equal(false);
      expect(field['ui:required'](buildFormData({}), 0)).to.equal(false);
    });

    it('hides the departure-date field unless the answer is negative', () => {
      const field = findFieldWithHideIf(page.uiSchema);
      const { hideIf } = field['ui:options'];

      expect(
        hideIf(
          buildFormData({ [personFields.stepchildLivesWithVeteran]: false }),
          0,
        ),
      ).to.equal(false);
      expect(
        hideIf(
          buildFormData({ [personFields.stepchildLivesWithVeteran]: 'N' }),
          0,
        ),
      ).to.equal(false);
      expect(
        hideIf(
          buildFormData({ [personFields.stepchildLivesWithVeteran]: true }),
          0,
        ),
      ).to.equal(true);
      expect(hideIf(buildFormData({}), 0)).to.equal(true);
    });
  });

  describe('summary page', () => {
    it('includes the array-builder hasRequestedPeople sentinel', () => {
      expect(
        requestedApportionmentPeopleSummary.schema.properties,
      ).to.have.any.keys('view:hasRequestedPeople');
    });

    it('attaches a ui object to the hasRequestedPeople field', () => {
      const ui =
        requestedApportionmentPeopleSummary.uiSchema['view:hasRequestedPeople'];
      expect(ui).to.be.an('object');
    });
  });

  describe('intro page', () => {
    it('produces a schema (arrayBuilder intro has no top-level required)', () => {
      expect(requestedApportionmentPeopleIntro.schema).to.be.an('object');
      expect(requestedApportionmentPeopleIntro.uiSchema).to.be.an('object');
    });
  });
  describe('internal helpers (__testables)', () => {
    // eslint-disable-next-line global-require
    const {
      __testables,
    } = require('../../../pages/requestedApportionmentPeople');
    const {
      buildPersonName,
      getRequestedPersonAtIndex,
      getStepchildLivesWithVeteranValue,
      isNegativeSelection,
      options,
    } = __testables;

    describe('buildPersonName', () => {
      it('falls back to "Requested person" when there is no name object', () => {
        expect(buildPersonName(undefined)).to.equal('Requested person');
        expect(buildPersonName({})).to.equal('Requested person');
      });

      it('builds "first middle last" when all parts are present', () => {
        expect(
          buildPersonName({
            [personFields.fullName]: {
              first: 'Jane',
              middle: 'M',
              last: 'Doe',
            },
          }),
        ).to.equal('Jane M Doe');
      });

      it('collapses extra whitespace when middle is missing', () => {
        expect(
          buildPersonName({
            [personFields.fullName]: { first: 'Jane', last: 'Doe' },
          }),
        ).to.equal('Jane Doe');
      });

      it('handles a name with only a first', () => {
        expect(
          buildPersonName({
            [personFields.fullName]: { first: 'Jane' },
          }),
        ).to.equal('Jane');
      });
    });

    describe('getRequestedPersonAtIndex', () => {
      it('returns undefined when formData is missing', () => {
        expect(getRequestedPersonAtIndex(undefined, 0)).to.equal(undefined);
      });

      it('returns undefined when the parent array is missing', () => {
        expect(getRequestedPersonAtIndex({}, 0)).to.equal(undefined);
      });

      it('returns the element at the given index', () => {
        const person = { [personFields.ssn]: '123' };
        expect(
          getRequestedPersonAtIndex(
            { [personFields.parentObject]: [person] },
            0,
          ),
        ).to.equal(person);
      });
    });

    describe('getStepchildLivesWithVeteranValue', () => {
      it('returns the nested value when present', () => {
        expect(
          getStepchildLivesWithVeteranValue(
            {
              [personFields.parentObject]: [
                { [personFields.stepchildLivesWithVeteran]: false },
              ],
            },
            0,
          ),
        ).to.equal(false);
      });

      it('returns undefined when the person is missing', () => {
        expect(getStepchildLivesWithVeteranValue({}, 0)).to.equal(undefined);
      });
    });

    describe('isNegativeSelection', () => {
      it('treats false and "N" as negative', () => {
        expect(isNegativeSelection(false)).to.equal(true);
        expect(isNegativeSelection('N')).to.equal(true);
      });

      it('treats everything else as non-negative', () => {
        expect(isNegativeSelection(true)).to.equal(false);
        expect(isNegativeSelection('Y')).to.equal(false);
        expect(isNegativeSelection(undefined)).to.equal(false);
        expect(isNegativeSelection(null)).to.equal(false);
      });
    });

    describe('options.isItemIncomplete', () => {
      const completeItem = {
        [personFields.fullName]: { first: 'Jane', last: 'Doe' },
        [personFields.ssn]: '123456789',
        [personFields.veteranRelationshipDescription]: 'Spouse',
        [personFields.receivesApportionmentNow]: false,
        [personFields.adoptedChildrenQuestion]: false,
      };

      it('reports complete when every required field is filled', () => {
        expect(options.isItemIncomplete(completeItem)).to.equal(false);
      });

      it('flags missing full name', () => {
        expect(
          options.isItemIncomplete({
            ...completeItem,
            [personFields.fullName]: undefined,
          }),
        ).to.equal(true);
      });

      it('flags missing ssn', () => {
        expect(
          options.isItemIncomplete({
            ...completeItem,
            [personFields.ssn]: undefined,
          }),
        ).to.equal(true);
      });

      it('flags missing relationship description', () => {
        expect(
          options.isItemIncomplete({
            ...completeItem,
            [personFields.veteranRelationshipDescription]: undefined,
          }),
        ).to.equal(true);
      });

      it('flags an undefined receivesApportionmentNow', () => {
        expect(
          options.isItemIncomplete({
            ...completeItem,
            [personFields.receivesApportionmentNow]: undefined,
          }),
        ).to.equal(true);
      });

      it('requires stepchildLivesWithVeteran when currently receiving apportionment', () => {
        expect(
          options.isItemIncomplete({
            ...completeItem,
            [personFields.receivesApportionmentNow]: true,
            [personFields.stepchildLivesWithVeteran]: undefined,
          }),
        ).to.equal(true);
      });

      it('requires stepchildDepartureDate when stepchild no longer lives with the veteran', () => {
        expect(
          options.isItemIncomplete({
            ...completeItem,
            [personFields.receivesApportionmentNow]: true,
            [personFields.stepchildLivesWithVeteran]: false,
            [personFields.stepchildDepartureDate]: undefined,
          }),
        ).to.equal(true);

        expect(
          options.isItemIncomplete({
            ...completeItem,
            [personFields.receivesApportionmentNow]: true,
            [personFields.stepchildLivesWithVeteran]: false,
            [personFields.stepchildDepartureDate]: '2024-01-15',
          }),
        ).to.equal(false);
      });

      it('flags missing adoptedChildrenQuestion', () => {
        expect(
          options.isItemIncomplete({
            ...completeItem,
            [personFields.adoptedChildrenQuestion]: undefined,
          }),
        ).to.equal(true);
      });

      it('handles a fully undefined/null item without throwing', () => {
        expect(options.isItemIncomplete(undefined)).to.equal(true);
        expect(options.isItemIncomplete(null)).to.equal(true);
        expect(options.isItemIncomplete({})).to.equal(true);
      });
    });

    describe('options.text', () => {
      it('getItemName routes through buildPersonName', () => {
        expect(
          options.text.getItemName({
            [personFields.fullName]: { first: 'Jane', last: 'Doe' },
          }),
        ).to.equal('Jane Doe');
        expect(options.text.getItemName({})).to.equal('Requested person');
      });

      it('cardDescription includes relationship and apportionment status', () => {
        const description = options.text.cardDescription({
          [personFields.veteranRelationshipDescription]: 'Spouse',
          [personFields.receivesApportionmentNow]: true,
        });
        expect(description).to.include('Spouse');
        expect(description).to.include('Currently receives apportionment');
      });

      it('cardDescription flips copy when not currently receiving apportionment', () => {
        const description = options.text.cardDescription({
          [personFields.veteranRelationshipDescription]: 'Child',
          [personFields.receivesApportionmentNow]: false,
        });
        expect(description).to.include('Child');
        expect(description).to.include(
          'Does not currently receive apportionment',
        );
      });

      it('cardDescription is empty when nothing has been filled in', () => {
        expect(options.text.cardDescription({})).to.equal('');
      });

      it('cardDescription handles only relationship without receipt answer', () => {
        expect(
          options.text.cardDescription({
            [personFields.veteranRelationshipDescription]: 'Dependent parent',
          }),
        ).to.equal('Dependent parent');
      });
    });

    describe('options metadata', () => {
      it('pins the required array-builder config', () => {
        expect(options.arrayPath).to.equal(personFields.parentObject);
        expect(options.nounSingular).to.equal(
          apportionmentInformationText.requestedPeopleNounSingular,
        );
        expect(options.nounPlural).to.equal(
          apportionmentInformationText.requestedPeopleNounPlural,
        );
        expect(options.required).to.equal(true);
        expect(options.maxItems).to.equal(4);
      });
    });
  });
});
