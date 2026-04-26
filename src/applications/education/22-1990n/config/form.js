import environment from 'platform/utilities/environment';
import footerContent from 'platform/forms/components/FormFooter';
import { VA_FORM_IDS } from 'platform/forms/constants';

import manifest from '../manifest.json';
import IntroductionPage from '../containers/IntroductionPage';
import ConfirmationPage from '../containers/ConfirmationPage';
import GetFormHelp from '../components/GetFormHelp';
import transformForSubmit from './submitForm';

import {
  personalInformationUiSchema,
  personalInformationSchema,
  nameUiSchema,
  nameSchema,
  addressUiSchema,
  addressSchema,
  contactInformationUiSchema,
  contactInformationSchema,
} from './chapters/applicantInformation';

import {
  typeOfTrainingUiSchema,
  typeOfTrainingSchema,
  flightTrainingRequirementsUiSchema,
  flightTrainingRequirementsSchema,
  schoolInformationUiSchema,
  schoolInformationSchema,
  careerObjectiveUiSchema,
  careerObjectiveSchema,
  benefitAuthorizationUiSchema,
  benefitAuthorizationSchema,
} from './chapters/educationTraining';

import {
  activeDutyStatusUiSchema,
  activeDutyStatusSchema,
  militaryServiceHistoryUiSchema,
  militaryServiceHistorySchema,
  supportingDocumentsUiSchema,
  supportingDocumentsSchema,
} from './chapters/serviceInformation';

import {
  rotcScholarshipUiSchema,
  rotcScholarshipSchema,
  federalTuitionAssistanceUiSchema,
  federalTuitionAssistanceSchema,
  govtEmployeeUiSchema,
  govtEmployeeSchema,
} from './chapters/concurrentBenefits';

import {
  paymentInformationUiSchema,
  paymentInformationSchema,
  bankDocumentUploadUiSchema,
  bankDocumentUploadSchema,
} from './chapters/directDeposit';

/** @type {FormConfig} */
const formConfig = {
  rootUrl: manifest.rootUrl,
  urlPrefix: '/',
  submitUrl: `${environment.API_URL}/v0/education_benefits_claims/1990n`,
  transformForSubmit,
  trackingPrefix: 'edu-1990n-',
  v3SegmentedProgressBar: true,
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  footerContent,
  getHelp: GetFormHelp,
  formId: VA_FORM_IDS.FORM_22_1990N,
  saveInProgress: {
    messages: {
      inProgress:
        'Your NCS education benefits application (22-1990n) is in progress.',
      expired:
        'Your saved NCS education benefits application has expired. If you want to apply for education benefits under the NCS program, please start a new application.',
      saved: 'Your NCS education benefits application has been saved.',
    },
  },
  version: 0,
  prefillEnabled: true,
  savedFormMessages: {
    notFound:
      'Please start over to apply for NCS education benefits.',
    noAuth:
      'Please sign in again to continue your NCS education benefits application.',
  },
  title:
    'Apply for VA Education Benefits Under the National Call to Service Program',
  subTitle: 'VA Form 22-1990n',
  defaultDefinitions: {},
  chapters: {
    applicantInformation: {
      title: 'Applicant information',
      pages: {
        personalInformation: {
          path: 'applicant-information/personal-information',
          title: 'Personal information',
          uiSchema: personalInformationUiSchema,
          schema: personalInformationSchema,
        },
        name: {
          path: 'applicant-information/name',
          title: 'Your name',
          uiSchema: nameUiSchema,
          schema: nameSchema,
        },
        address: {
          path: 'applicant-information/address',
          title: 'Your address',
          uiSchema: addressUiSchema,
          schema: addressSchema,
        },
        contactInformation: {
          path: 'applicant-information/contact-information',
          title: 'Contact information',
          uiSchema: contactInformationUiSchema,
          schema: contactInformationSchema,
        },
      },
    },
    educationTraining: {
      title: 'Education and training',
      pages: {
        typeOfTraining: {
          path: 'education-training/type-of-training',
          title: 'Type of education or training',
          uiSchema: typeOfTrainingUiSchema,
          schema: typeOfTrainingSchema,
        },
        flightTrainingRequirements: {
          path: 'education-training/flight-training-requirements',
          title: 'Flight training requirements',
          depends: formData =>
            Array.isArray(formData.typeOfEducation) &&
            formData.typeOfEducation.includes('vocationalFlightTraining'),
          uiSchema: flightTrainingRequirementsUiSchema,
          schema: flightTrainingRequirementsSchema,
        },
        schoolInformation: {
          path: 'education-training/school-information',
          title: 'School information',
          uiSchema: schoolInformationUiSchema,
          schema: schoolInformationSchema,
        },
        careerObjective: {
          path: 'education-training/career-objective',
          title: 'Educational or career objective',
          uiSchema: careerObjectiveUiSchema,
          schema: careerObjectiveSchema,
        },
        benefitAuthorization: {
          path: 'education-training/benefit-authorization',
          title: 'Benefit authorization',
          uiSchema: benefitAuthorizationUiSchema,
          schema: benefitAuthorizationSchema,
        },
      },
    },
    serviceInformation: {
      title: 'Service information',
      pages: {
        activeDutyStatus: {
          path: 'service-information/active-duty-status',
          title: 'Active duty status',
          uiSchema: activeDutyStatusUiSchema,
          schema: activeDutyStatusSchema,
        },
        militaryServiceHistory: {
          path: 'service-information/military-service-history',
          title: 'Military service history',
          uiSchema: militaryServiceHistoryUiSchema,
          schema: militaryServiceHistorySchema,
        },
        supportingDocuments: {
          path: 'service-information/supporting-documents',
          title: 'Supporting documents',
          uiSchema: supportingDocumentsUiSchema,
          schema: supportingDocumentsSchema,
        },
      },
    },
    concurrentBenefits: {
      title: 'Concurrent benefits',
      pages: {
        rotcScholarship: {
          path: 'concurrent-benefits/rotc-scholarship',
          title: 'Senior ROTC scholarship',
          uiSchema: rotcScholarshipUiSchema,
          schema: rotcScholarshipSchema,
        },
        federalTuitionAssistance: {
          path: 'concurrent-benefits/federal-tuition-assistance',
          title: 'Federal tuition assistance',
          depends: formData => formData.activeDuty === true,
          uiSchema: federalTuitionAssistanceUiSchema,
          schema: federalTuitionAssistanceSchema,
        },
        govtCivilianEmployment: {
          path: 'concurrent-benefits/government-civilian-employment',
          title: 'Government civilian employment',
          uiSchema: govtEmployeeUiSchema,
          schema: govtEmployeeSchema,
        },
      },
    },
    directDeposit: {
      title: 'Direct deposit',
      pages: {
        paymentInformation: {
          path: 'direct-deposit/payment-information',
          title: 'Payment information',
          uiSchema: paymentInformationUiSchema,
          schema: paymentInformationSchema,
        },
        uploadBankDocument: {
          path: 'direct-deposit/upload-bank-document',
          title: 'Upload bank document',
          depends: formData =>
            formData.directDeposit &&
            formData.directDeposit.bankAccount &&
            formData.directDeposit.bankAccount.routingNumber &&
            !(
              formData.directDeposit.noDirectDeposit &&
              formData.directDeposit.noDirectDeposit.declined
            ),
          uiSchema: bankDocumentUploadUiSchema,
          schema: bankDocumentUploadSchema,
        },
      },
    },
  },
};

export default formConfig;
export { formConfig };