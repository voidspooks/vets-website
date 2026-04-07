import {
  arrayBuilderItemSubsequentPageTitleUI,
  descriptionUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import FileUploadDescription from '../../components/FormDescriptions/FileUploadDescription';
import { MedicarePartADenialProofDescription } from '../../components/FormDescriptions/MedicareDenialNoticeDescriptions';
import { attachmentUI, singleAttachmentSchema } from '../../definitions';
import content from '../../locales/en/content.json';
import { ATTACHMENT_IDS } from '../../utils/constants';

const TITLE_TEXT = content['medicare--part-a-denial-proof-title'];

export default {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      TITLE_TEXT,
      MedicarePartADenialProofDescription,
    ),
    ...descriptionUI(FileUploadDescription),
    medicarePartADenialProof: attachmentUI({
      label: TITLE_TEXT,
      attachmentId: ATTACHMENT_IDS.ssaLetter,
    }),
  },
  schema: {
    type: 'object',
    required: ['medicarePartADenialProof'],
    properties: {
      medicarePartADenialProof: singleAttachmentSchema,
    },
  },
};
