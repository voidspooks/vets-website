import {
  checkboxGroupSchema,
  checkboxGroupUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { toHash } from '../../../shared/utilities';
import content from '../../locales/en/content.json';
import { formatFullName } from '../../utils/helpers';
import { titleWithFormDataUI } from '../../utils/titles';

const TITLE_TEXT = content['health-insurance--participant-title'];
const INPUT_LABEL = content['health-insurance--participant-label'];
const HINT_TEXT = content['health-insurance--participant-hint'];

const updateSchema = (_formData, schema, uiSchema, _index, _path, fullData) => {
  const applicants = fullData?.applicants ?? [];
  const { labels, properties, checkboxUiSchemas } = applicants.reduce(
    (acc, a) => {
      const key = toHash(a.applicantSsn);
      const name = formatFullName(a.applicantName);

      acc.labels[key] = name;
      acc.properties[key] = { type: 'boolean' };
      acc.checkboxUiSchemas[key] = { 'ui:title': name };

      return acc;
    },
    { labels: {}, properties: {}, checkboxUiSchemas: {} },
  );

  Object.assign(uiSchema, checkboxUiSchemas, {
    'ui:options': { ...uiSchema['ui:options'], labels },
  });

  return { ...schema, properties };
};

export default {
  uiSchema: {
    ...titleWithFormDataUI(TITLE_TEXT, null, {
      dataKey: 'provider',
      fallback: content['noun--provider'],
      arrayBuilder: true,
    }),
    healthcareParticipants: checkboxGroupUI({
      title: INPUT_LABEL,
      hint: HINT_TEXT,
      classNames: 'dd-privacy-mask',
      required: true,
      labels: {},
      updateSchema,
    }),
  },
  schema: {
    type: 'object',
    required: ['healthcareParticipants'],
    properties: {
      healthcareParticipants: checkboxGroupSchema([]),
    },
  },
};
