import { handleGetPersonalInformationRoute } from 'applications/personalization/profile/mocks/endpoints/personal-information';
import serviceHistory from 'applications/personalization/profile/mocks/endpoints/service-history';
import { loa3User72, nonVeteranUser } from '../../../mocks/endpoints/user';

import { generateFeatureToggles } from '../../../mocks/endpoints/feature-toggles';
import fullName from '../../../mocks/endpoints/full-name';

import ServiceHistoryInformation from './ServiceHistoryInformation';

describe('Service history information - Profile page', () => {
  beforeEach(() => {
    cy.intercept(
      'GET',
      '/v0/feature_toggles*',
      generateFeatureToggles({
        profileAlwaysShowDirectDepositDisplay: true,
      }),
    );
    cy.intercept('GET', '/v0/user', loa3User72);

    cy.intercept('GET', '/v0/profile/full_name', fullName.success);
    cy.intercept('GET', '/v0/profile/personal_information', resp => {
      const req = {
        query: { now: true },
      };
      const res = {
        json: resp.reply,
      };
      handleGetPersonalInformationRoute(req, res);
    });
    cy.intercept('GET', '/v0/profile/service_history', resp => {
      return resp.reply(500, serviceHistory.error);
    });
  });

  it('Should not display error message on Personal and Contact page', () => {
    cy.login(loa3User72);
    ServiceHistoryInformation.visitContactInformationPage();
    cy.injectAxeThenAxeCheck();
    ServiceHistoryInformation.heroErrorMessageShouldNotExist();
    ServiceHistoryInformation.visitPersonalInformationPage();
    cy.injectAxeThenAxeCheck();
    ServiceHistoryInformation.heroErrorMessageShouldNotExist();
  });
  it('should display correct error messaging on military information page', () => {
    cy.login(loa3User72);
    ServiceHistoryInformation.visitServiceHistoryInformationPage();
    cy.injectAxeThenAxeCheck();
    ServiceHistoryInformation.heroErrorMessageShouldNotExist();
    ServiceHistoryInformation.serviceDownMessageShouldExist();
    ServiceHistoryInformation.veteranStatusShouldNotExist();
  });
});

describe('Service history information - NonVeteran', () => {
  beforeEach(() => {
    cy.intercept(
      'GET',
      '/v0/feature_toggles*',
      generateFeatureToggles({
        profileAlwaysShowDirectDepositDisplay: true,
      }),
    );
    cy.intercept('GET', '/v0/user', nonVeteranUser);

    cy.intercept('GET', '/v0/profile/full_name', fullName.success);
    cy.intercept('GET', '/v0/profile/personal_information', resp => {
      const req = {
        query: { now: true },
      };
      const res = {
        json: resp.reply,
      };
      handleGetPersonalInformationRoute(req, res);
    });
    cy.intercept('GET', '/v0/profile/service_history', resp => {
      return resp.reply(500, serviceHistory.generateServiceHistoryError('403'));
    });
  });
  it('should display non veteran user error on military information page and veteran status should not exist', () => {
    cy.login(nonVeteranUser);
    ServiceHistoryInformation.visitServiceHistoryInformationPage();
    cy.injectAxeThenAxeCheck();
    ServiceHistoryInformation.heroErrorMessageShouldNotExist();
    ServiceHistoryInformation.notAVeteranMessageShouldExist();
    ServiceHistoryInformation.veteranStatusShouldNotExist();
  });
});

describe('Service history information - NotInDeers', () => {
  beforeEach(() => {
    cy.intercept(
      'GET',
      '/v0/feature_toggles*',
      generateFeatureToggles({
        profileAlwaysShowDirectDepositDisplay: true,
      }),
    );
    cy.intercept('GET', '/v0/user', loa3User72);

    cy.intercept('GET', '/v0/profile/full_name', fullName.success);
    cy.intercept('GET', '/v0/profile/personal_information', resp => {
      const req = {
        query: { now: true },
      };
      const res = {
        json: resp.reply,
      };
      handleGetPersonalInformationRoute(req, res);
    });
    cy.intercept('GET', '/v0/profile/service_history', resp => {
      return resp.reply(200, serviceHistory.generateServiceHistoryError('403'));
    });
  });
  it('should display user not in deers error on military information page and veteran status should not exist', () => {
    cy.login(loa3User72);
    ServiceHistoryInformation.visitServiceHistoryInformationPage();
    cy.injectAxeThenAxeCheck();
    ServiceHistoryInformation.heroErrorMessageShouldNotExist();
    ServiceHistoryInformation.notInDeersMessageShouldExist();
    ServiceHistoryInformation.veteranStatusShouldNotExist();
  });
});
