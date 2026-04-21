import environment from 'platform/utilities/environment';
import footerContent from 'platform/forms/components/FormFooter';
import { externalServices } from 'platform/monitoring/DowntimeNotification';
import { minimalHeaderFormConfigOptions } from 'platform/forms-system/src/js/patterns/minimal-header';
import {
  checkValidPagePath,
  getNextPagePath,
} from 'platform/forms-system/src/js/routing';
import manifest from '../manifest.json';
import IntroductionPage from '../containers/IntroductionPage';
import ConfirmationPage from '../containers/ConfirmationPage';
import getHelp from '../../shared/components/GetFormHelp';
import transformForSubmit from './submit-transformer';
import informationRequiredPage from '../pages/informationRequired';
import veteranInformation from '../pages/veteranInformation';
import claimantInformation from '../pages/claimantInformation';
import requestedApportionmentPeople from '../pages/requestedApportionmentPeople';
import apportionmentReasonFlow from '../pages/apportionmentReasonFlow';
import remarksCertification from '../pages/remarksCertification';
import {
  claimantFields,
  formConfigText,
  formTitles,
} from '../definitions/constants';

const handleFormLoaded = props => {
  const {
    returnUrl,
    router,
    routes,
    formData,
    formConfig: loadedFormConfig,
  } = props;
  const pageList = routes?.[routes.length - 1]?.pageList || [];
  const introPath = `${loadedFormConfig?.urlPrefix || '/'}introduction`;
  const fallbackPath =
    getNextPagePath(pageList, formData, introPath) || introPath;
  const safeReturnUrl =
    returnUrl && checkValidPagePath(pageList, formData, returnUrl)
      ? returnUrl
      : fallbackPath;

  router.push(safeReturnUrl);
};

const formConfig = {
  rootUrl: manifest.rootUrl,
  urlPrefix: '/',
  submitUrl: `${environment.API_URL}/simple_forms_api/v1/simple_forms`,
  trackingPrefix: 'ss-0788-',
  defaultDefinitions: {},
  dev: {
    collapsibleNavLinks: true,
    showNavLinks: true,
  },
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  preSubmitInfo: {
    statementOfTruth: {
      body: formConfigText.statementOfTruth,
      messageAriaDescribedby: formConfigText.statementOfTruth,
      fullNamePath: `${claimantFields.parentObject}.fullName`,
    },
  },
  formId: '21-0788',
  saveInProgress: {
    messages: {
      inProgress: formConfigText.inProgressMessage,
      expired: formConfigText.expiredMessage,
      saved: formConfigText.savedMessage,
    },
  },
  onFormLoaded: handleFormLoaded,
  version: 0,
  prefillEnabled: true,
  transformForSubmit,
  savedFormMessages: {
    notFound: formConfigText.notFoundMessage,
    noAuth: formConfigText.noAuthMessage,
  },
  hideUnauthedStartLink: true,
  title: formTitles.form,
  subTitle: formTitles.subTitle,
  customText: {
    appType: formConfigText.appType,
    submitButtonText: formConfigText.submitButtonText,
    reviewPageTitle: 'Review and sign',
    reviewPageFormTitle: '',
  },
  showSaveLinkAfterButtons: false,
  ...minimalHeaderFormConfigOptions({
    breadcrumbList: [
      { href: '/', label: 'VA.gov home' },
      { href: '/disability', label: 'Disability' },
      {
        href: '/supporting-forms-for-claims',
        label: 'Supporting forms for claims',
      },
    ],
  }),
  chapters: {
    informationRequiredChapter: {
      title: formTitles.informationRequired,
      pages: {
        informationRequiredPage,
      },
    },
    veteranInformationChapter: {
      title: formTitles.veteranInformation,
      pages: {
        veteranInformationPage: {
          path: 'veteran-identification-information',
          title: formTitles.veteranInformation,
          uiSchema: veteranInformation.uiSchema,
          schema: veteranInformation.schema,
        },
      },
    },
    claimantInformationChapter: {
      title: formTitles.claimantInformation,
      pages: {
        claimantInformationPage: {
          path: 'claimant-information',
          title: formTitles.claimantInformation,
          uiSchema: claimantInformation.uiSchema,
          schema: claimantInformation.schema,
        },
      },
    },
    apportionmentInformationChapter: {
      title: formTitles.apportionmentInformation,
      pages: {
        ...requestedApportionmentPeople,
        ...apportionmentReasonFlow,
      },
    },
    remarksCertificationChapter: {
      title: formTitles.remarksCertification,
      pages: {
        remarksCertificationPage: {
          path: 'remarks-and-certification',
          title: formTitles.remarksCertification,
          uiSchema: remarksCertification.uiSchema,
          schema: remarksCertification.schema,
        },
      },
    },
  },
  downtime: {
    dependencies: [externalServices.lighthouseBenefitsIntake],
  },
  footerContent,
  getHelp,
};

export default formConfig;
