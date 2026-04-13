// @ts-check
import React from 'react';
import { titleUI } from 'platform/forms-system/src/js/web-component-patterns';
import {
  checkboxRequiredSchema,
  checkboxUI,
} from 'platform/forms-system/src/js/web-component-patterns/checkboxPattern';
import { FORM_10_8678 } from '../definitions/constants';

const T = FORM_10_8678.BENEFIT_TERMINATION_CERTIFICATION;

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(T.TITLE, T.DESCRIPTION),

    'view:benefitTerminationCertificationIntro': {
      'ui:description': (
        <div className="vads-u-margin-top--2">
          <h2 className="vads-u-font-size--h3 vads-u-margin-top--0 vads-u-margin-bottom--1">
            {T.CERTIFICATION.TITLE}
          </h2>
          <p className="vads-u-margin-top--0 vads-u-margin-bottom--2">
            {T.CERTIFICATION.BODY}
          </p>
        </div>
      ),
    },

    benefitTerminationCertificationAccepted: checkboxUI({
      title: T.CERTIFICATION.CHECKBOX_LABEL,
      errorMessages: {
        required: T.CERTIFICATION.ERROR_MESSAGE,
      },
    }),

    'view:penaltyNotice': {
      'ui:description': (
        <div className="vads-u-background-color--gold-lightest vads-u-padding--2 vads-u-margin-top--3">
          <h2 className="vads-u-font-size--h3 vads-u-margin-top--0 vads-u-margin-bottom--1">
            {T.PENALTY.TITLE}
          </h2>
          <p className="vads-u-margin-y--0">{T.PENALTY.BODY}</p>
        </div>
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
