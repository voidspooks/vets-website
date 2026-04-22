import { titleUI } from 'platform/forms-system/src/js/web-component-patterns';
import { addressSchema, addressUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['certifier--mailing-address-title'];
const DESC_TEXT = content['address--page-description'];

export default {
  uiSchema: {
    ...titleUI(TITLE_TEXT, DESC_TEXT),
    certifierAddress: addressUI(),
  },
  schema: {
    type: 'object',
    required: ['certifierAddress'],
    properties: {
      certifierAddress: addressSchema(),
    },
  },
};
