// @ts-check
import {
  checkboxGroupSchema,
  checkboxGroupUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { validateSubmissionReasons } from '../helpers';

const Options = {
  initialApplication: {
    title: 'Initial application',
    description:
      'This is a request for an initial approval to be designated as an institution with programs eligible for participation in a VA GI Bill® Benefit.',
  },
  approvalOfNewPrograms: {
    title: 'Approval of new programs',
    description:
      'This is a request for additional programs to be approved and added to a current, active GI Bill Approval.',
  },
  reapproval: {
    title: 'Reapprovals',
    description:
      'This is a request for a full reapproval of currently approved GI Bill programs. Program reapprovals are required every 48 months.',
  },
  updateInformation: {
    title: 'Update information',
    description:
      'The purpose of this application is to update information about the institution. If “update information” is checked, you will need to identify at least one purpose on the next page.',
  },
  other: {
    title: 'Other',
    description: `If you select "other" you'll need to specify why you are submitting this form on the next page.`,
  },
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI('Application information'),
    submissionReasons: checkboxGroupUI({
      title: 'Why are you submitting this application?',
      hint:
        'Unless this is your initial application, you may select more than one answer.',
      required: true,
      labels: Options,
    }),
    'ui:validations': [
      {
        validator: (errors, formData) => {
          validateSubmissionReasons(errors, formData);
        },
      },
    ],
  },
  schema: {
    type: 'object',
    properties: {
      submissionReasons: checkboxGroupSchema(Object.keys(Options)),
    },
  },
};
