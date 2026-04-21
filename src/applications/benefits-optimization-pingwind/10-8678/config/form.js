import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import footerContent from 'platform/forms/components/FormFooter';
import { minimalHeaderFormConfigOptions } from 'platform/forms-system/src/js/patterns/minimal-header';

import manifest from '../manifest.json';
import IntroductionPage from '../containers/IntroductionPage';
import ConfirmationPage from '../containers/ConfirmationPage';
import getHelp from '../../shared/components/GetFormHelp';
import transformForSubmit from './submit-transformer';
import prefillTransformer from './prefill-transformer';
import { TITLE, SUBTITLE, FORM_ID } from '../definitions/constants';

import mailingAddress from '../pages/mailingAddress';
import phoneAndEmailAddress from '../pages/phoneAndEmailAddress';
import benefitStatus from '../pages/benefitStatus';
import vhaMedicalFacility from '../pages/vhaMedicalFacility';
import deviceApplianceMedicationDetails from '../pages/deviceApplianceMedicationDetails';
import personalInformation from '../pages/personalInformation';
import benefitTerminationCertification from '../pages/benefitTerminationCertification';
import applicationCertification from '../pages/applicationCertification';

/** @type {FormConfig} */
const formConfig = {
  rootUrl: manifest.rootUrl,
  urlPrefix: '/',
  submitUrl: `${environment.API_URL}/simple_forms_api/v1/simple_forms`,
  trackingPrefix: 'clothing-allowance-10-8678-',
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  formId: FORM_ID,
  prefillEnabled: true,
  prefillTransformer,
  transformForSubmit,
  preSubmitInfo: {
    statementOfTruth: {
      body:
        'I certify that because of my service-connected disability or disabilities, I regularly wear or use the appliance(s) or skin medication(s) listed in this application, which damage my clothing. I acknowledge that applying for or receiving more than one clothing allowance requires yearly submission on or before August 1.',
      messageAriaDescribedby:
        'I certify that the information I provided is true and correct.',
      fullNamePath: 'fullName',
    },
  },
  dev: {
    showNavLinks: true,
    collapsibleNavLinks: true,
    disableWindowUnloadInCI: true,
  },
  saveInProgress: {},
  version: 0,
  hideUnauthedStartLink: true,
  savedFormMessages: {
    notFound: 'Please start over to apply for annual clothing allowance.',
    noAuth:
      'Please sign in again to continue your application for annual clothing allowance.',
  },
  title: TITLE,
  subTitle: SUBTITLE,
  defaultDefinitions: {},
  chapters: {
    personalInformationChapter: {
      title: 'Veteran ID Information',
      pages: {
        personalInformation: {
          path: 'personal-information',
          title: 'Your full name',
          uiSchema: personalInformation.uiSchema,
          schema: personalInformation.schema,
        },
      },
    },
    mailingInformationChapter: {
      title: 'Mailing Address',
      pages: {
        mailingAddress: {
          path: 'mailing-address',
          title: 'Your mailing address',
          uiSchema: mailingAddress.uiSchema,
          schema: mailingAddress.schema,
        },
      },
    },
    contactInformationChapter: {
      title: 'Contact Information',
      pages: {
        phoneAndEmailAddress: {
          path: 'phone-and-email-address',
          title: 'Your phone and email address',
          uiSchema: phoneAndEmailAddress.uiSchema,
          schema: phoneAndEmailAddress.schema,
        },
      },
    },
    benefitStatusChapter: {
      title: 'Benefit Status',
      pages: {
        benefitStatus: {
          path: 'benefit-status',
          title: 'No longer need a clothing allowance?',
          uiSchema: benefitStatus.uiSchema,
          schema: benefitStatus.schema,
        },
      },
    },
    vhaMedicalFacilityChapter: {
      title: 'VHA Medical Facility',
      pages: {
        vhaMedicalFacility: {
          path: 'vha-medical-facility',
          title: 'Select your local Prosthetic and Sensory Aids Service',
          uiSchema: vhaMedicalFacility.uiSchema,
          schema: vhaMedicalFacility.schema,
        },
      },
    },
    deviceApplianceMedicationChapter: {
      title: 'Device, appliance and medication details',
      pages: {
        deviceApplianceMedicationDetailsPage: {
          path: 'appliances-and-skin-medications',
          title: 'Appliances and skin medications',
          depends: formData => formData?.electTermination === 'continue',
          uiSchema: deviceApplianceMedicationDetails.uiSchema,
          schema: deviceApplianceMedicationDetails.schema,
        },
      },
    },
    applicationCertificationChapter: {
      title: 'Required certification',
      pages: {
        applicationCertification: {
          path: 'required-certifications',
          title: 'Application Certification Statement, Legal Information',
          depends: formData => formData?.electTermination === 'continue',
          uiSchema: applicationCertification.uiSchema,
          schema: applicationCertification.schema,
        },
      },
    },
    benefitTerminationCertificationChapter: {
      title: 'Benefit Termination',
      pages: {
        benefitTerminationCertification: {
          path: 'benefit-termination-certification',
          title: 'Benefit Termination Certification and Legal Information',
          depends: formData =>
            !formData?.electTermination ||
            formData.electTermination === 'terminate',
          uiSchema: benefitTerminationCertification.uiSchema,
          schema: benefitTerminationCertification.schema,
        },
      },
    },
  },

  ...minimalHeaderFormConfigOptions({
    breadcrumbList: [
      { href: '/', label: 'VA.gov home' },
      {
        href: '/disability',
        label: 'Disability',
      },
      {
        href: '/disability/eligibility',
        label: 'Eligibility',
      },
      {
        href: '/disability/eligibility/annual-clothing-allowance',
        label: 'Annual clothing allowance',
      },
      {
        href:
          '/disability/eligibility/annual-clothing-allowance/apply-form-10-8678/',
        label: 'Apply for clothing allowance',
      },
    ],
  }),
  getHelp,
  footerContent,
};

export default formConfig;
