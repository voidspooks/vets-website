import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import footerContent from '~/platform/forms/components/FormFooter';
import manifest from '../manifest.json';
import ConfirmationPage from '../containers/shared/ConfirmationPage';
import IntroductionPage526 from '../containers/form526ez/IntroductionPage526';
import { uploadPage } from '../containers/shared/upload';
import {
  bddCustomPage,
  BddCustomPage,
} from '../containers/form526ez/bddCustomPage';
import { veteranInformationPage } from '../containers/form526ez/526ezVeteranInformation';
import { transformForSubmit526 } from './submit-transformer';
import { getMockData, scrollAndFocusTarget, getFormContent } from '../helpers';
import { CustomTopContent } from '../helpers/helpers';
import submissionError from './submissionError';
import SubmissionErrorLink from './submissionErrorLink';

const form21526Ez = (pathname = null) => {
  const { subTitle, formNumber } = getFormContent(pathname);
  const trackingPrefix = `form-${formNumber.toLowerCase()}-upload-`;
  const formId = `${formNumber.toUpperCase()}-UPLOAD`;

  return {
    rootUrl: manifest.rootUrl,
    urlPrefix: `/submit-va-form-${formNumber.toLowerCase()}/`,
    submitUrl: `${
      environment.API_URL
    }/accredited_representative_portal/v0/submit_representative_form`,
    dev: {
      collapsibleNavLinks: true,
      showNavLinks: !window.Cypress,
      disableWindowUnloadInCI: true,
    },
    disableSave: true,
    trackingPrefix,
    introduction: IntroductionPage526,
    confirmation: ConfirmationPage,
    CustomTopContent,
    customText: {
      appType: 'form',
      finishAppLaterMessage: ' ',
      reviewPageTitle: 'Review and submit',
    },
    hideReviewChapters: true,
    formId,
    version: 0,
    prefillEnabled: false,
    transformForSubmit: transformForSubmit526,
    submissionError,
    submissionErrorLink: SubmissionErrorLink,
    defaultDefinitions: {},
    title: `Submit VA Form ${formNumber}`,
    subTitle,
    v3SegmentedProgressBar: { useDiv: false },
    formOptions: {
      useWebComponentForNavigation: true,
    },
    chapters: {
      veteranInformationChapter: {
        title: 'Claimant information',
        pages: {
          veteranInformationPage: {
            path: 'veteran-information',
            title: 'Claimant information',
            uiSchema: veteranInformationPage.uiSchema,
            schema: veteranInformationPage.schema,
            scrollAndFocusTarget,
            // we want req'd fields prefilled for LOCAL testing/previewing
            // one single initialData prop here will suffice for entire form
            initialData: getMockData(),
            depends: () => {
              return true;
            },
          },
        },
      },
      uploadChapter: {
        title: 'Upload files',
        pages: {
          uploadPage: {
            path: 'upload-files',
            title: `Upload VA Form ${formNumber}`,
            uiSchema: uploadPage.uiSchema,
            schema: uploadPage.schema,
            scrollAndFocusTarget,
            depends: formData => {
              return formData.selectBddClaim?.BDD !== true;
            },
          },
          bddUploadPage: {
            path: 'bdd-upload-files',
            title: 'Upload files',
            uiSchema: bddCustomPage.uiSchema,
            schema: bddCustomPage.schema,
            CustomPage: BddCustomPage,
            scrollAndFocusTarget,
            depends: formData => {
              return formData.selectBddClaim?.BDD === true;
            },
          },
        },
      },
    },
    footerContent,
  };
};

export default form21526Ez;
