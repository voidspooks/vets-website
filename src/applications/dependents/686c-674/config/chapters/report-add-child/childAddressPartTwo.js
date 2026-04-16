import { arrayBuilderItemSubsequentPageTitleUI } from 'platform/forms-system/src/js/web-component-patterns';
import {
  fullNameNoSuffixWithAsciiUI,
  fullNameNoSuffixWithAsciiSchema,
} from '../../helpers';

export const childAddressPartTwo = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      ({ formData }) =>
        `Person ${formData?.fullName?.first || 'this child'} lives with`,
      null,
      false,
      { dataDogHidden: true },
    ),
    livingWith: fullNameNoSuffixWithAsciiUI(),
    'ui:options': {
      updateSchema: (formData, formSchema, _uiSchema, index) => {
        if (formData?.childrenToAdd?.[index]?.doesChildLiveWithYou === false) {
          return {
            ...formSchema,
            required: ['livingWith'],
          };
        }
        return formSchema;
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      livingWith: fullNameNoSuffixWithAsciiSchema,
    },
  },
};
