import get from 'platform/utilities/data/get';
import { arrayBuilderPages } from 'platform/forms-system/src/js/patterns/array-builder';
import {
  addressUI,
  addressSchema,
  descriptionUI,
  ssnUI,
  ssnSchema,
  arrayBuilderItemSubsequentPageTitleUI,
  arrayBuilderYesNoSchema,
  arrayBuilderYesNoUI,
  phoneUI,
  phoneSchema,
  emailUI,
  emailSchema,
  yesNoUI,
  yesNoSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { applicantWording } from '../../shared/utilities';

import { validateApplicant, validateApplicantSsn } from '../utils/validations';
import { isOfCollegeAge, requireBirthCertificate } from '../utils/helpers';
import { attachmentSchema, attachmentUI } from '../definitions';
import { APPLICANTS_MAX } from '../utils/constants';
import { NOT_SHARED } from '../components/FormFields/AddressSelectionField';

import sectionOverview from './applicantInformation/sectionOverview';
import personalInformation from './applicantInformation/personalInformation';
import addressSelection from './applicantInformation/addressSelection';
import remarriageProof from './applicantInformation/remarriageProof';
import dependentStatus from './applicantInformation/dependentStatus';
import schoolEnrollmentProof from './applicantInformation/schoolEnrollmentProof';
import marriageDate from './applicantInformation/marriageDate';
import stepchildMarriageProof from './applicantInformation/stepchildMarriageProof';
import birthSex from './applicantInformation/birthSex';
import birthCertificate from './applicantInformation/birthCertificate';
import relationshipToVeteran from './applicantInformation/relationshipToVeteran';
import relationshipOrigin from './applicantInformation/relationshipOrigin';
import ApplicantSummaryCard from '../components/FormDescriptions/ApplicantSummaryCard';
import FileUploadDescription from '../components/FormDescriptions/FileUploadDescription';
import { titleWithNameUI } from '../utils/titles';

export const applicantOptions = {
  arrayPath: 'applicants',
  nounSingular: 'applicant',
  nounPlural: 'applicants',
  required: true,
  isItemIncomplete: validateApplicant,
  maxItems: APPLICANTS_MAX,
  text: {
    getItemName: item => applicantWording(item, false, true, false),
    cardDescription: ApplicantSummaryCard,
  },
};

const applicantIdentificationPage = {
  uiSchema: {
    ...titleWithNameUI('%s identification information', null, {
      roleKey: 'view:certifierRole',
      arrayBuilder: true,
    }),
    applicantSsn: {
      ...ssnUI(),
      // Required for SSN uniqueness validation - provides access to full
      // form data in the validation method
      'ui:options': {
        useAllFormData: true,
      },
      'ui:validations': [validateApplicantSsn],
    },
  },
  schema: {
    type: 'object',
    properties: {
      applicantSsn: ssnSchema,
    },
    required: ['applicantSsn'],
  },
};

const applicantMailingAddressPage = {
  uiSchema: {
    ...titleWithNameUI(
      '%s mailing address',
      'We’ll send any important information about this application to this address.',
      { roleKey: 'view:certifierRole', arrayBuilder: true },
    ),
    applicantAddress: addressUI({
      labels: {
        militaryCheckbox:
          'Address is on a military base outside the United States.',
      },
    }),
  },
  schema: {
    type: 'object',
    properties: {
      applicantAddress: addressSchema({ omit: ['street3'] }),
    },
    required: ['applicantAddress'],
  },
};

const applicantContactInfoPage = {
  uiSchema: {
    ...titleWithNameUI(
      '%s contact information',
      'We’ll use this information to contact this applicant if we have any questions about this application.',
      { roleKey: 'view:certifierRole', arrayBuilder: true },
    ),
    applicantPhone: phoneUI(),
    applicantEmailAddress: emailUI({
      required: (formData, index) =>
        index === 0 && formData.certifierRole === 'applicant',
    }),
  },
  schema: {
    type: 'object',
    properties: {
      applicantPhone: phoneSchema,
      applicantEmailAddress: emailSchema,
    },
    required: ['applicantPhone'],
  },
};

const applicantAdoptionUploadPage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      'Upload adoption documents',
      'You’ll need to submit a document showing proof of this applicant’s adoption (like court ordered adoption papers).',
    ),
    ...descriptionUI(FileUploadDescription),
    applicantAdoptionPapers: attachmentUI({
      label: 'Upload a copy of adoption documents',
      attachmentId: 'Court ordered adoption papers',
    }),
  },
  schema: {
    type: 'object',
    required: ['applicantAdoptionPapers'],
    properties: {
      applicantAdoptionPapers: attachmentSchema,
    },
  },
};

const applicantRemarriedPage = {
  uiSchema: {
    ...titleWithNameUI('%s marriage status', null, {
      roleKey: 'view:certifierRole',
      arrayBuilder: true,
    }),
    applicantRemarried: {
      ...yesNoUI({
        title: 'Has this applicant remarried?',
        updateUiSchema: formData => {
          return {
            'ui:title': `Has ${applicantWording(formData, false)} remarried?`,
          };
        },
      }),
    },
  },
  schema: {
    type: 'object',
    required: ['applicantRemarried'],
    properties: {
      applicantRemarried: yesNoSchema,
    },
  },
};

const applicantSummaryPage = {
  uiSchema: {
    'view:hasApplicants': arrayBuilderYesNoUI(applicantOptions),
  },
  schema: {
    type: 'object',
    properties: {
      'view:hasApplicants': arrayBuilderYesNoSchema,
    },
    required: ['view:hasApplicants'],
  },
};

export const applicantPages = arrayBuilderPages(
  applicantOptions,
  pageBuilder => ({
    applicantIntro: pageBuilder.introPage({
      path: 'applicant-information-overview',
      title: '[noun plural]',
      ...sectionOverview,
    }),
    applicantSummary: pageBuilder.summaryPage({
      path: 'review-applicants',
      title: 'Review applicants',
      ...applicantSummaryPage,
    }),
    page13: pageBuilder.itemPage({
      path: 'applicant-name-and-date-of-birth/:index',
      title: 'Applicant name and date of birth',
      ...personalInformation,
    }),
    page14: pageBuilder.itemPage({
      path: 'applicant-social-security-number/:index',
      title: 'Applicant identification information',
      ...applicantIdentificationPage,
    }),
    page15a: pageBuilder.itemPage({
      path: 'applicant-address/:index',
      title: 'Address selection',
      depends: formData => {
        const hasCertifierAddress = get('street', formData.certifierAddress);
        const hasSponsorAddress = get('street', formData.sponsorAddress);
        return hasSponsorAddress || hasCertifierAddress;
      },
      ...addressSelection,
    }),
    page15: pageBuilder.itemPage({
      path: 'applicant-mailing-address/:index',
      title: 'Mailing address',
      depends: (formData, index) => {
        const val = get('view:sharesAddressWith', formData.applicants?.[index]);
        return !val || val === NOT_SHARED;
      },
      ...applicantMailingAddressPage,
    }),
    page16: pageBuilder.itemPage({
      path: 'applicant-contact-information/:index',
      title: 'Contact information',
      ...applicantContactInfoPage,
    }),
    page17: pageBuilder.itemPage({
      path: 'applicant-birth-sex/:index',
      title: 'Birth sex',
      ...birthSex,
    }),
    page18: pageBuilder.itemPage({
      path: 'applicant-relationship-to-veteran/:index',
      title: 'Relationship to the Veteran',
      ...relationshipToVeteran,
    }),
    page18c: pageBuilder.itemPage({
      path: 'applicant-dependent-status/:index',
      title: 'Dependent status',
      depends: (formData, index) =>
        get(
          'applicantRelationshipToSponsor.relationshipToVeteran',
          formData?.applicants?.[index],
        ) === 'child',
      ...relationshipOrigin,
    }),
    page18a: pageBuilder.itemPage({
      path: 'applicant-birth-certificate/:index',
      title: 'Applicant birth certificate',
      depends: requireBirthCertificate,
      ...birthCertificate,
    }),
    page18d: pageBuilder.itemPage({
      path: 'applicant-adoption-documents/:index',
      title: 'Applicant adoption documents',
      depends: (formData, index) =>
        get(
          'applicantRelationshipToSponsor.relationshipToVeteran',
          formData?.applicants?.[index],
        ) === 'child' &&
        get(
          'applicantRelationshipOrigin.relationshipToVeteran',
          formData?.applicants?.[index],
        ) === 'adoption',
      ...applicantAdoptionUploadPage,
    }),
    page18e: pageBuilder.itemPage({
      path: 'applicant-proof-of-marriage-or-legal-union/:index',
      title: 'Upload proof of parent’s marriage or legal union',
      depends: (formData, index) =>
        get(
          'applicantRelationshipToSponsor.relationshipToVeteran',
          formData?.applicants?.[index],
        ) === 'child' &&
        get(
          'applicantRelationshipOrigin.relationshipToVeteran',
          formData?.applicants?.[index],
        ) === 'step',
      ...stepchildMarriageProof,
    }),
    page18b1: pageBuilder.itemPage({
      path: 'applicant-dependent-status-details/:index',
      title: 'Applicant dependent status',
      depends: (formData, index) =>
        formData.applicants[index]?.applicantRelationshipToSponsor
          ?.relationshipToVeteran === 'child' &&
        isOfCollegeAge(formData.applicants[index]?.applicantDob),
      ...dependentStatus,
    }),
    page18b: pageBuilder.itemPage({
      path: 'applicant-proof-of-school-enrollment/:index',
      title: 'Applicant school documents',
      depends: (formData, index) =>
        formData.applicants[index]?.applicantRelationshipToSponsor
          ?.relationshipToVeteran === 'child' &&
        isOfCollegeAge(formData.applicants[index]?.applicantDob) &&
        ['enrolled', 'intendsToEnroll'].includes(
          formData.applicants[index]?.applicantDependentStatus?.status,
        ),
      ...schoolEnrollmentProof,
    }),
    page18f3: pageBuilder.itemPage({
      path: 'applicant-marriage-dates/:index',
      title: 'Applicant marriage dates',
      depends: (formData, index) =>
        get(
          'applicantRelationshipToSponsor.relationshipToVeteran',
          formData?.applicants?.[index],
        ) === 'spouse',
      ...marriageDate,
    }),
    page18f4: pageBuilder.itemPage({
      path: 'applicant-marriage-status/:index',
      title: 'Marriage status',
      depends: (formData, index) =>
        get(
          'applicantRelationshipToSponsor.relationshipToVeteran',
          formData?.applicants?.[index],
        ) === 'spouse' && get('sponsorIsDeceased', formData),
      ...applicantRemarriedPage,
    }),
    page18g: pageBuilder.itemPage({
      path: 'applicant-proof-of-remarriage/:index',
      title: 'Upload proof of remarriage',
      depends: (formData, index) =>
        get(
          'applicantRelationshipToSponsor.relationshipToVeteran',
          formData?.applicants?.[index],
        ) === 'spouse' &&
        get('sponsorIsDeceased', formData) &&
        get('applicantRemarried', formData?.applicants?.[index]),
      ...remarriageProof,
    }),
  }),
);
