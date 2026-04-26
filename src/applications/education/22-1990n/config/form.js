import environment from 'platform/utilities/environment';
import footerContent from 'platform/forms/components/FormFooter';
import { VA_FORM_IDS } from 'platform/forms/constants';

import manifest from '../manifest.json';
import IntroductionPage from '../containers/IntroductionPage';
import ConfirmationPage from '../containers/ConfirmationPage';

import {
  eligibilityScreenerUiSchema,
  eligibilityScreenerSchema,
} from './chapters/eligibilityScreener';
import {
  personalInformationUiSchema,
  personalInformationSchema,
} from './chapters/personalInformation';
import {
  contactInformationUiSchema,
  contactInformationSchema,
} from './chapters/contactInformation';
import {
  directDepositUiSchema,
  directDepositSchema,
} from './chapters/directDeposit';
import {
  trainingTypeUiSchema,
  trainingTypeSchema,
} from './chapters/trainingType';
import {
  flightTrainingRequirementsUiSchema,
  flightTrainingRequirementsSchema,
} from './chapters/flightTrainingRequirements';
import {
  schoolInformationUiSchema,
  schoolInformationSchema,
} from './chapters/schoolInformation';
import {
  educationObjectiveUiSchema,
  educationObjectiveSchema,
} from './chapters/educationObjective';
import {
  activeDutyStatusUiSchema,
  activeDutyStatusSchema,
} from './chapters/activeDutyStatus';
import {
  servicePeriodsUiSchema,
  servicePeriodsSchema,
} from './chapters/servicePeriods';
import {
  additionalAssistanceUiSchema,
  additionalAssistanceSchema,
} from './chapters/additionalAssistance';
import {
  uploadDD2863UiSchema,
  uploadDD2863Schema,
} from './chapters/uploadDD2863';
import {
  uploadDD214UiSchema,
  uploadDD214Schema,
} from './chapters/uploadDD214';
import {
  uploadVoidedCheckUiSchema,
  uploadVoidedCheckSchema,
} from './chapters/uploadVoidedCheck';

/** @type {FormConfig} */
const formConfig = {
  rootUrl: manifest.rootUrl,
  urlPrefix: '/',
  submitUrl: `${environment.API_URL}/v0/education_benefits_claims/1990n`,
  trackingPrefix: 'edu-1990n-',
  v3SegmentedProgressBar: true,
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  footerContent,
  formId: VA_FORM_IDS.FORM_22_1990N || '22-1990N',
  saveInProgress: {
    messages: {
      inProgress:
        'Your VA education benefits application (22-1990n) is in progress.',
      expired:
        'Your saved application (22-1990n) has expired. Start a new application.',
      saved: 'Your application has been saved.',
    },
  },
  version: 0,
  prefillEnabled: true,
  savedFormMessages: {
    notFound:
      'Start your application to apply for NCS education benefits.',
    noAuth: 'Sign in to check your application status.',
  },
  hideUnauthedStartLink: true,
  title:
    'Apply for VA Education Benefits Under the National Call to Service Program',
  subTitle: 'VA Form 22-1990n',
  defaultDefinitions: {},
  dev: {
    showNavLinks: true,
    collapsibleNavLinks: true,
  },
  chapters: {
    eligibilityChapter: {
      title: 'Eligibility',
      pages: {
        eligibilityScreener: {
          path: 'eligibility',
          title: 'Check your eligibility',
          uiSchema: eligibilityScreenerUiSchema,
          schema: eligibilityScreenerSchema,
        },
      },
    },
    applicantInformationChapter: {
      title: 'Applicant Information',
      pages: {
        personalInformation: {
          path: 'applicant-information/personal-information',
          title: 'Personal information',
          uiSchema: personalInformationUiSchema,
          schema: personalInformationSchema,
        },
        contactInformation: {
          path: 'applicant-information/contact-information',
          title: 'Contact information',
          uiSchema: contactInformationUiSchema,
          schema: contactInformationSchema,
        },
        directDeposit: {
          path: 'applicant-information/direct-deposit',
          title: 'Direct deposit',
          uiSchema: directDepositUiSchema,
          schema: directDepositSchema,
        },
      },
    },
    trainingProgramChapter: {
      title: 'Training Program',
      pages: {
        trainingType: {
          path: 'training-program/training-type',
          title: 'Type of education or training',
          uiSchema: trainingTypeUiSchema,
          schema: trainingTypeSchema,
        },
        flightTrainingRequirements: {
          path: 'training-program/flight-training-requirements',
          title: 'Flight training requirements',
          uiSchema: flightTrainingRequirementsUiSchema,
          schema: flightTrainingRequirementsSchema,
          depends: formData =>
            formData?.trainingProgram?.trainingType
              ?.vocationalFlightTraining === true,
        },
        schoolInformation: {
          path: 'training-program/school-information',
          title: 'School or training establishment',
          uiSchema: schoolInformationUiSchema,
          schema: schoolInformationSchema,
        },
        educationObjective: {
          path: 'training-program/education-objective',
          title: 'Educational or career objective',
          uiSchema: educationObjectiveUiSchema,
          schema: educationObjectiveSchema,
        },
      },
    },
    serviceInformationChapter: {
      title: 'Service Information',
      pages: {
        activeDutyStatus: {
          path: 'service-information/active-duty-status',
          title: 'Active duty status',
          uiSchema: activeDutyStatusUiSchema,
          schema: activeDutyStatusSchema,
        },
        servicePeriods: {
          path: 'service-information/service-periods',
          title: 'Service periods',
          uiSchema: servicePeriodsUiSchema,
          schema: servicePeriodsSchema,
        },
      },
    },
    additionalAssistanceChapter: {
      title: 'Additional Assistance',
      pages: {
        additionalAssistance: {
          path: 'additional-assistance/additional-assistance',
          title: 'Entitlement to additional types of assistance',
          uiSchema: additionalAssistanceUiSchema,
          schema: additionalAssistanceSchema,
        },
      },
    },
    supportingDocumentsChapter: {
      title: 'Supporting Documents',
      pages: {
        uploadDD2863: {
          path: 'supporting-documents/upload-dd-2863',
          title: 'Upload DD Form 2863',
          uiSchema: uploadDD2863UiSchema,
          schema: uploadDD2863Schema,
        },
        uploadDD214: {
          path: 'supporting-documents/upload-dd-214',
          title: 'Upload DD Form 214',
          uiSchema: uploadDD214UiSchema,
          schema: uploadDD214Schema,
        },
        uploadVoidedCheck: {
          path: 'supporting-documents/upload-voided-check',
          title: 'Upload voided check or deposit slip',
          uiSchema: uploadVoidedCheckUiSchema,
          schema: uploadVoidedCheckSchema,
          depends: formData =>
            formData?.directDepositEnrolling === true,
        },
      },
    },
  },
};

export default formConfig;
export { formConfig };