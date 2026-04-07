import {
  descriptionUI,
  yesNoSchema,
  yesNoUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import ProofOfMedicareAlert from '../../components/FormAlerts/ProofOfMedicareAlert';
import { blankSchema } from '../../definitions';
import content from '../../locales/en/content.json';
import { medicarePageTitleUI } from '../../utils/titles';

const TITLE_TEXT = content['medicare--part-a-denial-notice-title'];
const INPUT_LABEL = content['medicare--part-a-denial-notice-label'];
const HINT_TEXT = content['medicare--part-a-denial-notice-hint'];

export default {
  uiSchema: {
    'view:addtlInfo': descriptionUI(ProofOfMedicareAlert),
    'view:hasProofMultipleApplicants': {
      ...medicarePageTitleUI(TITLE_TEXT),
      hasProofMultipleApplicants: yesNoUI({
        title: INPUT_LABEL,
        hint: HINT_TEXT,
      }),
    },
  },
  schema: {
    type: 'object',
    properties: {
      'view:addtlInfo': blankSchema,
      'view:hasProofMultipleApplicants': {
        type: 'object',
        required: ['hasProofMultipleApplicants'],
        properties: {
          hasProofMultipleApplicants: yesNoSchema,
        },
      },
    },
  },
};
