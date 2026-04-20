import React from 'react';
import {
  addressNoMilitaryUI,
  addressNoMilitarySchema,
  arrayBuilderItemFirstPageTitleUI,
  arrayBuilderItemSubsequentPageTitleUI,
  arrayBuilderYesNoSchema,
  arrayBuilderYesNoUI,
  checkboxGroupSchema,
  currentOrPastDateDigitsSchema,
  currentOrPastDateDigitsUI,
  descriptionUI,
  textUI,
  textSchema,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import VaCheckboxGroupField from 'platform/forms-system/src/js/web-component-fields/VaCheckboxGroupField';
import { validateBooleanGroup } from 'platform/forms-system/src/js/validation';
import { arrayBuilderPages } from 'platform/forms-system/src/js/patterns/array-builder';
import { getAddOrEditMode, getSelectedIssues } from '../../utils/evidence';
import {
  EVIDENCE_URLS,
  PRIVATE_EVIDENCE_KEY,
  PRIVATE_TREATMENT_LOCATION_KEY,
} from '../../constants';
import {
  customizableLLText,
  detailsEntryContent,
  introContent,
  summaryContent,
  treatmentDateContent,
} from '../../content/evidence/private';
import { getSelected } from '../../../shared/utils/issues';
import { hasPrivateEvidence } from '../../utils/form-data-retrieval';
import { redesignActive } from '../../utils';
import PrivateRecordsDeletedAlert from '../../components/evidence/PrivateRecordsDeletedAlert';

/**
 * This is how we determine whether all of the info for one
 * evidence record is complete. This is what the summary page
 * uses to display an error or not
 * @param {object} item
 * @returns bool
 */
const itemIsComplete = item => {
  const {
    address,
    privateTreatmentLocation,
    treatmentStart,
    treatmentEnd,
  } = item;
  const { city, country, postalCode, state, street } = address;
  const issuesComplete = getSelectedIssues(item)?.length > 0;
  let addressIsComplete = false;

  if (country === 'USA') {
    addressIsComplete =
      address && city && country && postalCode && state && street;
  } else {
    addressIsComplete = address && city && country && postalCode && street;
  }

  const treatmentDatesComplete = treatmentStart && treatmentEnd;

  return (
    addressIsComplete &&
    issuesComplete &&
    treatmentDatesComplete &&
    privateTreatmentLocation
  );
};

/**
 * This is the config object for the VA evidence list & loop
 * Here, we can also configure the content on the summary page
 * including the layout of the evidence cards for review
 */
/** @type {ArrayBuilderOptions} */
const options = {
  arrayPath: PRIVATE_EVIDENCE_KEY,
  nounSingular: 'record',
  nounPlural: 'records',
  required: true,
  isItemIncomplete: item => !itemIsComplete(item),
  maxItems: 100,
  text: {
    alertItemUpdated: ({ itemData }) =>
      summaryContent.alertItemUpdatedText(itemData),
    cardDescription: item => summaryContent.cardDescription(item),
    getItemName: item => item?.[PRIVATE_TREATMENT_LOCATION_KEY],
    summaryTitle: summaryContent.title,
    cancelEditDescription: customizableLLText.cancelEditDescription,
    cancelEditTitle: customizableLLText.cancelEditTitle,
    deleteYes: customizableLLText.deleteYes,
    deleteNo: customizableLLText.deleteNo,
    deleteDescription: customizableLLText.deleteDescription,
    deleteTitle: customizableLLText.deleteTitle,
    reviewAddButtonText: customizableLLText.reviewAddButtonText,
  },
};

/** @returns {PageSchema} */
const introPage = {
  uiSchema: {
    ...titleUI(introContent.title),
    ...descriptionUI(introContent.description),
  },
  schema: {
    type: 'object',
    properties: {},
  },
};

const summaryPage = {
  uiSchema: {
    hasPrivateEvidence: arrayBuilderYesNoUI(
      options,
      {},
      {
        title: summaryContent.question,
        labels: summaryContent.options,
        labelHeaderLevel: '4',
        hint: null,
        errorMessages: {
          required: summaryContent.requiredError,
        },
      },
    ),
  },
  schema: {
    type: 'object',
    properties: {
      hasPrivateEvidence: arrayBuilderYesNoSchema,
    },
    required: ['hasPrivateEvidence'],
  },
};

/** @returns {PageSchema} */
const locationPage = {
  uiSchema: {
    ...arrayBuilderItemFirstPageTitleUI({
      title: ({ formContext }) =>
        detailsEntryContent.question(formContext, getAddOrEditMode()),
      showEditExplanationText: false,
      nounSingular: options.nounSingular,
    }),
    'ui:description': () => (
      <>
        <PrivateRecordsDeletedAlert />
        <p className="vads-u-font-size--base vads-u-line-height--3 vads-u-margin-top--2 vads-u-margin-bottom--1">
          {detailsEntryContent.label}
        </p>
      </>
    ),
    privateTreatmentLocation: textUI({
      title: detailsEntryContent.locationLabel,
      errorMessages: {
        required: detailsEntryContent.locationRequiredError,
      },
      required: () => true,
    }),
    address: addressNoMilitaryUI({
      omit: ['street3'],
      required: () => true,
    }),
  },
  schema: {
    type: 'object',
    properties: {
      privateTreatmentLocation: textSchema,
      address: addressNoMilitarySchema({
        omit: ['street3'],
      }),
    },
  },
};

const getConditionQuestion = (data, key) =>
  data?.[key]
    ? `What conditions were you treated for at ${data[key]}?`
    : 'What conditions were you treated for?';

const getEditConditionQuestion = (data, key) =>
  data?.[key]
    ? `the conditions you were treated for at ${data[key]}`
    : 'the conditions you were treated for';

export const issuesContent = {
  question: (formData, addOrEdit) => {
    if (addOrEdit === 'add') {
      return getConditionQuestion(formData, PRIVATE_TREATMENT_LOCATION_KEY);
    }

    return getEditConditionQuestion(formData, PRIVATE_TREATMENT_LOCATION_KEY);
  },
  label: 'Select all the service-connected conditions you were treated for.',
  requiredError: 'Select at least 1 condition',
};

// Wrapper component to fix index prop type warning
const VaCheckboxGroupFieldWrapper = props => {
  const index =
    // eslint-disable-next-line react/prop-types
    typeof props.index === 'string' ? parseInt(props.index, 10) : props.index;
  return <VaCheckboxGroupField {...props} index={index} />;
};

// Create base UI with minimal config - labels will be dynamically added
const baseIssuesCheckboxUI = {
  'ui:title': issuesContent.label,
  'ui:webComponentField': VaCheckboxGroupFieldWrapper,
  'ui:errorMessages': {
    atLeastOne: issuesContent.requiredError,
  },
  'ui:required': () => true,
  'ui:validations': [validateBooleanGroup],
};

const issuesPage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(({ formData }) =>
      issuesContent.question(formData, getAddOrEditMode()),
    ),
    issues: {
      ...baseIssuesCheckboxUI,
      'ui:options': {
        updateSchema: (...args) => {
          // eslint-disable-next-line no-unused-vars
          const [_itemData, schema, _uiSchema, index, _path, fullData] = args;

          const selectedIssues = getSelected(fullData).map(issue => {
            if (issue?.attributes) {
              return issue?.attributes?.ratingIssueSubjectText;
            }

            return issue.issue;
          });

          const properties = {};
          const issueUiSchemas = {};

          selectedIssues.forEach(issue => {
            properties[issue] = {
              type: 'boolean',
              title: issue,
            };
            issueUiSchemas[issue] = {
              'ui:title': issue,
            };
          });

          return {
            type: 'object',
            properties,
            issueUiSchemas,
          };
        },
      },
    },
  },
  schema: {
    type: 'object',
    required: ['issues'],
    properties: {
      issues: checkboxGroupSchema(['na']),
    },
  },
};

const customErrorMessages = {
  errorMessages: {
    required: treatmentDateContent.requiredError,
    futureDate: treatmentDateContent.futureError,
  },
  customMonthErrorMessage: treatmentDateContent.customMonthErrorMessage,
  customDayErrorMessage: treatmentDateContent.customDayErrorMessage,
  customYearErrorMessage: treatmentDateContent.customYearErrorMessage,
};

/** @returns {PageSchema} */
const treatmentDatePage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(({ formData }) =>
      treatmentDateContent.question(formData, getAddOrEditMode()),
    ),
    treatmentStart: currentOrPastDateDigitsUI({
      title: treatmentDateContent.firstDateLabel,
      hint: treatmentDateContent.dateHint,
      ...customErrorMessages,
    }),
    treatmentEnd: currentOrPastDateDigitsUI({
      title: treatmentDateContent.lastDateLabel,
      hint: treatmentDateContent.dateHint,
      ...customErrorMessages,
    }),
  },
  schema: {
    type: 'object',
    properties: {
      treatmentStart: currentOrPastDateDigitsSchema,
      treatmentEnd: currentOrPastDateDigitsSchema,
    },
    required: ['treatmentEnd', 'treatmentStart'],
  },
};

/**
 * This is where the array builder gets page configuration.
 * Some items have blank titles because a title is required for the
 * pageBuilder config but the uiSchemas they use also require titles
 * which override the ones here
 */
export default arrayBuilderPages(options, pageBuilder => ({
  privateIntro: pageBuilder.introPage({
    title: introContent.title,
    path: EVIDENCE_URLS.privateIntro,
    uiSchema: introPage.uiSchema,
    schema: introPage.schema,
    depends: formData =>
      redesignActive(formData) && hasPrivateEvidence(formData),
  }),
  privateSummary: pageBuilder.summaryPage({
    title: summaryContent.title,
    path: EVIDENCE_URLS.privateSummary,
    uiSchema: summaryPage.uiSchema,
    schema: summaryPage.schema,
    depends: formData =>
      redesignActive(formData) && hasPrivateEvidence(formData),
  }),
  privateLocation: pageBuilder.itemPage({
    title: '',
    path: EVIDENCE_URLS.privateDetails,
    uiSchema: locationPage.uiSchema,
    schema: locationPage.schema,
    depends: formData =>
      redesignActive(formData) && hasPrivateEvidence(formData),
    pageClass: 'private-location-page', // Used to hide a built-in alert we don't want
  }),
  issues: pageBuilder.itemPage({
    title: '',
    path: EVIDENCE_URLS.privateIssues,
    uiSchema: issuesPage.uiSchema,
    schema: issuesPage.schema,
    depends: formData =>
      redesignActive(formData) && hasPrivateEvidence(formData),
  }),
  treatmentDatePrivate: pageBuilder.itemPage({
    title: 'Treatment date',
    path: EVIDENCE_URLS.privateTreatmentDate,
    uiSchema: treatmentDatePage.uiSchema,
    schema: treatmentDatePage.schema,
    depends: formData =>
      redesignActive(formData) && hasPrivateEvidence(formData),
  }),
}));
