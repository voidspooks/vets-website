import fullSchema from 'vets-json-schema/dist/21-526EZ-ALLCLAIMS-schema.json';
import { yesNoUI } from 'platform/forms-system/src/js/web-component-patterns';
import { formTitle } from '../utils';

const { isVaEmployee } = fullSchema.properties;
export const uiSchema = {
  'ui:title': formTitle('VA employment status'),
  isVaEmployee: yesNoUI({
    title: 'Are you currently a VA employee?',
  }),
};

export const schema = {
  type: 'object',
  required: ['isVaEmployee'],
  properties: { isVaEmployee },
};
