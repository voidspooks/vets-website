import {
  descriptionUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  SupplementalDocTypeDescription,
  SupplementalDocsDescription,
} from '../../components/FormDescriptions/SupplementalDocsDescriptions';
import { attachmentUI, attachmentWithMetadataSchema } from '../../definitions';
import content from '../../locales/en/content.json';
import { ATTACHMENT_IDS } from '../../utils/constants';

const TITLE_TEXT = content['supplemental--docs-upload-title'];
const INPUT_LABEL = content['supplemental--docs-upload-label'];

const SCHEMA_ENUM = [
  ATTACHMENT_IDS.birthCert,
  ATTACHMENT_IDS.civilUnionCert,
  ATTACHMENT_IDS.adoptionPapers,
  ATTACHMENT_IDS.divorceDecree,
  ATTACHMENT_IDS.marriageCert,
  ATTACHMENT_IDS.schoolCertificationForm,
  ATTACHMENT_IDS.other,
];

export default {
  uiSchema: {
    ...titleUI(TITLE_TEXT, SupplementalDocTypeDescription),
    ...descriptionUI(SupplementalDocsDescription),
    supplementalDocsUpload: attachmentUI({
      label: INPUT_LABEL,
      withMetadata: true,
    }),
  },
  schema: {
    type: 'object',
    required: ['supplementalDocsUpload'],
    properties: {
      supplementalDocsUpload: attachmentWithMetadataSchema({
        enumNames: SCHEMA_ENUM,
      }),
    },
  },
};
