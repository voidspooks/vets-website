import {
  descriptionUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import SupplementalInformationDescription from '../../components/FormDescriptions/SupplementalInformationDescription';
import { blankSchema } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['supplemental--chapter-overview-title'];

export default {
  uiSchema: {
    ...titleUI(TITLE_TEXT),
    ...descriptionUI(SupplementalInformationDescription),
  },
  schema: blankSchema,
};
