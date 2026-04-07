import {
  arrayBuilderItemSubsequentPageTitleUI,
  descriptionUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import FileUploadDescription from '../../components/FormDescriptions/FileUploadDescription';
import { attachmentUI, singleAttachmentSchema } from '../../definitions';
import content from '../../locales/en/content.json';
import { ATTACHMENT_IDS } from '../../utils/constants';

const TITLE_TEXT = content['medicare--part-c-card-title'];
const DESC_TEXT = content['medicare--part-c-card-description'];
const INPUT_LABELS = {
  front: content['medicare--part-c-card-label--front'],
  back: content['medicare--part-c-card-label--back'],
};

export default {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(TITLE_TEXT, DESC_TEXT),
    ...descriptionUI(FileUploadDescription),
    medicarePartCFrontCard: attachmentUI({
      label: INPUT_LABELS.front,
      attachmentId: ATTACHMENT_IDS.medicareCCardFront,
    }),
    medicarePartCBackCard: attachmentUI({
      label: INPUT_LABELS.back,
      attachmentId: ATTACHMENT_IDS.medicareCCardBack,
    }),
  },
  schema: {
    type: 'object',
    required: ['medicarePartCFrontCard', 'medicarePartCBackCard'],
    properties: {
      medicarePartCFrontCard: singleAttachmentSchema,
      medicarePartCBackCard: singleAttachmentSchema,
    },
  },
};
