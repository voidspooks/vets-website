// yarn mock-api --responses ./src/applications/{application}/tests/e2e/fixtures/mocks/local-mock-responses.js
const mockUser = require('./user.json');

const responses = {
  'GET /v0/user': mockUser,
  'GET /v0/feature_toggles': {
    data: {
      type: 'feature_toggles',
      features: [
        {
          name: 'form_218940_address_and_phone_validation',
          value: true,
        },
      ],
    },
  },
};

module.exports = responses;
