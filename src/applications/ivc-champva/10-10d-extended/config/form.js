import { minimalHeaderFormConfigOptions } from 'platform/forms-system/src/js/patterns/minimal-header';
import { VA_FORM_IDS } from 'platform/forms/constants';
import { externalServices } from 'platform/monitoring/DowntimeNotification';
import environment from 'platform/utilities/environment';
import SubmissionError from '../../shared/components/SubmissionError';
import { chapters } from '../chapters';
import FormFooter from '../components/FormFooter';
import ConfirmationPage from '../containers/ConfirmationPage';
import IntroductionPage from '../containers/IntroductionPage';
import content from '../locales/en/content.json';
import manifest from '../manifest.json';
import { getCertifierNamePath } from '../utils/helpers';
import migrations from './migrations';
import transformForSubmit from './submitTransformer';

const breadcrumbList = [
  {
    href: '/family-and-caregiver-benefits',
    label: content['form-breadcrumb--family-label'],
  },
  {
    href: '/family-and-caregiver-benefits/health-and-disability/',
    label: content['form-breadcrumb--health-label'],
  },
  {
    href: '/family-and-caregiver-benefits/health-and-disability/champva',
    label: content['form-breadcrumb--champva-label'],
  },
  {
    href: '#content',
    label: content['form-breadcrumb--content-label'],
  },
];

/** @type {FormConfig}  */
const formConfig = {
  // identity & routing
  formId: VA_FORM_IDS.FORM_10_10D_EXTENDED,
  rootUrl: manifest.rootUrl,
  urlPrefix: '/',

  // tracking & monitoring
  trackingPrefix: '10-10d-extended-',
  downtime: {
    dependencies: [externalServices.pega, externalServices.form1010dExt],
  },

  // state management
  migrations,
  prefillEnabled: false,
  version: migrations.length,
  savedFormMessages: {
    noAuth: content['form-message--no-auth'],
    notFound: content['form-message--not-found'],
  },

  // submission configuration
  submitUrl: `${environment.API_URL}/ivc_champva/v1/forms/10-10d-ext`,
  preSubmitInfo: {
    statementOfTruth: {
      body: content['statement-of-truth--body-text'],
      messageAriaDescribedby: content['statement-of-truth--body-text'],
      fullNamePath: getCertifierNamePath,
    },
  },
  submissionError: SubmissionError,
  transformForSubmit,

  // form options
  formOptions: {
    useWebComponentForNavigation: true,
    filterInactiveNestedPageData: true,
    enableChapterDepends: true,
  },

  // development settings
  dev: {
    showNavLinks: false,
    collapsibleNavLinks: true,
    disableWindowUnloadInCI: true,
  },

  // header & display text
  ...minimalHeaderFormConfigOptions({
    homeVeteransAffairs: true,
    wrapping: true,
    breadcrumbList,
  }),
  title: content['form-title'],
  subTitle: content['form-subtitle'],
  customText: { appType: content['form-app-type'] },

  // page structure
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  footerContent: FormFooter,
  chapters,
};

export default formConfig;
