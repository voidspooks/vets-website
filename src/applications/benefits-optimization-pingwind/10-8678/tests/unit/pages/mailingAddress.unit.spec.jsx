import {
  testNumberOfErrorsOnSubmitForWebComponents,
  testNumberOfWebComponentFields,
} from 'platform/forms-system/test/pageTestHelpers.spec';
import formConfig from '../../../config/form';

const {
  schema,
  uiSchema,
} = formConfig.chapters.mailingInformationChapter.pages.mailingAddress;

const pageTitle = 'mailingAddress';

// address fields: militaryBaseOutsideUS, country, street, street2, city, state, postalCode + isNewAddress = 8
const numberOfWebComponentFields = 8;
testNumberOfWebComponentFields(
  formConfig,
  schema,
  uiSchema,
  numberOfWebComponentFields,
  pageTitle,
);

// country, street, city, postalCode are required = 4 errors
const numberOfWebComponentErrors = 4;
testNumberOfErrorsOnSubmitForWebComponents(
  formConfig,
  schema,
  uiSchema,
  numberOfWebComponentErrors,
  pageTitle,
);
