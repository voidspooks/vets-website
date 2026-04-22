import {
  radioSchema,
  radioUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';

const vaBenefitProgramOptions = {
  chapter33:
    'Post-9/11 GI Bill Including Transfer of Entitlement and Fry Scholarship Recipients (Chapter 33)',
  chapter35:
    'Survivors and Dependents’ Educational Assistance Program (DEA) (Chapter 35)',
};

const uiSchema = {
  ...titleUI('Your VA education benefits'),
  vaBenefitProgram: {
    ...radioUI({
      title:
        'Select the education benefit under which you are requesting Prep Course fee reimbursement.',
      labels: vaBenefitProgramOptions,
    }),
  },
};

const schema = {
  type: 'object',
  properties: {
    vaBenefitProgram: radioSchema(Object.keys(vaBenefitProgramOptions)),
  },
  required: ['vaBenefitProgram'],
};

export { schema, uiSchema };
