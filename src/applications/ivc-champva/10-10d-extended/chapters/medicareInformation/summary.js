import {
  arrayBuilderYesNoSchema,
  arrayBuilderYesNoUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import MedicareSummaryCard from '../../components/FormDescriptions/MedicareSummaryCard';
import content from '../../locales/en/content.json';
import {
  createModalTitleOrDescription,
  generateParticipantName,
} from '../../utils/helpers';
import { validateMedicarePlan } from '../../utils/validations';

const yesNoOptions = {
  title: content['medicare--yes-no-title'],
  hint: null,
  labelHeaderLevel: '',
};

const yesNoOptionsMore = {
  title: content['medicare--yes-no-title'],
  hint: content['medicare--yes-no-hint'],
  labelHeaderLevel: '',
};

export const medicareOptions = {
  arrayPath: 'medicare',
  nounSingular: 'plan',
  nounPlural: 'plans',
  required: false,
  isItemIncomplete: validateMedicarePlan,
  maxItems: formData => formData?.applicants?.length,
  text: {
    getItemName: generateParticipantName,
    cardDescription: MedicareSummaryCard,
    cancelAddTitle: content['medicare--cancel-add-title'],
    cancelAddDescription: content['medicare--cancel-add-description'],
    cancelAddNo: content['arraybuilder--button-cancel-no'],
    cancelAddYes: content['arraybuilder--button-cancel-yes'],
    cancelEditTitle: createModalTitleOrDescription(
      'medicare--cancel-edit-item-title',
      'medicare--cancel-edit-noun-title',
    ),
    cancelEditDescription: content['medicare--cancel-edit-description'],
    cancelEditNo: content['arraybuilder--button-delete-no'],
    cancelEditYes: content['arraybuilder--button-cancel-yes'],
    deleteDescription: createModalTitleOrDescription(
      'medicare--delete-item-description',
      'medicare--delete-noun-description',
    ),
    deleteNo: content['arraybuilder--button-delete-no'],
    deleteYes: content['arraybuilder--button-delete-yes'],
    summaryTitle: content['medicare--summary-title'],
    summaryTitleWithoutItems: content['medicare--summary-title-no-items'],
  },
};

export default {
  uiSchema: {
    'view:hasMedicare': arrayBuilderYesNoUI(
      medicareOptions,
      yesNoOptions,
      yesNoOptionsMore,
    ),
  },
  schema: {
    type: 'object',
    required: ['view:hasMedicare'],
    properties: {
      'view:hasMedicare': arrayBuilderYesNoSchema,
    },
  },
};
