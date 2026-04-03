import React from 'react';
import {
  titleUI,
  currencySchema,
  currencyUI,
} from '~/platform/forms-system/src/js/web-component-patterns';

const uiSchema = {
  ...titleUI('Exam cost'),
  'ui:description': () => (
    <>
      <p>
        Enter the cost of the exam you took, including any required fees. (We
        can only reimburse you for required exam fees.) We have no authority to
        reimburse you for any optional costs related to the exam process.
      </p>
      <p>
        Exam fees that VA will reimburse include "registration fees," fees for
        specialized exams, and administrative fees such as a proctoring fee.
      </p>
      <p>
        Fees that VA has no authority to reimburse include fees to take
        pre-tests, fees to receive scores quickly, or other costs or fees for
        optional items that are not required to take an approved exam.
      </p>
    </>
  ),
  examCost: {
    ...currencyUI({
      title: 'Total exam cost',
      errorMessages: {
        required: 'Enter the total cost of the exam',
      },
    }),
  },
  'view:examCostNote': {
    'ui:description': (
      <p data-testid="exam-cost-note">
        <strong>Note: </strong> When you submit this form through QuickSubmit or
        by mail, you will need to attach a copy of your receipt for any exam
        fees that you have listed above. Reimbursement of the exam fees can’t be
        paid until this information is received.
      </p>
    ),
  },
};

const schema = {
  type: 'object',
  properties: {
    examCost: currencySchema,
    'view:examCostNote': {
      type: 'object',
      properties: {},
    },
  },
  required: ['examCost'],
};

export { schema, uiSchema };
