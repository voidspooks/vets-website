import fullSchema from 'vets-json-schema/dist/21-526EZ-ALLCLAIMS-schema.json';
import { waiveRetirementPayDescription } from '../content/waiveRetirementPay';
import { formTitle } from '../utils';

const { waiveRetirementPay: waiveRetirementPaySchema } = fullSchema.properties;

export const uiSchema = {
  'ui:title': formTitle('Retirement pay waiver'),
  'view:waiveRetirementPayDescription': {
    'ui:description': waiveRetirementPayDescription,
  },
  waiveRetirementPay: {
    'ui:title': 'What type of pay you would like to receive?',
    'ui:widget': 'yesNo',
    'ui:options': {
      labels: {
        Y: 'I want to receive VA compensation pay.',
        N: 'I don’t want to receive tax-free VA compensation pay.',
      },
    },
  },
};

export const schema = {
  type: 'object',
  required: ['waiveRetirementPay'],
  properties: {
    'view:waiveRetirementPayDescription': {
      type: 'object',
      properties: {},
    },
    waiveRetirementPay: waiveRetirementPaySchema,
  },
};
