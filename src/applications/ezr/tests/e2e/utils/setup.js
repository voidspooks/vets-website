import mockFeatures from '../fixtures/mocks/mock-features.json';
import mockMaintenanceWindows from '../fixtures/mocks/mock-maintenance-windows.json';
import mockPrefill from '../fixtures/mocks/mock-prefill.json';
import mockSaveInProgress from '../fixtures/mocks/mock-save-in-progress.json';
import mockSubmission from '../fixtures/mocks/mock-submission.json';
import mockUser from '../fixtures/mocks/mock-user.json';
import mockVamc from '../fixtures/mocks/vamc-ehr.json';
import mockEnrollmentStatus from '../fixtures/mocks/mock-enrollment-status.json';

mockFeatures.data.features.push({
  name: 'ezrSpouseConfirmationFlowEnabled',
  value: true,
});
mockFeatures.data.features.push({
  name: 'ezrFormPrefillWithProvidersAndDependents',
  value: true,
});

const APIs = {
  features: '/v0/feature_toggles*',
  maintenance: '/v0/maintenance_windows',
  saveInProgress: '/v0/in_progress_forms/10-10EZR',
  enrollmentStatus: '/v0/health_care_applications/enrollment_status',
  submit: '/v0/form1010_ezrs',
  vamc: '/data/cms/vamc-ehr.json',
};

export const setupBasicTest = (props = {}) => {
  Cypress.config({ includeShadowDom: true, scrollBehavior: 'nearest' });

  const { features = mockFeatures } = props;

  cy.intercept('GET', APIs.features, features);
  cy.intercept('GET', APIs.maintenance, mockMaintenanceWindows);
  cy.intercept('GET', APIs.enrollmentStatus, mockEnrollmentStatus);
  cy.intercept('GET', APIs.vamc, mockVamc);
  cy.intercept('POST', APIs.submit, mockSubmission);
};

export const setupForAuth = (props = {}) => {
  const {
    features = mockFeatures,
    prefill = mockPrefill,
    user = mockUser,
  } = props;

  const inProgressForms = user?.data?.attributes?.inProgressForms;
  const loginUser =
    prefill?.metadata &&
    Array.isArray(inProgressForms) &&
    inProgressForms.length
      ? {
          ...user,
          data: {
            ...user.data,
            attributes: {
              ...user.data.attributes,
              inProgressForms: [
                {
                  ...inProgressForms[0],
                  metadata: {
                    ...inProgressForms[0].metadata,
                    ...prefill.metadata,
                  },
                },
                ...inProgressForms.slice(1),
              ],
            },
          },
        }
      : user;

  setupBasicTest({ features });
  cy.intercept('GET', APIs.saveInProgress, prefill).as('mockPrefill');
  cy.intercept('PUT', APIs.saveInProgress, mockSaveInProgress);

  cy.login(loginUser);
};
