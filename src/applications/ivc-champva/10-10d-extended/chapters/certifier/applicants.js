import {
  radioSchema,
  radioUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';
import { formatFullName } from '../../utils/helpers';

const INPUT_LABEL = content['certifier--applicant-selection-label'];

const updateSchema = (formData, schema, uiSchema) => {
  const { enumValues, labels } = (formData?.applicants ?? []).reduce(
    (acc, { applicantName }, index) => {
      const key = index.toString();
      acc.enumValues.push(key);
      acc.labels[key] = formatFullName(applicantName);
      return acc;
    },
    { enumValues: [], labels: {} },
  );

  Object.assign(uiSchema['ui:options'], { labels });

  return { enum: enumValues };
};

export default {
  uiSchema: {
    'view:certifierApplicantIndex': radioUI({
      title: INPUT_LABEL,
      classNames: 'dd-privacy-mask',
      labels: {},
      updateSchema,
    }),
  },
  schema: {
    type: 'object',
    required: ['view:certifierApplicantIndex'],
    properties: {
      'view:certifierApplicantIndex': radioSchema([]),
    },
  },
};
