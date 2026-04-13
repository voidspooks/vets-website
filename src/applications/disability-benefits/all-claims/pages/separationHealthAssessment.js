import React from 'react';
import PropTypes from 'prop-types';
import {
  yesNoUI,
  yesNoSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { SeparationHealthAssessmentWarningAlert } from '../content/separationHealthAssessmentWarningAlert';

const ShaConfirmationField = ({ formData }) => {
  const value = formData?.['view:hasSeparationHealthAssessment'];

  return (
    <li>
      <h4>Separation Health Assessment that supports your disability claim</h4>
      <ul className="vads-u-padding--0" style={{ listStyle: 'none' }}>
        <li className="vads-u-line-height--6 vads-u-padding-bottom--1">
          <div className="vads-u-color--gray">
            Do you want to upload your Separation Health Assessment with this
            claim submission?
          </div>
          <div>
            {value ? "Yes, I'll submit it now" : "No, I'll submit it later"}
          </div>
        </li>
      </ul>
    </li>
  );
};

ShaConfirmationField.propTypes = {
  formData: PropTypes.shape({
    'view:hasSeparationHealthAssessment': PropTypes.bool,
  }),
};

export const uiSchema = {
  'ui:confirmationField': ShaConfirmationField,
  'view:separationHealthAssessmentAlertWarning': {
    'ui:title': () => (
      <h3 className="vads-u-margin--0">Your Separation Health Assessment</h3>
    ),
    'ui:description': SeparationHealthAssessmentWarningAlert,
  },
  'view:hasSeparationHealthAssessment': yesNoUI({
    title:
      'Do you want to upload your Separation Health Assessment with this claim submission?',
    labels: {
      Y: "Yes, I'll submit it now",
      N: "No, I'll submit it later",
    },
  }),
};

export const schema = {
  required: ['view:hasSeparationHealthAssessment'],
  type: 'object',
  properties: {
    'view:separationHealthAssessmentAlertWarning': {
      type: 'object',
      properties: {},
    },
    'view:hasSeparationHealthAssessment': yesNoSchema,
  },
};
