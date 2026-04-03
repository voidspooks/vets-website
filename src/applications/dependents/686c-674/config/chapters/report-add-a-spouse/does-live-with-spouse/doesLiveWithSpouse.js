import {
  yesNoSchema,
  yesNoUI,
  currentOrPastDateUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { DATE_SCHEMA } from '../../../constants';

export const schema = {
  type: 'object',
  properties: {
    doesLiveWithSpouse: {
      type: 'object',
      properties: {
        spouseDoesLiveWithVeteran: yesNoSchema,
      },
    },
    currentMarriageInformation: {
      type: 'object',
      properties: {
        date: DATE_SCHEMA,
      },
    },
  },
};

export const uiSchema = {
  doesLiveWithSpouse: {
    ...titleUI('Information about your marriage'),
    spouseDoesLiveWithVeteran: yesNoUI({
      title: 'Do you live with your spouse?',
      required: () => true,
      errorMessages: {
        required: 'Make a selection',
      },
    }),
  },
  currentMarriageInformation: {
    date: currentOrPastDateUI({
      title: 'When did you get married?',
      dataDogHidden: true,
      required: () => true,
      errorMessages: {
        required: 'Enter the date you got married',
      },
    }),
  },
};
