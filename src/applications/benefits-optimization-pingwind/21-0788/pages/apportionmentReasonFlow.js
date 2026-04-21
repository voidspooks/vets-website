import React from 'react';
import {
  radioSchema,
  radioUI,
  textareaUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import {
  apportionmentFields,
  apportionmentInformationText,
} from '../definitions/constants';

const reasonOptions = [
  'veteranIncarcerated',
  'survivingBeneficiaryIncarcerated',
  'veteranIncompetentInCare',
  'veteranReceivingPensionInCare',
  'beneficiaryInEnemyTerritory',
  'veteranDisappeared',
];

const convictionTypeOptions = ['felony', 'misdemeanor'];

const convictionReasonOptions = [
  'veteranIncarcerated',
  'survivingBeneficiaryIncarcerated',
];

const facilityReasonOptions = [
  'veteranIncarcerated',
  'survivingBeneficiaryIncarcerated',
  'veteranIncompetentInCare',
  'veteranReceivingPensionInCare',
];

const getSelectedReason = formData =>
  formData?.[apportionmentFields.parentObject]?.[
    apportionmentFields.apportionmentClaimReason
  ];

const needsConvictionType = formData =>
  convictionReasonOptions.includes(getSelectedReason(formData));

const needsFacilityInformation = formData =>
  facilityReasonOptions.includes(getSelectedReason(formData));

const reasonPageDescription = (
  <VaAlert status="info" uswds visible>
    <p className="vads-u-margin--0">
      {apportionmentInformationText.q13IntroDescription}
    </p>
  </VaAlert>
);

export default {
  apportionmentReasonPage: {
    path: 'reason-for-apportionment-claim',
    title: apportionmentInformationText.q13aPageTitle,
    uiSchema: {
      ...titleUI(
        apportionmentInformationText.q13aPageTitle,
        reasonPageDescription,
      ),
      [apportionmentFields.parentObject]: {
        [apportionmentFields.apportionmentClaimReason]: radioUI({
          title: apportionmentInformationText.q13aReasonTitle,
          labels: apportionmentInformationText.q13aReasonLabels,
        }),
        [apportionmentFields.incarcerationConvictionType]: {
          ...radioUI({
            title:
              apportionmentInformationText.convictionFelonyOrMisdemeanorTitle,
            labels: apportionmentInformationText.convictionTypeLabels,
          }),
          'ui:options': {
            hideIf: formData => !needsConvictionType(formData),
            hideEmptyValueInReview: true,
          },
          'ui:required': formData => needsConvictionType(formData),
          'ui:errorMessages': {
            required: apportionmentInformationText.convictionTypeError,
          },
        },
        'ui:options': {
          updateSchema: (formData, formSchema) => {
            const required = [apportionmentFields.apportionmentClaimReason];

            if (needsConvictionType(formData)) {
              required.push(apportionmentFields.incarcerationConvictionType);
            }

            return {
              ...formSchema,
              required,
            };
          },
        },
      },
    },
    schema: {
      type: 'object',
      properties: {
        [apportionmentFields.parentObject]: {
          type: 'object',
          properties: {
            [apportionmentFields.apportionmentClaimReason]: radioSchema(
              reasonOptions,
            ),
            [apportionmentFields.incarcerationConvictionType]: radioSchema(
              convictionTypeOptions,
            ),
          },
          required: [apportionmentFields.apportionmentClaimReason],
        },
      },
    },
  },
  facilityInformationPage: {
    path: 'facility-information',
    title: apportionmentInformationText.q13bPageTitle,
    uiSchema: {
      ...titleUI(
        apportionmentInformationText.q13bPageTitle,
        apportionmentInformationText.facilityPageDescription,
      ),
      [apportionmentFields.parentObject]: {
        [apportionmentFields.facilityName]: {
          'ui:title': apportionmentInformationText.facilityNameTitle,
          'ui:required': formData => needsFacilityInformation(formData),
        },
        [apportionmentFields.facilityAddress]: textareaUI({
          title: apportionmentInformationText.facilityAddressTitle,
          required: formData => needsFacilityInformation(formData),
        }),
      },
    },
    schema: {
      type: 'object',
      properties: {
        [apportionmentFields.parentObject]: {
          type: 'object',
          properties: {
            [apportionmentFields.facilityName]: {
              type: 'string',
              maxLength: 150,
            },
            [apportionmentFields.facilityAddress]: {
              type: 'string',
              maxLength: 500,
            },
          },
          required: [],
        },
      },
    },
  },
};
