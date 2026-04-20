import {
  arrayBuilderItemFirstPageTitleUI,
  arrayBuilderItemSubsequentPageTitleUI,
  arrayBuilderYesNoSchema,
  arrayBuilderYesNoUI,
  currentOrPastMonthYearDateSchema,
  currentOrPastMonthYearDateUI,
  radioUI,
  textUI,
  textSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { arrayBuilderPages } from 'platform/forms-system/src/js/patterns/array-builder';
import { getAddOrEditMode } from '../../utils/evidence';
import {
  customizableLLText,
  dateDetailsContent,
  datePromptContent,
  locationContent,
  promptContent,
  summaryContent,
} from '../../content/evidence/va';
import {
  EVIDENCE_URLS,
  VA_EVIDENCE_KEY,
  VA_EVIDENCE_PROMPT_KEY,
  VA_TREATMENT_BEFORE_2005_KEY,
  VA_TREATMENT_LOCATION_KEY,
  VA_TREATMENT_MONTH_YEAR_KEY,
} from '../../constants';
import { hasTreatmentBefore2005 } from '../../utils/form-data-retrieval';
import { redesignActive } from '../../utils';

/**
 * This is how we determine whether all of the info for one
 * evidence record is complete. This is what the summary page
 * uses to display an error or not
 * @param {object} item
 * @returns bool
 */
const itemIsComplete = item => {
  let treatmentDateRequirement = item[VA_TREATMENT_BEFORE_2005_KEY];

  if (item[VA_TREATMENT_BEFORE_2005_KEY] === 'Y') {
    treatmentDateRequirement =
      item[VA_TREATMENT_BEFORE_2005_KEY] && item[VA_TREATMENT_MONTH_YEAR_KEY];
  }

  return item[VA_TREATMENT_LOCATION_KEY] && treatmentDateRequirement;
};

/**
 * This is the config object for the VA evidence list & loop
 * Here, we can also configure the content on the summary page
 * including the layout of the evidence cards for review
 */
/** @type {ArrayBuilderOptions} */
const options = {
  arrayPath: VA_EVIDENCE_KEY,
  nounSingular: 'record',
  nounPlural: 'records',
  required: false,
  isItemIncomplete: item => !itemIsComplete(item),
  maxItems: 100,
  text: {
    alertItemUpdated: ({ itemData }) =>
      summaryContent.alertItemUpdatedText(itemData),
    cardDescription: item => summaryContent.cardDescription(item),
    getItemName: item => item?.[VA_TREATMENT_LOCATION_KEY],
    summaryTitle: summaryContent.titleWithItems,
    cancelEditDescription: customizableLLText.cancelEditDescription,
    cancelEditTitle: customizableLLText.cancelEditTitle,
    deleteYes: customizableLLText.deleteYes,
    deleteNo: customizableLLText.deleteNo,
    deleteDescription: customizableLLText.deleteDescription,
    deleteTitle: customizableLLText.deleteTitle,
    reviewAddButtonText: customizableLLText.reviewAddButtonText,
  },
};

/**
 * In the optional list & loop flow, the summary page can be configured
 * with both intro page and summary page options (the 2nd and 3rd param
 * passed to arrayBuilderYesNoUI).
 */
/** @returns {PageSchema} */
const summaryPage = {
  uiSchema: {
    [VA_EVIDENCE_PROMPT_KEY]: arrayBuilderYesNoUI(
      options,
      {
        useFormsPattern: true,
        formHeading: promptContent.topQuestion,
        formDescription: promptContent.description,
        title: promptContent.aboveRadioQuestion,
        labels: promptContent.options,
        formHeadingLevel: '3',
        labelHeaderLevel: null,
        hint: null,
        errorMessages: {
          required: promptContent.requiredError,
        },
        tile: true,
      },
      {
        title: summaryContent.question,
        labels: summaryContent.options,
        labelHeaderLevel: '3',
        hint: null,
        tile: false,
        errorMessages: {
          required: summaryContent.requiredError,
        },
      },
    ),
  },
  schema: {
    type: 'object',
    properties: {
      [VA_EVIDENCE_PROMPT_KEY]: arrayBuilderYesNoSchema,
    },
    required: [VA_EVIDENCE_PROMPT_KEY],
  },
};

/** @returns {PageSchema} */
const locationPage = {
  uiSchema: {
    ...arrayBuilderItemFirstPageTitleUI({
      title: ({ formContext }) =>
        locationContent.question(formContext, getAddOrEditMode()),
      nounSingular: options.nounSingular,
      showEditExplanationText: false,
    }),
    [VA_TREATMENT_LOCATION_KEY]: textUI({
      title: locationContent.label,
      hint: locationContent.hint,
      errorMessages: {
        required: locationContent.requiredError,
        maxLength: locationContent.maxLengthError,
      },
    }),
  },
  schema: {
    type: 'object',
    properties: {
      [VA_TREATMENT_LOCATION_KEY]: {
        ...textSchema,
        maxLength: 255,
      },
    },
    required: [VA_TREATMENT_LOCATION_KEY],
  },
};

/** @returns {PageSchema} */
const datePromptPage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(({ formData }) =>
      datePromptContent.question(formData, getAddOrEditMode()),
    ),
    [VA_TREATMENT_BEFORE_2005_KEY]: radioUI({
      title: datePromptContent.label,
      labels: datePromptContent.options,
      errorMessages: {
        required: datePromptContent.requiredError,
      },
    }),
    'ui:options': {
      updateSchema: (formData, schema, _uiSchema, index) => {
        const itemData = formData?.vaEvidence?.[index] || formData;

        // Clean up treatmentMonthYear data when answer is 'N'
        if (itemData[VA_TREATMENT_BEFORE_2005_KEY] === 'N') {
          delete itemData[VA_TREATMENT_MONTH_YEAR_KEY];
        }

        return schema;
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [VA_TREATMENT_BEFORE_2005_KEY]: {
        type: 'string',
        enum: ['Y', 'N'],
      },
    },
    required: [VA_TREATMENT_BEFORE_2005_KEY],
  },
};

export const validateApproximateMonthYearDate = (errors, dateString) => {
  if (!dateString) {
    return;
  }

  const [year] = dateString.split('-');
  const yearInt = parseInt(year, 10);

  if (Number.isNaN(yearInt)) {
    return;
  }

  if (yearInt && (yearInt < 1900 || yearInt > 2005)) {
    errors.addError(dateDetailsContent.yearError);
  }
};

/** @returns {PageSchema} */
const dateDetailsPage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(({ formData }) =>
      dateDetailsContent.question(formData, getAddOrEditMode()),
    ),
    [VA_TREATMENT_MONTH_YEAR_KEY]: currentOrPastMonthYearDateUI({
      title: dateDetailsContent.label,
      hint: dateDetailsContent.hint,
      errorMessages: {
        required: dateDetailsContent.requiredError,
      },
      validations: [validateApproximateMonthYearDate],
      customMonthErrorMessage: dateDetailsContent.monthError,
      customYearErrorMessage: dateDetailsContent.yearError,
    }),
    'ui:description': dateDetailsContent.description,
  },
  schema: {
    type: 'object',
    properties: {
      [VA_TREATMENT_MONTH_YEAR_KEY]: currentOrPastMonthYearDateSchema,
    },
    required: [VA_TREATMENT_MONTH_YEAR_KEY],
  },
};

/**
 * This is where the array builder gets page configuration.
 * Some items have blank titles because a title is required for the
 * pageBuilder config but the uiSchemas they use also require titles
 * which override the ones here
 */
export default arrayBuilderPages(options, pageBuilder => ({
  vaSummary: pageBuilder.summaryPage({
    title: '',
    path: EVIDENCE_URLS.vaPromptSummary,
    uiSchema: summaryPage.uiSchema,
    schema: summaryPage.schema,
    depends: formData => redesignActive(formData),
  }),
  vaLocation: pageBuilder.itemPage({
    title: '',
    path: EVIDENCE_URLS.vaLocation,
    uiSchema: locationPage.uiSchema,
    schema: locationPage.schema,
    depends: formData => redesignActive(formData),
  }),
  treatmentDatePrompt: pageBuilder.itemPage({
    title: 'Treatment date prompt',
    path: EVIDENCE_URLS.vaTreatmentDatePrompt,
    uiSchema: datePromptPage.uiSchema,
    schema: datePromptPage.schema,
    depends: formData => redesignActive(formData),
  }),
  treatmentDateVA: pageBuilder.itemPage({
    title: 'Treatment date',
    path: EVIDENCE_URLS.vaTreatmentDateDetails,
    uiSchema: dateDetailsPage.uiSchema,
    schema: dateDetailsPage.schema,
    depends: (formData, index) =>
      redesignActive(formData) && hasTreatmentBefore2005(formData, index),
  }),
}));
