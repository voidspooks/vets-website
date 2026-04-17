// @ts-check
import React from 'react';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { titleUI } from 'platform/forms-system/src/js/web-component-patterns';
import {
  checkboxRequiredSchema,
  checkboxUI,
} from 'platform/forms-system/src/js/web-component-patterns/checkboxPattern';
import { FORM_10_8678 } from '../definitions/constants';

const { APPLICATION_CERTIFICATION } = FORM_10_8678;

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(
      APPLICATION_CERTIFICATION.TITLE,
      APPLICATION_CERTIFICATION.DESCRIPTION,
    ),

    applicationCertificationAccepted: checkboxUI({
      title: APPLICATION_CERTIFICATION.CERTIFICATION_SECTION.CHECKBOX_LABEL,
      description: (
        <>
          <p className="vads-u-font-weight--bold vads-u-margin-top--0 vads-u-margin-bottom--2">
            {APPLICATION_CERTIFICATION.CERTIFICATION_SECTION.TITLE}
          </p>
          <p className="vads-u-margin-top--0 vads-u-margin-bottom--2">
            {APPLICATION_CERTIFICATION.CERTIFICATION_SECTION.BODY}
          </p>
        </>
      ),
      required: () => true,
      classNames:
        'vads-u-background-color--gray-lightest vads-u-padding--4 vads-u-margin-bottom--4',
      errorMessages: {
        enum: APPLICATION_CERTIFICATION.CERTIFICATION_SECTION.ERROR_MESSAGE,
        required: APPLICATION_CERTIFICATION.CERTIFICATION_SECTION.ERROR_MESSAGE,
      },
    }),

    'view:penaltyNotice': {
      'ui:field': 'ViewField',
      'ui:description': (
        <VaAlert status="warning" uswds visible>
          <h2 slot="headline" className="vads-u-font-weight--bold">
            {APPLICATION_CERTIFICATION.PENALTY.TITLE}
          </h2>
          <p className="vads-u-margin--0">
            {APPLICATION_CERTIFICATION.PENALTY.BODY}
          </p>
        </VaAlert>
      ),
    },
  },

  schema: {
    type: 'object',
    required: ['applicationCertificationAccepted'],
    properties: {
      'view:applicationCertificationIntro': {
        type: 'object',
        properties: {},
      },
      applicationCertificationAccepted: checkboxRequiredSchema,
      'view:penaltyNotice': {
        type: 'object',
        properties: {},
      },
    },
  },
};
