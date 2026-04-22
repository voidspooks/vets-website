import { addressSchema, addressUI, titleWithNameUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['mailing-address--page-title'];
const DESC_TEXT = content['mailing-address--page-description'];

export default {
  uiSchema: {
    ...titleWithNameUI(TITLE_TEXT, DESC_TEXT, { arrayBuilder: true }),
    applicantAddress: addressUI(),
  },
  schema: {
    type: 'object',
    required: ['applicantAddress'],
    properties: {
      applicantAddress: addressSchema(),
    },
  },
};
