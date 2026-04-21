import React from 'react';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import {
  checkboxRequiredSchema,
  checkboxUI,
  textareaUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { remarksCertificationText } from '../definitions/constants';

export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(
      remarksCertificationText.pageTitle,
      remarksCertificationText.pageDescription,
    ),
    remarks: textareaUI({
      title: remarksCertificationText.remarksTitle,
      required: () => false,
    }),
    certifyStatement: checkboxUI({
      title: remarksCertificationText.certifyTitle,
      required: () => true,
      classNames:
        'vads-u-background-color--gray-lightest vads-u-padding--4 vads-u-margin-bottom--4',
      errorMessages: {
        enum: remarksCertificationText.certifyError,
        required: remarksCertificationText.certifyError,
      },
    }),
    'view:penaltyAlert': {
      'ui:field': 'ViewField',
      'ui:description': (
        <VaAlert status="warning" uswds visible>
          <h2 slot="headline" className="vads-u-font-weight--bold">
            {remarksCertificationText.penaltyHeadline}
          </h2>
          <p className="vads-u-margin--0">
            {remarksCertificationText.penaltyBody}
          </p>
        </VaAlert>
      ),
    },
    'ui:order': ['remarks', 'certifyStatement', 'view:penaltyAlert'],
  },
  schema: {
    type: 'object',
    properties: {
      remarks: {
        type: 'string',
        maxLength: 2000,
      },
      certifyStatement: checkboxRequiredSchema,
      'view:penaltyAlert': {
        type: 'object',
        properties: {},
      },
    },
    required: ['certifyStatement'],
  },
};
