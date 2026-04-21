import React from 'react';
import footerContent from 'platform/forms/components/FormFooter';
import { VA_FORM_IDS } from 'platform/forms/constants';
import profileContactInfo from 'platform/forms-system/src/js/definitions/profileContactInfo';
import { getContent } from 'platform/forms-system/src/js/utilities/data/profile';
import ContactInfo from 'platform/forms-system/src/js/components/ContactInfo';
import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import { profileContactInfoPages } from 'platform/forms-system/src/js/patterns/prefill';
import { TITLE } from '../constants';
import manifest from '../manifest.json';
import ConfirmationPage from '../containers/ConfirmationPage';
import WelcomeVAContactAdditionalInfo from '../components/WelcomeVAContactAdditionalInfo';

const isPrefillOn = formData => {
  return formData?.veteranOnboardingPrefillPattern === true;
};

// ---- Old pattern pages (shown when toggle is OFF) ----
const allContactInformationKeys = ['address', 'email', 'phone'];
const confirmContactInfoKeys = {
  wrapper: 'veteran',
  address: 'address',
  mobilePhone: 'phone',
  email: 'email',
};
const contactPath = 'contact-information';
const content = getContent('form');
const profileContactInfoPage = profileContactInfo({
  contactPath,
  included: allContactInformationKeys,
  contactInfoRequiredKeys: allContactInformationKeys,
  addressKey: 'address',
  mobilePhoneKey: 'phone',
  contactInfoUiSchema: {},
  contactSectionHeadingLevel: 'h2',
  editContactInfoHeadingLevel: 'h2',
  allowInternationalPhones: true,
});

content.title = '';
content.description = null;

profileContactInfoPage.confirmContactInfo.onNavForward = ({ goPath }) => {
  goPath('confirmation');
};

profileContactInfoPage.confirmContactInfo.onNavBack = () => {
  window.location = `${environment.BASE_URL}/my-va/`;
};

profileContactInfoPage.confirmContactInfo.depends = formData =>
  !isPrefillOn(formData);

profileContactInfoPage.confirmContactInfo.CustomPage = props =>
  ContactInfo({
    ...props,
    content,
    contactPath,
    keys: confirmContactInfoKeys,
    requiredKeys: allContactInformationKeys,
    contactInfoPageKey: 'confirmContactInfo',
    disableMockContactInfo: true,
    contactSectionHeadingLevel: 'h2',
    editContactInfoHeadingLevel: 'h2',
    contentBeforeButtons: WelcomeVAContactAdditionalInfo,
  });

// ---- New prefill pattern pages (shown when toggle is ON) ----
const prefillContent = getContent('form');
prefillContent.title = '';
prefillContent.description = null;
prefillContent.editEmail = 'Edit email address';
prefillContent.editMobilePhone = 'Edit mobile phone number';
prefillContent.editMailingAddress = 'Edit mailing address';

const prefillContactInfoPage = profileContactInfoPages({
  contactInfoPageKey: 'prefillContactInfo',
  contactPath: 'prefill-contact-information',
  wrapperKey: 'prefillVeteran',
  included: ['mobilePhone', 'email', 'mailingAddress'],
  contactInfoRequiredKeys: ['mobilePhone', 'email', 'mailingAddress'],
  content: prefillContent,
  contactSectionHeadingLevel: 'h2',
  editContactInfoHeadingLevel: 'h2',
  mainHeaderLevel: 'h2',
  contentBeforeButtons: WelcomeVAContactAdditionalInfo,
  prefillPatternEnabled: false,
  depends: isPrefillOn,
  showProfileAlert: false,
});

const myVAURL = `${environment.BASE_URL}/my-va/`;
prefillContactInfoPage.prefillContactInfo.onNavBack = () => {
  window.location = myVAURL;
};
prefillContactInfoPage.prefillContactInfo.onNavForward = () => {
  window.location = myVAURL;
};

/** @type {FormConfig} */
const formConfig = {
  rootUrl: manifest.rootUrl,
  urlPrefix: '/',
  submitUrl: '/v0/api',
  submit: () =>
    Promise.resolve({ attributes: { confirmationNumber: '123123123' } }),
  trackingPrefix: 'welcome-va-setup-review-information-',
  introduction: () => <></>,
  confirmation: ConfirmationPage,
  dev: {
    showNavLinks: true,
    collapsibleNavLinks: true,
  },
  formId: VA_FORM_IDS.FORM_WELCOME_VA_SETUP_REVIEW_INFORMATION,
  saveInProgress: {
    // messages: {
    //   inProgress: 'Your welcome va setup review information form application (00-0000) is in progress.',
    //   expired: 'Your saved welcome va setup review information form application (00-0000) has expired. If you want to apply for welcome va setup review information form, please start a new application.',
    //   saved: 'Your welcome va setup review information form application has been saved.',
    // },
  },
  version: 0,
  prefillEnabled: false,
  savedFormMessages: {
    notFound:
      'Please start over to apply for welcome va setup review information form.',
    noAuth:
      'Please sign in again to continue your application for welcome va setup review information form.',
  },
  title: TITLE,
  defaultDefinitions: {},
  chapters: {
    infoPage: {
      pages: {
        // Old pattern (toggle OFF)
        ...profileContactInfoPage,
        // New prefill pattern (toggle ON)
        ...prefillContactInfoPage,
      },
    },
  },
  customText: {
    finishAppLaterMessage: ' ',
    submitButtonText: 'Finish',
  },
  formOptions: {
    noTopNav: true,
  },
  // getHelp,
  footerContent,
};

export default formConfig;
