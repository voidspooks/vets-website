import {
  ssnSchema,
  ssnUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { titleWithRoleUI } from '../../definitions';
import content from '../../locales/en/content.json';
import { validateSponsorSsn } from '../../utils/validations';

const TITLE_TEXT = content['sponsor--identity-info-title'];

export default {
  uiSchema: {
    ...titleWithRoleUI(TITLE_TEXT, null, {
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
