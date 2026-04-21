import { PROFILE_PATHS } from '@@profile/constants';
import directDepositMocks from '@@profile/mocks/endpoints/direct-deposits';
import { mhvUser } from '@@profile/mocks/endpoints/user';
import mockDisabilityRating from '@@profile/tests/fixtures/disability-rating-success.json';
import mockFullNameSuccess from '@@profile/tests/fixtures/full-name-success.json';
import mockStatusInfo from '@@profile/tests/fixtures/status-info.json';
import mockServiceHistory from '@@profile/tests/fixtures/service-history-success.json';
import mockPersonalInformation from '@@profile/tests/fixtures/personal-information-success.json';
import mockSignature from '@@profile/tests/fixtures/personal-information-signature.json';
import mockToggles from '@@profile/tests/fixtures/personal-information-feature-toggles.json';
import { Data, Locators, Paths } from '@@profile/tests/fixtures/constants';

class MessagesSignaturePage {
  getPageHeader = () => cy.get('h1');

  getCancelChangesBtn = () =>
    cy
      .get('.usa-button-group__item > va-button', { includeShadowDom: true })
      .find('button', { includeShadowDom: true })
      .first();

  getBackToEditBtn = () =>
    cy
      .get('.usa-button-group__item > va-button', { includeShadowDom: true })
      .find('button', { includeShadowDom: true })
      .last();

  load = (togglesResponse = mockToggles, signatureResponse = mockSignature) => {
    cy.intercept('GET', 'v0/profile/full_name', mockFullNameSuccess).as(
      'full_name',
    );
    cy.intercept(
      'GET',
      'v0/profile/personal_information',
      mockPersonalInformation,
    ).as('personal_info');
    cy.intercept('GET', 'v0/profile/service_history', mockServiceHistory).as(
      'service_history',
    );
    cy.intercept(
      'GET',
      'v0/disability_compensation_form/rating_info',
      mockDisabilityRating,
    ).as('disability_compensation');
    cy.intercept('GET', '/v0/profile/status/*', mockStatusInfo).as('status');
    cy.intercept('GET', '/my_health/v1/messaging/preferences/signature', {
      ...signatureResponse,
    }).as('signature');
    cy.intercept('GET', '/v0/feature_toggles*', togglesResponse);
    cy.intercept('GET', 'v0/profile/direct_deposits', directDepositMocks.base);

    cy.login(mhvUser);
    cy.visit(PROFILE_PATHS.MESSAGES_SIGNATURE);

    this.getPageHeader().should('have.text', 'Messages signature');
    cy.wait('@signature');
  };

  updateFeatureToggles = toggles => ({
    ...mockToggles,
    data: {
      ...mockToggles.data,
      features: [...mockToggles.data.features, ...toggles],
    },
  });

  saveSignature = (response = mockSignature) => {
    cy.intercept('POST', Paths.INTERCEPT.SIGNATURE, response).as(
      'updatedSignature',
    );
    cy.get(Locators.SIGNATURE.SAVE_BTN).click();
    cy.wait('@updatedSignature');
  };

  removeSignature = response => {
    cy.intercept('POST', Paths.INTERCEPT.SIGNATURE, response).as(
      'updatedSignature',
    );
    cy.get(Locators.SIGNATURE.REMOVE_BTN).click();
    cy.get(Locators.SIGNATURE.ALERTS.MODAL)
      .shadow()
      .find('va-button')
      .first()
      .click();
    cy.wait('@updatedSignature');
  };

  verifySuccessAlert = () => {
    cy.get(Locators.SIGNATURE.ALERTS.SUCCESS)
      .should('be.visible')
      .and('contain.text', Data.SIGNATURE.UPDATE_SAVED);
    cy.get('va-alert[status="success"]').should('be.focused');
  };
}

export default new MessagesSignaturePage();
