import { descriptionUI } from 'platform/forms-system/src/js/web-component-patterns';
import VeteranInformationDescription from '../../components/FormDescriptions/VeteranInformationDescription';
import { blankSchema, titleWithRoleUI } from '../../definitions';
import content from '../../locales/en/content.json';

const TITLE_TEXT = content['sponsor--chapter-overview-title'];

export default {
  uiSchema: {
    ...titleWithRoleUI(TITLE_TEXT, null, {
      matchRole: 'sponsor',
      other: content['noun--veteran'],
    }),
    ...descriptionUI(VeteranInformationDescription),
  },
  schema: blankSchema,
};
