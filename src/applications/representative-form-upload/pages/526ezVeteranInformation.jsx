import React from 'react';
import PropTypes from 'prop-types';
import {
  addressSchema,
  addressUI,
  firstNameLastNameNoSuffixSchema,
  firstNameLastNameNoSuffixUI,
  vaFileNumberUI,
  vaFileNumberSchema,
  ssnSchema,
  ssnUI,
  dateOfBirthUI,
  dateOfBirthSchema,
  checkboxGroupUI,
  checkboxGroupSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  emptyObjectSchema,
  claimantTitleAndDescription,
  CustomAlertPage,
  BddCheckbox,
} from './helpers';
import ClaimantInfoViewField from '../components/ClaimantInfoViewField';

/** @type {PageSchema} */
export const veteranInformationPage = {
  uiSchema: {
    ...claimantTitleAndDescription,
    'ui:objectViewField': ClaimantInfoViewField,
    veteranFullName: firstNameLastNameNoSuffixUI(),
    address: addressUI({
      labels: {
        postalCode: 'Postal code',
      },
      omit: [
        'country',
        'city',
        'isMilitary',
        'state',
        'street',
        'street2',
        'street3',
      ],
      required: true,
    }),
    veteranSsn: ssnUI(),
    veteranDateOfBirth: dateOfBirthUI(),
    vaFileNumber: {
      ...vaFileNumberUI,
      'ui:title': 'VA file number',
    },
    selectBddClaim: checkboxGroupUI({
      title: 'Benefits Delivery at Discharge (BDD)',
      description:
        'If this is a Benefits Delivery at Discharge (BDD) claim, you’ll need to include a completed Separation Health Assessment - Part A Self-Assessment form.',
      labelHeaderLevel: '3',
      required: false,
      labels: BddCheckbox,
      classNames: 'form__checkbox',
      hideIf: formData =>
        !formData?.accreditedRepresentativePortalEnable526ezBdd,
    }),
  },
  schema: {
    type: 'object',
    properties: {
      'view:claimantTitle': emptyObjectSchema,
      'view:claimantDescription': emptyObjectSchema,
      veteranFullName: firstNameLastNameNoSuffixSchema,
      veteranSsn: ssnSchema,
      veteranDateOfBirth: dateOfBirthSchema,
      address: addressSchema({
        omit: [
          'country',
          'city',
          'isMilitary',
          'state',
          'street',
          'street2',
          'street3',
        ],
      }),
      vaFileNumber: vaFileNumberSchema,
      selectBddClaim: checkboxGroupSchema(Object.keys(BddCheckbox)),
    },
    required: [
      'veteranSsn',
      'veteranDateOfBirth',
      'address',
      'veteranFullName',
    ],
  },
};
/** @type {CustomPageType} */
export function VeteranInformationPage(props) {
  return <CustomAlertPage {...props} />;
}

VeteranInformationPage.propTypes = {
  name: PropTypes.string.isRequired,
  schema: PropTypes.object.isRequired,
  uiSchema: PropTypes.object.isRequired,
  appStateData: PropTypes.object,
  contentAfterButtons: PropTypes.node,
  contentBeforeButtons: PropTypes.node,
  data: PropTypes.object,
  formContext: PropTypes.object,
  goBack: PropTypes.func,
  pagePerItemIndex: PropTypes.number,
  title: PropTypes.string,
  trackingPrefix: PropTypes.string,
  onChange: PropTypes.func,
  onContinue: PropTypes.func,
  onReviewPage: PropTypes.bool,
  onSubmit: PropTypes.func,
};
