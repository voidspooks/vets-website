// @ts-check
import React from 'react';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { titleUI } from 'platform/forms-system/src/js/web-component-patterns';
import {
  checkboxRequiredSchema,
  checkboxUI,
} from 'platform/forms-system/src/js/web-component-patterns/checkboxPattern';
import { FORM_10_8678 } from '../definitions/constants';

const { TERMINATION_CERTIFICATION } = FORM_10_8678;

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(
      TERMINATION_CERTIFICATION.TITLE,
      TERMINATION_CERTIFICATION.DESCRIPTION,
    ),

    benefitTerminationCertificationAccepted: checkboxUI({
      title: TERMINATION_CERTIFICATION.CERTIFICATION.CHECKBOX_LABEL,
      description: (
        <>
          <p className="vads-u-font-weight--bold vads-u-margin-top--0 vads-u-margin-bottom--2">
            {TERMINATION_CERTIFICATION.CERTIFICATION.TITLE}
          </p>
          <p className="vads-u-margin-top--0 vads-u-margin-bottom--2">
            {TERMINATION_CERTIFICATION.CERTIFICATION.BODY}
          </p>
        </>
      ),
      required: () => true,
      classNames:
        'vads-u-background-color--gray-lightest vads-u-padding--4 vads-u-margin-bottom--4',
      errorMessages: {
        required: TERMINATION_CERTIFICATION.CERTIFICATION.ERROR_MESSAGE,
      },
    }),

    'view:penaltyNotice': {
      'ui:field': 'ViewField',
      'ui:description': (
        <VaAlert status="warning" uswds visible>
          <h2 slot="headline" className="vads-u-font-weight--bold">
            {TERMINATION_CERTIFICATION.PENALTY.TITLE}
          </h2>
          <p className="vads-u-margin--0">
            {TERMINATION_CERTIFICATION.PENALTY.BODY}
          </p>
        </VaAlert>
      ),
    },
  },

  schema: {
    type: 'object',
    required: ['benefitTerminationCertificationAccepted'],
    properties: {
      'view:benefitTerminationCertificationIntro': {
        type: 'object',
        properties: {},
      },
      benefitTerminationCertificationAccepted: checkboxRequiredSchema,
      'view:penaltyNotice': {
        type: 'object',
        properties: {},
      },
    },
  },
};
