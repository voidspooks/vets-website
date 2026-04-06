import {
  descriptionUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { blankSchema } from '../../definitions';
import content from '../../locales/en/content.json';

export default {
  uiSchema: {
    ...titleUI(content['health-insurance--intro-title']),
    ...descriptionUI(content['health-insurance--intro-desc']),
  },
  schema: blankSchema,
};
