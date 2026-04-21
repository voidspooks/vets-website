import React from 'react';
import { cloneDeep } from 'lodash';
import {
  currentOrPastDateUI,
  fullNameNoSuffixSchema,
  fullNameNoSuffixUI,
  ssnSchema,
  ssnUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import VaDateField from 'platform/forms-system/src/js/web-component-fields/VaDateField';
import {
  currentYear,
  parseISODate,
} from 'platform/forms-system/src/js/helpers';
import { isValidDate } from 'platform/forms-system/src/js/utilities/validations';
import {
  veteranFields,
  veteranInformationText,
} from '../definitions/constants';

const veteranFullNameUI = cloneDeep(fullNameNoSuffixUI());
veteranFullNameUI.first['ui:title'] = veteranInformationText.firstNameTitle;
veteranFullNameUI.first['ui:errorMessages'] = {
  required: veteranInformationText.firstNameError,
};
veteranFullNameUI.middle['ui:title'] =
  veteranInformationText.middleInitialTitle;
veteranFullNameUI.last['ui:title'] = veteranInformationText.lastNameTitle;
veteranFullNameUI.last['ui:errorMessages'] = {
  required: veteranInformationText.lastNameError,
};

const veteranFullNameSchema = cloneDeep(fullNameNoSuffixSchema);
if (veteranFullNameSchema?.properties?.middle) {
  veteranFullNameSchema.properties.middle.maxLength = 1;
}

const validateDateOfBirth = (errors, value) => {
  const { day, month, year } = parseISODate(value);
  const hasAnyDatePart = [day, month, year].some(Boolean);
  const hasCompleteDate = [day, month, year].every(Boolean);

  if (!value || !hasAnyDatePart) {
    errors.addError(veteranInformationText.dateOfBirthRequiredError);
    return;
  }

  if (!hasCompleteDate) {
    errors.addError(veteranInformationText.dateOfBirthIncompleteError);
    return;
  }

  if (
    Number(year) < 1900 ||
    Number(year) > currentYear ||
    !isValidDate(day, month, year)
  ) {
    errors.addError(veteranInformationText.dateOfBirthPatternError);
  }
};

export default {
  uiSchema: {
    ...titleUI(
      veteranInformationText.pageTitle,
      veteranInformationText.pageDescription,
    ),
    'ui:options': { preserveHiddenData: true },
    [veteranFields.parentObject]: {
      'ui:description': <h2>{veteranInformationText.basicInfoHeading}</h2>,
      [veteranFields.fullName]: veteranFullNameUI,
      [veteranFields.dateOfBirth]: {
        ...currentOrPastDateUI({
          title: veteranInformationText.dateOfBirthTitle,
          hint: veteranInformationText.dateOfBirthHint,
          required: () => true,
          errorMessages: {
            required: veteranInformationText.dateOfBirthRequiredError,
            pattern: veteranInformationText.dateOfBirthPatternError,
          },
        }),
        'ui:options': {
          hint: veteranInformationText.dateOfBirthHint,
        },
        'ui:webComponentField': VaDateField,
        'ui:errorMessages': {
          required: veteranInformationText.dateOfBirthRequiredError,
          pattern: veteranInformationText.dateOfBirthPatternError,
        },
        'ui:validations': [validateDateOfBirth],
      },
      [veteranFields.ssn]: {
        ...ssnUI(),
        'ui:errorMessages': {
          pattern: veteranInformationText.ssnPatternError,
          required: veteranInformationText.ssnRequiredError,
        },
      },
      [veteranFields.vaFileNumber]: {
        'ui:title': veteranInformationText.vaFileNumberTitle,
        'ui:options': {
          hideEmptyValueInReview: true,
        },
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [veteranFields.parentObject]: {
        type: 'object',
        properties: {
          [veteranFields.fullName]: veteranFullNameSchema,
          [veteranFields.dateOfBirth]: { type: 'string' },
          [veteranFields.ssn]: ssnSchema,
          [veteranFields.vaFileNumber]: { type: 'string', maxLength: 20 },
        },
        required: [
          veteranFields.fullName,
          veteranFields.dateOfBirth,
          veteranFields.ssn,
        ],
      },
    },
  },
};
