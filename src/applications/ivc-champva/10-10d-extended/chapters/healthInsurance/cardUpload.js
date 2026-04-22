import { descriptionUI } from 'platform/forms-system/src/js/web-component-patterns';
import FileUploadDescription from '../../components/FormDescriptions/FileUploadDescription';
import {
  attachmentUI,
  singleAttachmentSchema,
  titleWithFormDataUI,
} from '../../definitions';
import content from '../../locales/en/content.json';
import { ATTACHMENT_IDS } from '../../utils/constants';

const TITLE_TEXT = content['health-insurance--card-upload-title'];
const DESC_TEXT = content['health-insurance--card-upload-description'];

const INPUT_LABELS = {
  cardFront: content['health-insurance--card-upload-label--front'],
  cardBack: content['health-insurance--card-upload-label--back'],
};

export default {
  uiSchema: {
    ...titleWithFormDataUI(TITLE_TEXT, DESC_TEXT, {
      dataKey: 'provider',
      fallback: content['noun--provider'],
      arrayBuilder: true,
    }),
    ...descriptionUI(FileUploadDescription),
    insuranceCardFront: attachmentUI({
      label: INPUT_LABELS.cardFront,
      attachmentId: ATTACHMENT_IDS.ohiCardFront,
    }),
    insuranceCardBack: attachmentUI({
      label: INPUT_LABELS.cardBack,
      attachmentId: ATTACHMENT_IDS.ohiCardBack,
    }),
  },
  schema: {
    type: 'object',
    required: ['insuranceCardFront', 'insuranceCardBack'],
    properties: {
      insuranceCardFront: singleAttachmentSchema,
      insuranceCardBack: singleAttachmentSchema,
    },
  },
};
