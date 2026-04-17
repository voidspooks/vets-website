import { titleUI } from 'platform/forms-system/src/js/web-component-patterns';
import {
  fullNameMiddleInitialSchema,
  fullNameMiddleInitialUI,
} from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['certifier--name-title'];

export default {
  uiSchema: {
    ...titleUI(TITLE_TEXT),
    certifierName: fullNameMiddleInitialUI,
  },
  schema: {
    type: 'object',
    required: ['certifierName'],
    properties: {
      certifierName: fullNameMiddleInitialSchema,
    },
  },
};
