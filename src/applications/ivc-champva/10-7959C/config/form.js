import { minimalHeaderFormConfigOptions } from 'platform/forms-system/src/js/patterns/minimal-header';
import environment from 'platform/utilities/environment';
import { externalServices } from 'platform/monitoring/DowntimeNotification';
import manifest from '../manifest.json';
import IntroductionPage from '../containers/IntroductionPage';
import ConfirmationPage from '../containers/ConfirmationPage';
import PreSubmitInfo from '../components/PreSubmitInfo';
import FormFooter from '../components/FormFooter';
import prefillTransformer from './prefillTransformer';
import transformForSubmit from './submitTransformer';
import SubmissionError from '../../shared/components/SubmissionError';
import migrations from './migrations';
import { chapters } from '../chapters';

/** @type {FormConfig} */
const formConfig = {
  rootUrl: manifest.rootUrl,
  urlPrefix: '/',
  submitUrl: `${environment.API_URL}/ivc_champva/v1/forms`,
  trackingPrefix: '10-7959C-',
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  v3SegmentedProgressBar: true,
  footerContent: FormFooter,
  submissionError: SubmissionError,
  formId: '10-7959C',
  dev: {
    collapsibleNavLinks: true,
    disableWindowUnloadInCI: true,
    showNavLinks: false,
  },
  formOptions: {
    useWebComponentForNavigation: true,
    filterInactiveNestedPageData: true,
  },
  downtime: {
    dependencies: [externalServices.pega, externalServices.form107959c],
  },
  preSubmitInfo: PreSubmitInfo,
  customText: {
    appType: 'form',
    continueAppButtonText: 'Continue your form',
    reviewPageTitle: 'Review and sign',
    startNewAppButtonText: 'Start a new form',
  },
  saveInProgress: {
    messages: {
      inProgress:
        'Your CHAMPVA other health insurance certification application (10-7959C) is in progress.',
      expired:
        'Your saved CHAMPVA other health insurance certification application (10-7959C) has expired. If you want to apply for CHAMPVA other health insurance certification, please start a new application.',
      saved:
        'Your CHAMPVA other health insurance certification application has been saved.',
    },
  },
  version: migrations.length,
  migrations,
  prefillEnabled: false,
  prefillTransformer,
  transformForSubmit,
  savedFormMessages: {
    notFound:
      'Please start over to apply for CHAMPVA other health insurance certification.',
    noAuth:
      'Please sign in again to continue your application for CHAMPVA other health insurance certification.',
  },
  title: 'Submit other health insurance',
  subTitle: 'CHAMPVA Other Health Insurance Certification (VA Form 10-7959c)',
  ...minimalHeaderFormConfigOptions({
    breadcrumbList: [
      {
        href: '/family-and-caregiver-benefits/',
        label: 'VA benefits for family and caregivers',
      },
      {
        href: '/family-and-caregiver-benefits/health-and-disability/',
        label: 'Health and disability benefits for family and caregivers',
      },
      {
        href: '/family-and-caregiver-benefits/health-and-disability/champva/',
        label: 'CHAMPVA benefits',
      },
      {
        href: '#content',
        label: 'Submit other health insurance',
      },
    ],
    homeVeteransAffairs: true,
    wrapping: true,
  }),
  defaultDefinitions: {},
  chapters,
};

export default formConfig;
