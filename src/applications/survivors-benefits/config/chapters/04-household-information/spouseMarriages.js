import {
  checkboxGroupSchema,
  checkboxGroupUI,
  yesNoSchema,
  yesNoUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { validations } from '../../validations';

const previousMarriageOptions = {
  claimant: 'I had a previous marriage',
  veteran: 'The Veteran had a previous marriage',
  neither: 'We were never married before',
};

/** @type {PageSchema} */
export default {
  title: 'Previous marriages',
  path: 'household/spouse-marriage-question',
  depends: formData => formData.claimantRelationship === 'SURVIVING_SPOUSE',
  uiSchema: {
    ...titleUI('Previous marriages'),
    recognizedAsSpouse: yesNoUI({
      title: 'Did we recognize you as the Veteran’s spouse before their death?',
    }),
    hadPreviousMarriages: {
      ...checkboxGroupUI({
        title:
          'Were you or the Veteran married to anyone else before you married each other?',
        required: true,
        labels: previousMarriageOptions,
      }),
      'ui:validations': [validations.previousMarriageSelections],
    },
  },
  schema: {
    type: 'object',
    required: ['recognizedAsSpouse', 'hadPreviousMarriages'],
    properties: {
      recognizedAsSpouse: yesNoSchema,
      hadPreviousMarriages: checkboxGroupSchema(
        Object.keys(previousMarriageOptions),
      ),
    },
  },
};
