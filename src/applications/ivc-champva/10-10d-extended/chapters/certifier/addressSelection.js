import { titleUI } from 'platform/forms-system/src/js/web-component-patterns';
import { addressSelectionUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['certifier--address-title'];
const DESC_TEXT = content['address--page-description'];
const INPUT_LABEL = content['certifier--address-label'];

export default {
  uiSchema: {
    ...titleUI(TITLE_TEXT, DESC_TEXT),
    'view:certifierSharedAddress': addressSelectionUI({
      title: INPUT_LABEL,
      destinationKey: 'certifierAddress',
      sourceKeys: ['applicants.applicantAddress', 'sponsorAddress'],
    }),
  },
  schema: {
    type: 'object',
    required: ['view:certifierSharedAddress'],
    properties: {
      'view:certifierSharedAddress': { type: 'string' },
    },
  },
};
