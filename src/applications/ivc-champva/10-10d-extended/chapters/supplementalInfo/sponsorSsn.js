import {
  ssnSchema,
  ssnUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { titleWithRoleUI } from '../../definitions';
import content from '../../locales/en/content.json';
import { validateSponsorSsn } from '../../utils/validations';

const TITLE_TEXT = content['sponsor--identity-info-title'];
const DESC_TEXT = content['supplemental--sponsor-identity-info-description'];

export default {
  uiSchema: {
    ...titleWithRoleUI(TITLE_TEXT, DESC_TEXT, {
      matchRole: 'sponsor',
      other: content['noun--veteran'],
    }),
    sponsorSsn: {
      ...ssnUI(),
      'ui:validations': [validateSponsorSsn],
    },
  },
  schema: {
    type: 'object',
    required: ['sponsorSsn'],
    properties: {
      sponsorSsn: ssnSchema,
    },
  },
};
