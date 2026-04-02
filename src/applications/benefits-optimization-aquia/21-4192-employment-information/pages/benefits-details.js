/**
 * @module config/form/pages/benefits-details
 * @description Standard form system configuration for Benefits Details page
 * VA Form 21-4192 - Request for Employment Information
 */

import {
  textareaUI,
  currencyUI,
  currencySchema,
  currentOrPastDateUI,
  currentOrPastDateSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import commonDefinitions from 'vets-json-schema/dist/definitions.json';
import { isValidDateRange } from 'platform/forms-system/src/js/utilities/validations';
import { convertToDateField } from 'platform/forms-system/src/js/validation';
import { getVeteranName } from './helpers';
import { MemorableDateUI } from '../components/memorable-date-ui';
import { isDateAfterDOB } from '../../shared/utils/validators';

/**
 * Generate title for start receiving date field
 */
const getStartReceivingDateTitle = formData => {
  if (!formData || typeof formData !== 'object') return 'Start receiving date';
  const veteranName = getVeteranName(formData);
  return `When did ${veteranName} start receiving this benefit?`;
};

/**
 * Generate title for first payment date field
 */
const getFirstPaymentDateTitle = formData => {
  if (!formData || typeof formData !== 'object') return 'First payment date';
  const veteranName = getVeteranName(formData);
  return `When did ${veteranName} receive their first payment for this benefit?`;
};

/**
 * Generate title for stop receiving date field
 */
const getStopReceivingDateTitle = formData => {
  if (!formData || typeof formData !== 'object') return 'Stop receiving date';
  const veteranName = getVeteranName(formData);
  return `When will ${veteranName} no longer receive this benefit (if known)?`;
};

const validateDateBeforeStartReceivingDate = (errors, fieldData) => {
  const startDate = convertToDateField(
    fieldData?.benefitsDetails?.startReceivingDate,
  );
  const stopDate = convertToDateField(
    fieldData?.benefitsDetails?.stopReceivingDate,
  );
  const firstPaymentDate = convertToDateField(
    fieldData?.benefitsDetails?.firstPaymentDate,
  );
  if (startDate && stopDate && !isValidDateRange(startDate, stopDate)) {
    errors.benefitsDetails.stopReceivingDate.addError(
      'Stop receiving date must be after start receiving date',
    );
  }
  if (
    startDate &&
    firstPaymentDate &&
    !isValidDateRange(startDate, firstPaymentDate)
  ) {
    errors.benefitsDetails.firstPaymentDate.addError(
      'First payment date must be after start receiving date',
    );
  }
};

/**
 * uiSchema for Benefits Details page
 * Collects details about benefits received (conditional page)
 * This page is conditional - only shown if benefitEntitlement === true
 */
export const benefitsDetailsUiSchema = {
  'ui:title': 'Benefit entitlement and/or payments',
  'ui:validations': [validateDateBeforeStartReceivingDate],
  benefitsDetails: {
    benefitType: textareaUI({
      title: 'Type of benefit',
      charcount: true,
      errorMessages: {
        required: 'Benefit type is required',
        maxLength: 'Benefit type must be less than 500 characters',
      },
    }),
    grossMonthlyAmount: currencyUI({
      title: 'Gross monthly amount of benefit',
      max: 999999.99,
      errorMessages: {
        required: 'Gross monthly amount is required',
        min: 'Gross monthly amount must be at least $0',
        max: 'Gross monthly amount cannot exceed $999,999.99',
      },
    }),
    startReceivingDate: {
      ...currentOrPastDateUI({
        title: 'Start receiving date', // Default title, will be updated by updateUiSchema
        dataDogHidden: true,
        errorMessages: {
          required: 'Start date is required',
        },
      }),
      'ui:validations': [
        isDateAfterDOB(`Enter a start date after the employee's date of birth`),
      ],
    },
    firstPaymentDate: currentOrPastDateUI({
      title: 'First payment date', // Default title, will be updated by updateUiSchema
      dataDogHidden: true,
      errorMessages: {
        required: 'First payment date is required',
      },
    }),
    stopReceivingDate: MemorableDateUI({
      title: 'Stop receiving date', // Default title, will be updated by updateUiSchema
      dataDogHidden: true,
      hint: 'Enter an approximate date if the exact date is unknown.',
      required: false,
    }),
  },
  'ui:options': {
    updateUiSchema: (formData, fullData) => {
      // Evaluate dynamic field titles
      const startReceivingDateTitle = getStartReceivingDateTitle(
        fullData || formData,
      );
      const firstPaymentDateTitle = getFirstPaymentDateTitle(
        fullData || formData,
      );
      const stopReceivingDateTitle = getStopReceivingDateTitle(
        fullData || formData,
      );

      return {
        benefitsDetails: {
          'ui:options': {
            classNames: 'dd-privacy-mask',
          },
          startReceivingDate: {
            'ui:title': startReceivingDateTitle,
          },
          firstPaymentDate: {
            'ui:title': firstPaymentDateTitle,
          },
          stopReceivingDate: {
            'ui:title': stopReceivingDateTitle,
          },
        },
      };
    },
  },
};

/**
 * JSON Schema for Benefits Details page
 * Validates benefit details fields
 */
export const benefitsDetailsSchema = {
  type: 'object',
  required: ['benefitsDetails'],
  properties: {
    benefitsDetails: {
      type: 'object',
      required: [
        'benefitType',
        'grossMonthlyAmount',
        'startReceivingDate',
        'firstPaymentDate',
      ],
      properties: {
        benefitType: {
          type: 'string',
          maxLength: 500,
        },
        grossMonthlyAmount: currencySchema,
        startReceivingDate: currentOrPastDateSchema,
        firstPaymentDate: currentOrPastDateSchema,
        stopReceivingDate: commonDefinitions.date,
      },
    },
  },
};
