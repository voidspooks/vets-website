import {
  arrayBuilderYesNoSchema,
  arrayBuilderYesNoUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../locales/en/content.json';
import {
  createModalTitleOrDescription,
  createSummaryTitle,
} from '../../utils/helpers';
import { SCHEMA_LABELS as INSURANCE_TYPE_LABELS } from './insuranceType';

const yesNoOptions = {
  title: content['health-insurance--yes-no-label-more'],
  hint: content['health-insurance--yes-no-hint'],
  labelHeaderLevel: '',
};

const getItemName = item => item?.name;

const getPolicyCardDescription = item =>
  item?.type === 'other'
    ? item?.otherType
    : INSURANCE_TYPE_LABELS[(item?.type)];

const isItemIncomplete = item =>
  !item?.name || !item?.type || (item?.type === 'other' && !item?.otherType);

/** @type {ArrayBuilderOptions} */
export const insuranceOptions = {
  arrayPath: 'policies',
  nounSingular: 'policy',
  nounPlural: 'policies',
  isItemIncomplete,
  required: true,
  maxItems: 2,
  text: {
    getItemName,
    cardDescription: getPolicyCardDescription,
    cancelAddTitle: content['health-insurance--cancel-add-title'],
    cancelAddDescription: content['health-insurance--cancel-add-description'],
    cancelAddNo: content['arraybuilder--button-cancel-no'],
    cancelAddYes: content['arraybuilder--button-cancel-yes'],
    cancelEditTitle: createModalTitleOrDescription(
      'health-insurance--cancel-edit-item-title',
      'health-insurance--cancel-edit-noun-title',
    ),
    cancelEditDescription: content['health-insurance--cancel-edit-description'],
    cancelEditNo: content['arraybuilder--button-delete-no'],
    cancelEditYes: content['arraybuilder--button-cancel-yes'],
    deleteDescription: createModalTitleOrDescription(
      'health-insurance--delete-item-description',
      'health-insurance--delete-noun-description',
    ),
    deleteNo: content['arraybuilder--button-delete-no'],
    deleteYes: content['arraybuilder--button-delete-yes'],
    summaryTitle: createSummaryTitle('health-insurance--summary-title'),
    summaryDescription: null,
    cancelAddButtonText: content['health-insurance--button--cancel-add'],
  },
};

export default {
  uiSchema: {
    'view:hasPolicies': arrayBuilderYesNoUI(
      insuranceOptions,
      yesNoOptions,
      yesNoOptions,
    ),
  },
  schema: {
    type: 'object',
    properties: {
      'view:hasPolicies': arrayBuilderYesNoSchema,
    },
    required: ['view:hasPolicies'],
  },
};
