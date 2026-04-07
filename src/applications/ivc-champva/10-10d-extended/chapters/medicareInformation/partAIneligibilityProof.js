import {
  arrayBuilderItemSubsequentPageTitleUI,
  descriptionUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import FileUploadDescription from '../../components/FormDescriptions/FileUploadDescription';
import { MedicareProofOfIneligibilityDescription } from '../../components/FormDescriptions/MedicareDenialNoticeDescriptions';
import { attachmentUI, singleAttachmentSchema } from '../../definitions';
import content from '../../locales/en/content.json';
import { ATTACHMENT_IDS } from '../../utils/constants';

const TITLE_TEXT = content['medicare--part-a-denial-proof-title'];

export default {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      TITLE_TEXT,
      MedicareProofOfIneligibilityDescription,
    ),
    ...descriptionUI(FileUploadDescription),
    proofOfIneligibilityUpload: attachmentUI({
      label: TITLE_TEXT,
      attachmentId: ATTACHMENT_IDS.ssaLetter,
    }),
  },
  schema: {
    type: 'object',
    required: ['proofOfIneligibilityUpload'],
    properties: {
      proofOfIneligibilityUpload: singleAttachmentSchema,
    },
  },
};
