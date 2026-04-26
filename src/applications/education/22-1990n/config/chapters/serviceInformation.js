import {
  currentOrPastDateUI,
  currentOrPastDateSchema,
  textUI,
  textSchema,
  yesNoUI,
  yesNoSchema,
  fileInputMultipleUI,
  fileInputMultipleSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

// ── Screen 10: Active Duty Status (Items 9A, 9B) ──────────────────────────────

export const activeDutyStatusUiSchema = {
  activeDuty: yesNoUI({
    title: 'Are you now on active duty?',
    required: () => true,
    errorMessages: {
      required: 'Please indicate whether you are currently on active duty',
    },
  }),
  terminalLeave: yesNoUI({
    title: 'Are you now on terminal leave just before discharge?',
    required: () => true,
    errorMessages: {
      required:
        'Please indicate whether you are currently on terminal leave',
    },
  }),
};

export const activeDutyStatusSchema = {
  type: 'object',
  required: ['activeDuty', 'terminalLeave'],
  properties: {
    activeDuty: yesNoSchema,
    terminalLeave: yesNoSchema,
  },
};

// ── Screen 11: Military Service History (Item 10) ─────────────────────────────

function validateServiceEntryDate(errors, value) {
  if (!value) return;
  const ncsDate = new Date('2003-10-01');
  const entryDate = new Date(value);
  if (entryDate < ncsDate) {
    errors.addError(
      'The NCS program requires first entry into military service on or after October 1, 2003. If this date is correct, you may not be eligible. Contact the GI Bill Hotline at 1-888-GI-BILL-1 with questions.',
    );
  }
}

function validateDateSeparatedAfterEntry(errors, fieldData, formData, schema, errorMessages, index) {
  if (!fieldData) return;
  const periods = formData.servicePeriods || [];
  const period = periods[index];
  if (period && period.dateEnteredService && fieldData) {
    const entered = new Date(period.dateEnteredService);
    const separated = new Date(fieldData);
    if (separated <= entered) {
      errors.addError(
        'Date separated must be after the date entered service',
      );
    }
  }
}

export const militaryServiceHistoryUiSchema = {
  servicePeriods: {
    'ui:options': {
      itemName: 'Service Period',
      viewField: ({ formData: periodData }) => {
        const comp = periodData && periodData.serviceComponent;
        const entered = periodData && periodData.dateEnteredService;
        return comp || entered || 'Service Period';
      },
      keepInPageOnReview: true,
    },
    items: {
      dateEnteredService: {
        ...currentOrPastDateUI({
          title: 'Date entered service',
          hint: 'For example: January 19 2003',
        }),
        'ui:validations': [validateServiceEntryDate],
      },
      dateSeparated: currentOrPastDateUI({
        title: 'Date separated from service',
        hint: 'For example: June 1 2005 — leave blank if currently serving',
      }),
      serviceComponent: textUI({
        title: 'Service component',
        hint: 'For example: USN, USAF, USAR, ARNG',
        errorMessages: { required: 'Please enter your service component' },
      }),
      serviceStatus: textUI({
        title: 'Service status',
        hint: 'For example: Active duty, drilling reservist, IRR',
        errorMessages: { required: 'Please enter your service status' },
      }),
    },
  },
};

export const militaryServiceHistorySchema = {
  type: 'object',
  required: ['servicePeriods'],
  properties: {
    servicePeriods: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['dateEnteredService', 'serviceComponent', 'serviceStatus'],
        properties: {
          dateEnteredService: currentOrPastDateSchema,
          dateSeparated: { ...currentOrPastDateSchema },
          serviceComponent: { type: 'string', maxLength: 20 },
          serviceStatus: { type: 'string', maxLength: 50 },
        },
      },
    },
  },
};

// ── Screen 12: Supporting Documents ──────────────────────────────────────────

export const supportingDocumentsUiSchema = {
  ddForm2863: fileInputMultipleUI({
    title: 'Upload your DD Form 2863 (NCS Election of Options)',
    hint:
      'DD Form 2863 is required. Accepted file types: PDF, JPG, PNG. Maximum file size: 20MB.',
    required: true,
    errorMessages: {
      required: 'Please upload your DD Form 2863',
    },
  }),
  ddForm214: fileInputMultipleUI({
    title: 'Upload your DD Form 214 (Member 4 copy)',
    hint:
      'Upload your DD Form 214 Member 4 copy. If you are on terminal leave, you may upload when it is issued. Accepted file types: PDF, JPG, PNG. Maximum file size: 20MB.',
    required: false,
    errorMessages: {},
  }),
};

export const supportingDocumentsSchema = {
  type: 'object',
  properties: {
    ddForm2863: fileInputMultipleSchema(),
    ddForm214: fileInputMultipleSchema(),
  },
};