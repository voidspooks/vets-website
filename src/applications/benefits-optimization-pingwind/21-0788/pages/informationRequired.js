import React from 'react';
import { VaSummaryBox } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import {
  checkboxRequiredSchema,
  checkboxUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { informationRequiredText } from '../definitions/constants';

const fieldNames = {
  formPurposeAcknowledged: 'formPurposeAcknowledged',
  privacyActAcknowledged: 'privacyActAcknowledged',
};

export default {
  path: 'information-we-are-required-to-share',
  title: informationRequiredText.pageTitle,
  uiSchema: {
    ...titleUI(informationRequiredText.pageTitle),
    'ui:order': [
      fieldNames.formPurposeAcknowledged,
      fieldNames.privacyActAcknowledged,
    ],
    [fieldNames.formPurposeAcknowledged]: checkboxUI({
      title: informationRequiredText.aboutFormTitle,
      required: () => true,
      marginTop: 0,
      description: (
        <VaSummaryBox uswds>
          <h2 slot="headline">{informationRequiredText.aboutFormHeadline}</h2>
          <p>{informationRequiredText.aboutFormDescription}</p>
        </VaSummaryBox>
      ),
      errorMessages: {
        enum: informationRequiredText.aboutFormError,
        required: informationRequiredText.aboutFormError,
      },
    }),
    [fieldNames.privacyActAcknowledged]: checkboxUI({
      title: informationRequiredText.privacyActTitle,
      required: () => true,
      marginTop: 0,
      description: (
        <VaSummaryBox uswds class="vads-u-margin-top--4">
          <h2 slot="headline">{informationRequiredText.privacyActHeadline}</h2>
          <p>{informationRequiredText.privacyActDescription}</p>
        </VaSummaryBox>
      ),
      errorMessages: {
        enum: informationRequiredText.privacyActError,
        required: informationRequiredText.privacyActError,
      },
    }),
  },
  schema: {
    type: 'object',
    required: [
      fieldNames.formPurposeAcknowledged,
      fieldNames.privacyActAcknowledged,
    ],
    properties: {
      [fieldNames.formPurposeAcknowledged]: checkboxRequiredSchema,
      [fieldNames.privacyActAcknowledged]: checkboxRequiredSchema,
    },
  },
};
