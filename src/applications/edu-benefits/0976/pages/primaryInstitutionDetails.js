import React from 'react';
import {
  titleUI,
  textUI,
  textSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import InstitutionSelector from '../components/InstitutionSelector';

// here we're checking for both a well-formatted facility code,
// AND that a valid institution has been fetched and stored in
// formData
const facilityCodeUIValidation = (errors, fieldData, formData) => {
  const facilityCode = (fieldData || '').trim();

  const badFormat = facilityCode && !/^[a-zA-Z0-9]{8}$/.test(facilityCode);

  const { failedToLoad } = formData.primaryInstitutionDetails;

  const firstDigitError =
    Number(facilityCode[0]) === 0 || Number(facilityCode[0]) > 3;
  const thirdDigitError =
    Number(facilityCode[2]) === 0 || Number(facilityCode[2]) > 4;

  const lastDigits = Number(facilityCode[6] + facilityCode[7]);
  const lastDigitsError = lastDigits <= 51 || lastDigits === 64;

  const errorMessage =
    'Enter a valid facility code. You can only enter a facility code for a foreign institution of higher learning.';

  if (
    badFormat ||
    (!badFormat && failedToLoad) ||
    firstDigitError ||
    thirdDigitError ||
    lastDigitsError
  ) {
    errors.addError(errorMessage);
  }
};

export default {
  uiSchema: {
    ...titleUI(
      'If your institution has a VA facility code, please enter it now',
    ),
    primaryInstitutionDetails: {
      facilityCode: {
        ...textUI({
          title: 'Facility code',
          errorMessages: {
            required:
              'Enter a valid facility code. To determine your facility code, refer to your WEAMS 22-1998 Report or contact your ELR.',
          },
        }),
        'ui:validations': [facilityCodeUIValidation],
      },
      'view:institutionSelector': {
        'ui:description': (
          <InstitutionSelector dataPath="primaryInstitutionDetails" />
        ),
      },
    },
  },

  schema: {
    type: 'object',
    properties: {
      primaryInstitutionDetails: {
        type: 'object',
        properties: {
          facilityCode: { ...textSchema, minLength: 8, maxLength: 8 },
          'view:institutionSelector': { type: 'object', properties: {} },
        },
        required: ['facilityCode'],
      },
    },
  },
};
