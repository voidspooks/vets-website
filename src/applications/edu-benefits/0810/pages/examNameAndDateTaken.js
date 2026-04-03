import React from 'react';
import {
  currentOrPastDateSchema,
  currentOrPastDateUI,
  titleUI,
  textSchema,
  textUI,
} from 'platform/forms-system/src/js/web-component-patterns';

import { validateWhiteSpace } from 'platform/forms/validations';

const uiSchema = {
  ...titleUI('Exam name and date taken'),
  examName: textUI({
    title: 'Name of exam',
    validations: [validateWhiteSpace],
    errorMessages: {
      required: 'Enter the name of the exam',
    },
  }),
  examDate: currentOrPastDateUI({
    title: 'Date exam was taken',
    hint: 'This date can’t be in the future',
    monthSelect: false,
    errorMessages: {
      required: 'Enter the date you took the exam',
    },
  }),
  'view:examNameAndDateTakenNote': {
    'ui:description': (
      <p
        className="vads-u-margin-top--3"
        data-testid="exam-name-date-note"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex="0"
      >
        <strong>Note: </strong> When you submit this form through QuickSubmit or
        by mail, you will need to attach a copy of your exam results to your
        submission.
      </p>
    ),
  },
};

const schema = {
  type: 'object',
  properties: {
    examName: {
      ...textSchema,
      minLength: 1,
    },
    examDate: currentOrPastDateSchema,
    'view:examNameAndDateTakenNote': {
      type: 'object',
      properties: {},
    },
  },
  required: ['examName', 'examDate'],
};

export { schema, uiSchema };
