import {
  addressSchema,
  addressUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { sponsorAddressCleanValidation } from '../../../shared/validations';
import { titleWithRoleUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['mailing-address--page-title'];
const DESC_TEXT = content['mailing-address--page-description'];
const CHECKBOX_LABEL = content['mailing-address--checkbox-label'];

export default {
  uiSchema: {
    ...titleWithRoleUI(TITLE_TEXT, DESC_TEXT, {
      matchRole: 'sponsor',
      other: content['noun--veteran'],
    }),
    sponsorAddress: addressUI({ labels: { militaryCheckbox: CHECKBOX_LABEL } }),
    'ui:validations': [sponsorAddressCleanValidation],
  },
  schema: {
    type: 'object',
    properties: {
      sponsorAddress: addressSchema({ omit: ['street3'] }),
    },
  },
};
