// yarn mock-api --responses ./src/applications/{application}/tests/e2e/fixtures/mocks/local-mock-responses.js
const mockUser = require('./user.json');
// const mockUserNoContactInfo = require('./user-no-contact-info.json');
const mockFeatureToggles = require('./feature-toggles.json');

const responses = {
  'GET /v0/user': mockUser,
  'GET /v0/feature_toggles': mockFeatureToggles,
  'GET /v0/maintenance_windows': { data: [] },
  'GET /data/cms/vamc-ehr.json': { data: [] },
  'POST /v0/profile/email_addresses': {
    data: {
      id: '',
      type: 'async_transaction_va_profile_email_adress_transactions',
      attributes: {
        transactionId: 'email_address_tx_id',
        transactionStatus: 'RECEIVED',
        type: 'AsyncTransaction::VAProfile::EmailAddressTransaction',
        metadata: [],
      },
    },
  },
  'GET /v0/profile/status/:id': {
    data: {
      id: '',
      type: 'async_transaction_va_profile_email_adress_transactions',
      attributes: {
        transactionId: 'email_address_tx_id',
        transactionStatus: 'COMPLETED_SUCCESS',
        type: 'AsyncTransaction::VAProfile::EmailAddressTransaction',
        metadata: [],
      },
    },
  },
  'PUT /v0/profile/addresses': {
    data: {
      id: '',
      type: 'async_transaction_va_profile_address_transactions',
      attributes: {
        transactionId: 'address_tx_id',
        transactionStatus: 'RECEIVED',
        type: 'AsyncTransaction::VAProfile::AddressTransaction',
        metadata: [],
      },
    },
  },
  'PUT /v0/profile/telephones': {
    data: {
      id: '',
      type: 'async_transaction_va_profile_telephone_transactions',
      attributes: {
        transactionId: 'telephone_tx_id',
        transactionStatus: 'RECEIVED',
        type: 'AsyncTransaction::VAProfile::TelephoneTransaction',
        metadata: [],
      },
    },
  },
  'GET /v0/in_progress_forms/WELCOME_VA_SETUP_REVIEW_INFORMATION': {
    formData: {},
    metadata: {
      version: 0,
      prefill: true,
      returnUrl: '/prefill-contact-information',
    },
  },
  'PUT /v0/in_progress_forms/WELCOME_VA_SETUP_REVIEW_INFORMATION': {},
};

module.exports = responses;
