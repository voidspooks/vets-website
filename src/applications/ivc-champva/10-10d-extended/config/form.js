import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import { externalServices } from 'platform/monitoring/DowntimeNotification';
import { minimalHeaderFormConfigOptions } from 'platform/forms-system/src/js/patterns/minimal-header';
import { VA_FORM_IDS } from 'platform/forms/constants';
import manifest from '../manifest.json';
import IntroductionPage from '../containers/IntroductionPage';
import ConfirmationPage from '../containers/ConfirmationPage';
import SubmissionError from '../../shared/components/SubmissionError';
import FormFooter from '../components/FormFooter';
import content from '../locales/en/content.json';
import migrations from './migrations';
import transformForSubmit from './submitTransformer';
import { medicarePages } from '../chapters/medicare';
import { certifierPages } from '../chapters/certifier';
import { sponsorPages } from '../chapters/sponsor';
import { applicantPages } from '../chapters/applicant';
import { healthInsurancePages } from '../chapters/healthInsurance';
import { applicationStatusPages } from '../chapters/applicationStatus';

/** @type {FormConfig}  */
const formConfig = {
  rootUrl: manifest.rootUrl,
  urlPrefix: '/',
  transformForSubmit,
  submitUrl: `${environment.API_URL}/ivc_champva/v1/forms/10-10d-ext`,
  preSubmitInfo: {
    statementOfTruth: {
      body:
        'I confirm that the identifying information in this form is accurate and has been represented correctly.',
      messageAriaDescribedby:
        'I confirm that the identifying information in this form is accurate and has been represented correctly.',
      fullNamePath: ({ certifierRole } = {}) =>
        ({ other: 'certifierName', sponsor: 'sponsorName' }[certifierRole] ??
        'applicants.0.applicantName'),
    },
  },
  trackingPrefix: '10-10d-extended-',
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  submissionError: SubmissionError,
  footerContent: FormFooter,
  customText: { appType: 'form' },
  dev: {
    showNavLinks: false,
    collapsibleNavLinks: true,
    disableWindowUnloadInCI: true,
  },
  formOptions: {
    useWebComponentForNavigation: true,
    filterInactiveNestedPageData: true,
  },
  ...minimalHeaderFormConfigOptions({
    breadcrumbList: [
      {
        href: `/family-and-caregiver-benefits`,
        label: `Family and caregiver benefits`,
      },
      {
        href: `/family-and-caregiver-benefits/health-and-disability/`,
        label: `Health and disability benefits for family and caregivers`,
      },
      {
        href: `/family-and-caregiver-benefits/health-and-disability/champva`,
        label: `CHAMPVA benefits`,
      },
      {
        href: `#content`,
        label: `Apply for CHAMPVA benefits`,
      },
    ],
    homeVeteransAffairs: true,
    wrapping: true,
  }),
  formId: VA_FORM_IDS.FORM_10_10D_EXTENDED,
  downtime: {
    dependencies: [externalServices.pega, externalServices.form1010dExt],
  },
  saveInProgress: {
    messages: {
      inProgress: 'Your CHAMPVA benefits application (10-10D) is in progress.',
      expired:
        'Your saved CHAMPVA benefits application (10-10D) has expired. If you want to apply for CHAMPVA benefits, please start a new application.',
      saved: 'Your CHAMPVA benefits application has been saved.',
    },
  },
  migrations,
  version: migrations.length,
  prefillEnabled: false,
  savedFormMessages: {
    notFound:
      'Please start over to apply for CHAMPVA application (includes 10-7959c).',
    noAuth:
      'Please sign in again to continue your application for CHAMPVA application (includes 10-7959c).',
  },
  title: content['form-title'],
  subTitle: content['form-subtitle'],
  defaultDefinitions: {},
  chapters: {
    applicationStatus: {
      title: 'Application status',
      pages: applicationStatusPages,
    },
    sponsorInformation: {
      title: 'Veteran information',
      pages: sponsorPages,
    },
    applicantInformation: {
      title: 'Applicant information',
      pages: applicantPages,
    },
    medicareInformation: {
      title: 'Other Health Insurance Certification: Medicare information',
      pages: medicarePages,
    },
    healthInsuranceInformation: {
      title:
        'Other Health Insurance Certification: Health insurance information',
      pages: healthInsurancePages,
    },
    certifierInformation: {
      title: 'Your information',
      pages: certifierPages,
    },
  },
};

export default formConfig;
