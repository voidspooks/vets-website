import React from 'react';
import { cloneDeep } from 'lodash';
import {
  arrayBuilderItemFirstPageTitleUI,
  arrayBuilderItemSubsequentPageTitleUI,
  arrayBuilderYesNoSchema,
  arrayBuilderYesNoUI,
  currentOrPastDateSchema,
  currentOrPastDateUI,
  fullNameNoSuffixSchema,
  fullNameNoSuffixUI,
  titleUI,
  textUI,
  textSchema,
  yesNoSchema,
  yesNoUI,
  ssnSchema,
  ssnUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { arrayBuilderPages } from 'platform/forms-system/src/js/patterns/array-builder';
import VaDateField from 'platform/forms-system/src/js/web-component-fields/VaDateField';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import {
  apportionmentInformationText,
  requestedApportionmentPersonFields,
} from '../definitions/constants';

const personFields = requestedApportionmentPersonFields;

const requestedPersonFullNameUI = cloneDeep(fullNameNoSuffixUI());
requestedPersonFullNameUI.first['ui:title'] =
  apportionmentInformationText.firstNameTitle;
requestedPersonFullNameUI.first['ui:errorMessages'] = {
  required: apportionmentInformationText.firstNameError,
};
requestedPersonFullNameUI.middle['ui:title'] =
  apportionmentInformationText.middleInitialTitle;
requestedPersonFullNameUI.last['ui:title'] =
  apportionmentInformationText.lastNameTitle;
requestedPersonFullNameUI.last['ui:errorMessages'] = {
  required: apportionmentInformationText.lastNameError,
};

const requestedPersonFullNameSchema = cloneDeep(fullNameNoSuffixSchema);
if (requestedPersonFullNameSchema?.properties?.middle) {
  requestedPersonFullNameSchema.properties.middle.maxLength = 1;
}

const buildPersonName = person => {
  const name = person?.[personFields.fullName];
  if (!name) {
    return 'Requested person';
  }

  return `${name.first || ''} ${name.middle || ''} ${name.last || ''}`
    .trim()
    .replace(/\s+/g, ' ');
};

const getRequestedPersonAtIndex = (formData, index) =>
  formData?.[personFields.parentObject]?.[index];

const getStepchildLivesWithVeteranValue = (formData, index) =>
  getRequestedPersonAtIndex(formData, index)?.[
    personFields.stepchildLivesWithVeteran
  ];

const isNegativeSelection = value => value === false || value === 'N';

/** @type {ArrayBuilderOptions} */
const options = {
  arrayPath: personFields.parentObject,
  nounSingular: apportionmentInformationText.requestedPeopleNounSingular,
  nounPlural: apportionmentInformationText.requestedPeopleNounPlural,
  required: true,
  maxItems: 4,
  isItemIncomplete: item =>
    !item?.[personFields.fullName] ||
    !item?.[personFields.ssn] ||
    !item?.[personFields.veteranRelationshipDescription] ||
    item?.[personFields.receivesApportionmentNow] === undefined ||
    (item?.[personFields.receivesApportionmentNow] === true &&
      item?.[personFields.stepchildLivesWithVeteran] === undefined) ||
    (isNegativeSelection(item?.[personFields.stepchildLivesWithVeteran]) &&
      !item?.[personFields.stepchildDepartureDate]) ||
    item?.[personFields.adoptedChildrenQuestion] === undefined,
  text: {
    getItemName: item => buildPersonName(item),
    cardDescription: item => {
      const parts = [];

      if (item?.[personFields.veteranRelationshipDescription]) {
        parts.push(item[personFields.veteranRelationshipDescription]);
      }

      if (item?.[personFields.receivesApportionmentNow] !== undefined) {
        parts.push(
          item[personFields.receivesApportionmentNow]
            ? 'Currently receives apportionment'
            : 'Does not currently receive apportionment',
        );
      }

      return parts.join(' • ');
    },
  },
};

const introPage = {
  uiSchema: {
    ...titleUI(
      apportionmentInformationText.requestedPeopleSummaryTitle,
      apportionmentInformationText.requestedPeopleSummaryDescription,
    ),
    'ui:description': (
      <VaAlert status="info" uswds visible>
        <h2 slot="headline">What to expect</h2>
        <ul className="vads-u-margin-y--0">
          <li>Add each person you are requesting an apportionment for.</li>
          <li>The first person is required.</li>
          <li>You can add up to 4 people total.</li>
        </ul>
      </VaAlert>
    ),
  },
  schema: {
    type: 'object',
    properties: {},
  },
};

const summaryPage = {
  uiSchema: {
    'view:hasRequestedPeople': arrayBuilderYesNoUI(options, {
      title: 'Do you need to add another person?',
      hint: 'You can add up to 4 people total.',
      labels: {
        Y: 'Yes, add another person',
        N: 'No',
      },
      errorMessages: {
        required: apportionmentInformationText.requestedPeopleError,
      },
    }),
  },
  schema: {
    type: 'object',
    properties: {
      'view:hasRequestedPeople': arrayBuilderYesNoSchema,
    },
    required: ['view:hasRequestedPeople'],
  },
};

const personIdentityPage = {
  uiSchema: {
    ...arrayBuilderItemFirstPageTitleUI({
      title: apportionmentInformationText.requestedPeopleIdentityPageTitle,
      nounSingular: options.nounSingular,
    }),
    [personFields.fullName]: requestedPersonFullNameUI,
    [personFields.ssn]: {
      ...ssnUI(),
      'ui:errorMessages': {
        required: apportionmentInformationText.ssnRequiredError,
        pattern: apportionmentInformationText.ssnPatternError,
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [personFields.fullName]: requestedPersonFullNameSchema,
      [personFields.ssn]: ssnSchema,
    },
    required: [personFields.fullName, personFields.ssn],
  },
};

const personRelationshipPage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      apportionmentInformationText.requestedPeopleRelationshipPageTitle,
    ),
    [personFields.veteranRelationshipDescription]: textUI({
      title: apportionmentInformationText.relationshipTitle,
      errorMessages: {
        required: `Enter the ${apportionmentInformationText.relationshipTitle.toLowerCase()}`,
      },
    }),
  },
  schema: {
    type: 'object',
    properties: {
      [personFields.veteranRelationshipDescription]: {
        ...textSchema,
        maxLength: 100,
      },
    },
    required: [personFields.veteranRelationshipDescription],
  },
};

const personReceiptPage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      apportionmentInformationText.requestedPeopleReceiptPageTitle,
    ),
    [personFields.receivesApportionmentNow]: yesNoUI({
      title: apportionmentInformationText.currentlyReceivingTitle,
      required: () => true,
      errorMessages: {
        required: apportionmentInformationText.yesNoError,
      },
    }),
  },
  schema: {
    type: 'object',
    properties: {
      [personFields.receivesApportionmentNow]: yesNoSchema,
    },
    required: [personFields.receivesApportionmentNow],
  },
};

const personStepchildPage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      apportionmentInformationText.requestedPeopleStepchildPageTitle,
    ),
    [personFields.stepchildLivesWithVeteran]: yesNoUI({
      title: apportionmentInformationText.stepchildQuestionTitle,
      required: () => true,
      errorMessages: {
        required: apportionmentInformationText.yesNoError,
      },
    }),
    [personFields.stepchildDepartureDate]: {
      ...currentOrPastDateUI({
        title: apportionmentInformationText.stepchildDepartureDateTitle,
        hint: apportionmentInformationText.stepchildDepartureDateHint,
      }),
      'ui:webComponentField': VaDateField,
      'ui:required': (formData, index) =>
        isNegativeSelection(getStepchildLivesWithVeteranValue(formData, index)),
      'ui:options': {
        hideIf: (formData, index) =>
          !isNegativeSelection(
            getStepchildLivesWithVeteranValue(formData, index),
          ),
        hideEmptyValueInReview: true,
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [personFields.stepchildLivesWithVeteran]: yesNoSchema,
      [personFields.stepchildDepartureDate]: currentOrPastDateSchema,
    },
    required: [personFields.stepchildLivesWithVeteran],
  },
};

const personAdoptionPage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      apportionmentInformationText.requestedPeopleAdoptionPageTitle,
    ),
    [personFields.adoptedChildrenQuestion]: yesNoUI({
      title: apportionmentInformationText.adoptedChildrenTitle,
      required: () => true,
      errorMessages: {
        required: apportionmentInformationText.yesNoError,
      },
    }),
  },
  schema: {
    type: 'object',
    properties: {
      [personFields.adoptedChildrenQuestion]: yesNoSchema,
    },
    required: [personFields.adoptedChildrenQuestion],
  },
};

export const __testables = {
  buildPersonName,
  getRequestedPersonAtIndex,
  getStepchildLivesWithVeteranValue,
  isNegativeSelection,
  options,
};

export default arrayBuilderPages(options, pageBuilder => ({
  requestedApportionmentPeopleIntro: pageBuilder.introPage({
    title: apportionmentInformationText.requestedPeopleSummaryTitle,
    path: 'requested-apportionment-people',
    uiSchema: introPage.uiSchema,
    schema: introPage.schema,
  }),
  requestedApportionmentPeopleSummary: pageBuilder.summaryPage({
    title: `Review your ${
      apportionmentInformationText.requestedPeopleNounPlural
    }`,
    path: 'requested-apportionment-people-summary',
    uiSchema: summaryPage.uiSchema,
    schema: summaryPage.schema,
  }),
  requestedApportionmentPersonIdentityPage: pageBuilder.itemPage({
    title: apportionmentInformationText.requestedPeopleIdentityPageTitle,
    path: 'requested-apportionment-people/:index/name-and-ssn',
    uiSchema: personIdentityPage.uiSchema,
    schema: personIdentityPage.schema,
  }),
  requestedApportionmentPersonRelationshipPage: pageBuilder.itemPage({
    title: apportionmentInformationText.requestedPeopleRelationshipPageTitle,
    path: 'requested-apportionment-people/:index/relationship',
    uiSchema: personRelationshipPage.uiSchema,
    schema: personRelationshipPage.schema,
  }),
  requestedApportionmentPersonReceiptPage: pageBuilder.itemPage({
    title: apportionmentInformationText.requestedPeopleReceiptPageTitle,
    path: 'requested-apportionment-people/:index/current-apportionment',
    uiSchema: personReceiptPage.uiSchema,
    schema: personReceiptPage.schema,
  }),
  requestedApportionmentPersonStepchildPage: pageBuilder.itemPage({
    title: apportionmentInformationText.requestedPeopleStepchildPageTitle,
    path: 'requested-apportionment-people/:index/stepchild-household',
    uiSchema: personStepchildPage.uiSchema,
    schema: personStepchildPage.schema,
    depends: (formData, index) =>
      getRequestedPersonAtIndex(formData, index)?.[
        personFields.receivesApportionmentNow
      ] === true,
  }),
  requestedApportionmentPersonAdoptionPage: pageBuilder.itemPage({
    title: apportionmentInformationText.requestedPeopleAdoptionPageTitle,
    path: 'requested-apportionment-people/:index/adoption-question',
    uiSchema: personAdoptionPage.uiSchema,
    schema: personAdoptionPage.schema,
  }),
}));
