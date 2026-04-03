import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import footerContent from 'platform/forms/components/FormFooter';
import { minimalHeaderFormConfigOptions } from 'platform/forms-system/src/js/patterns/minimal-header';

import manifest from '../manifest.json';
import IntroductionPage from '../containers/IntroductionPage';
import ConfirmationPage from '../containers/ConfirmationPage';
import getHelp from '../../shared/components/GetFormHelp';
import transformForSubmit from '../../shared/config/submit-transformer';
import { TITLE, SUBTITLE, FORM_ID } from '../definitions/constants';

import identificationInformation from '../pages/identificationInformation';
import mailingAddress from '../pages/mailingAddress';
import phoneAndEmailAddress from '../pages/phoneAndEmailAddress';
import applicationInformation from '../pages/applicationInformation';
import clothingItemsPage from '../pages/clothingItemsPage';
import personalInformation from '../pages/personalInformation';

/** @type {FormConfig} */
const formConfig = {
  rootUrl: manifest.rootUrl,
  urlPrefix: '/',
  submitUrl: `${environment.API_URL}/simple_forms_api/v1/simple_forms`,
  trackingPrefix: 'clothing-allowance-10-8678-',
  introduction: IntroductionPage,
  confirmation: ConfirmationPage,
  formId: FORM_ID,
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
  prefillEnabled: true,
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
      title: 'Section I: Your identification information',
      pages: {
        personalInformation: {
          path: 'personal-information',
          title: 'Your full name',
          uiSchema: personalInformation.uiSchema,
          schema: personalInformation.schema,
        },
      },
    },
    identificationInformation: {
      title: 'Section I: Your identification information',
      pages: {
        identificationInformation: {
          path: 'identification-information',
          title: 'Social Security number',
          uiSchema: identificationInformation.uiSchema,
          schema: identificationInformation.schema,
        },
      },
    },
    mailingInformationChapter: {
      title: 'Section I: Your mailing information',
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
      title: 'Section I: Your contact information',
      pages: {
        phoneAndEmailAddress: {
          path: 'phone-and-email-address',
          title: 'Your phone and email address',
          uiSchema: phoneAndEmailAddress.uiSchema,
          schema: phoneAndEmailAddress.schema,
        },
      },
    },
    applicationInformationChapter: {
      title: 'Section I: Application details',
      pages: {
        applicationInformation: {
          path: 'application-details',
          title: 'Application details',
          uiSchema: applicationInformation.uiSchema,
          schema: applicationInformation.schema,
        },
      },
    },
    clothingItemsChapter: {
      title: 'Section II: Appliances and skin medications',
      pages: {
        clothingItemsPage: {
          path: 'appliances-and-skin-medications',
          title: 'Appliances and skin medications',
          uiSchema: clothingItemsPage.uiSchema,
          schema: clothingItemsPage.schema,
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
