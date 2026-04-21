import { expect } from 'chai';
import apportionmentReasonFlow from '../../../pages/apportionmentReasonFlow';
import {
  apportionmentFields,
  apportionmentInformationText,
} from '../../../definitions/constants';

describe('21-0788 apportionmentReasonFlow pages', () => {
  const {
    apportionmentReasonPage,
    facilityInformationPage,
  } = apportionmentReasonFlow;

  const reasonParent =
    apportionmentReasonPage.uiSchema[apportionmentFields.parentObject];
  const facilityParent =
    facilityInformationPage.uiSchema[apportionmentFields.parentObject];

  const buildFormData = reason => ({
    [apportionmentFields.parentObject]: {
      [apportionmentFields.apportionmentClaimReason]: reason,
    },
  });

  describe('apportionmentReasonPage', () => {
    it('exports the expected path and title', () => {
      expect(apportionmentReasonPage.path).to.equal(
        'reason-for-apportionment-claim',
      );
      expect(apportionmentReasonPage.title).to.equal(
        apportionmentInformationText.q13aPageTitle,
      );
    });

    it('defines schema with the reason and conviction-type fields', () => {
      const { properties } = apportionmentReasonPage.schema.properties[
        apportionmentFields.parentObject
      ];

      expect(
        properties[apportionmentFields.apportionmentClaimReason].enum,
      ).to.deep.equal([
        'veteranIncarcerated',
        'survivingBeneficiaryIncarcerated',
        'veteranIncompetentInCare',
        'veteranReceivingPensionInCare',
        'beneficiaryInEnemyTerritory',
        'veteranDisappeared',
      ]);
      expect(
        properties[apportionmentFields.incarcerationConvictionType].enum,
      ).to.deep.equal(['felony', 'misdemeanor']);
    });

    it('always requires the claim-reason field at the parent level', () => {
      expect(
        apportionmentReasonPage.schema.properties[
          apportionmentFields.parentObject
        ].required,
      ).to.deep.equal([apportionmentFields.apportionmentClaimReason]);
    });

    it('hides the conviction-type field unless an incarceration reason is selected', () => {
      const convictionUi =
        reasonParent[apportionmentFields.incarcerationConvictionType];
      const { hideIf } = convictionUi['ui:options'];

      expect(hideIf(buildFormData('veteranIncarcerated'))).to.equal(false);
      expect(
        hideIf(buildFormData('survivingBeneficiaryIncarcerated')),
      ).to.equal(false);
      expect(hideIf(buildFormData('veteranIncompetentInCare'))).to.equal(true);
      expect(hideIf(buildFormData(undefined))).to.equal(true);
      expect(hideIf({})).to.equal(true);
    });

    it('marks conviction type as required only for incarceration reasons', () => {
      const convictionUi =
        reasonParent[apportionmentFields.incarcerationConvictionType];
      const isRequired = convictionUi['ui:required'];

      expect(isRequired(buildFormData('veteranIncarcerated'))).to.equal(true);
      expect(
        isRequired(buildFormData('survivingBeneficiaryIncarcerated')),
      ).to.equal(true);
      expect(isRequired(buildFormData('veteranDisappeared'))).to.equal(false);
      expect(isRequired({})).to.equal(false);
    });

    it('adds conviction type to updateSchema.required for incarceration reasons only', () => {
      const { updateSchema } = reasonParent['ui:options'];
      const formSchema = { type: 'object' };

      const incarcerated = updateSchema(
        buildFormData('veteranIncarcerated'),
        formSchema,
      );
      expect(incarcerated.required).to.deep.equal([
        apportionmentFields.apportionmentClaimReason,
        apportionmentFields.incarcerationConvictionType,
      ]);

      const nonIncarcerated = updateSchema(
        buildFormData('veteranDisappeared'),
        formSchema,
      );
      expect(nonIncarcerated.required).to.deep.equal([
        apportionmentFields.apportionmentClaimReason,
      ]);

      const empty = updateSchema({}, formSchema);
      expect(empty.required).to.deep.equal([
        apportionmentFields.apportionmentClaimReason,
      ]);
    });

    it('surfaces the expected error message for missing conviction type', () => {
      const convictionUi =
        reasonParent[apportionmentFields.incarcerationConvictionType];

      expect(convictionUi['ui:errorMessages'].required).to.equal(
        apportionmentInformationText.convictionTypeError,
      );
    });
  });

  describe('facilityInformationPage', () => {
    it('exports the expected path and title', () => {
      expect(facilityInformationPage.path).to.equal('facility-information');
      expect(facilityInformationPage.title).to.equal(
        apportionmentInformationText.q13bPageTitle,
      );
    });

    it('defines facility name and address with correct maxLengths', () => {
      const { properties } = facilityInformationPage.schema.properties[
        apportionmentFields.parentObject
      ];

      expect(properties[apportionmentFields.facilityName].maxLength).to.equal(
        150,
      );
      expect(
        properties[apportionmentFields.facilityAddress].maxLength,
      ).to.equal(500);
    });

    it('requires facility fields only for in-care / incarceration reasons', () => {
      const nameRequired =
        facilityParent[apportionmentFields.facilityName]['ui:required'];
      const addressRequiredFn = uiNode => {
        return uiNode['ui:required'] || uiNode['ui:options']?.required;
      };

      expect(nameRequired(buildFormData('veteranIncarcerated'))).to.equal(true);
      expect(nameRequired(buildFormData('veteranIncompetentInCare'))).to.equal(
        true,
      );
      expect(nameRequired(buildFormData('veteranDisappeared'))).to.equal(false);
      expect(nameRequired({})).to.equal(false);

      const addressRequired = addressRequiredFn(
        facilityParent[apportionmentFields.facilityAddress],
      );
      if (typeof addressRequired === 'function') {
        expect(addressRequired(buildFormData('veteranIncarcerated'))).to.equal(
          true,
        );
        expect(addressRequired(buildFormData('veteranDisappeared'))).to.equal(
          false,
        );
      }
    });
  });
});
