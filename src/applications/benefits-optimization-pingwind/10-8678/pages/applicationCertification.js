// @ts-check
import React from 'react';
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

    'view:applicationCertificationIntro': {
      'ui:description': (
        <div className="vads-u-margin-top--2">
          <h2 className="vads-u-font-size--h3 vads-u-margin-top--0 vads-u-margin-bottom--1">
            {APPLICATION_CERTIFICATION.CERTIFICATION_SECTION.TITLE}
          </h2>
          <p className="vads-u-margin-top--0 vads-u-margin-bottom--2">
            {APPLICATION_CERTIFICATION.CERTIFICATION_SECTION.BODY}
          </p>
        </div>
      ),
    },

    applicationCertificationAccepted: checkboxUI({
      title: APPLICATION_CERTIFICATION.CERTIFICATION_SECTION.CHECKBOX_LABEL,
      errorMessages: {
        required: APPLICATION_CERTIFICATION.CERTIFICATION_SECTION.ERROR_MESSAGE,
      },
    }),

    'view:penaltyNotice': {
      'ui:description': (
        <div className="vads-u-background-color--gold-lightest vads-u-padding--2 vads-u-margin-top--3">
          <h2 className="vads-u-font-size--h3 vads-u-margin-top--0 vads-u-margin-bottom--1">
            {APPLICATION_CERTIFICATION.PENALTY.TITLE}
          </h2>
          <p className="vads-u-margin-y--0">
            {APPLICATION_CERTIFICATION.PENALTY.BODY}
          </p>
        </div>
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
