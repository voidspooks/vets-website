import mockGeocodingData from '../../constants/mock-geocoding-data.json';
import FacilityHelpers from './helpers/facility-helpers-cypress';
import FeaturesHelpers from './helpers/features-helpers-cypress';
import CcpHelpers from './helpers/ccp-helpers-cypress';

import {
  enabledFeatures,
  featureCombinationsTogglesToTest,
} from './featureTogglesToTest';
import * as h from './helpers';

const featureSets = featureCombinationsTogglesToTest([
  'facilities_use_fl_progressive_disclosure',
]);

for (const featureSet of featureSets) {
  describe(`Error persistence across interactions ${enabledFeatures(
    featureSet,
  )}`, () => {
    const addrErrorMessage =
      'Enter a zip code or a city and state in the search box';
    const facilityErrorMessage = 'Select a facility type';
    const serviceErrorMessage = 'ErrorStart typing and select a service type';

    beforeEach(() => {
      cy.intercept('GET', '/v0/maintenance_windows', []);
      FeaturesHelpers.initApplicationMock(featureSet);
      CcpHelpers.initApplicationMock('1223X2210X', 'mockDentists');
      FacilityHelpers.initApplicationMock();

      cy.visit(h.ROOT_URL);
      cy.injectAxeThenAxeCheck();
    });

    it('shows both location and facility type errors on empty submit', () => {
      h.submitSearchForm();

      // Location error should be present
      h.errorMessageContains(addrErrorMessage);

      // Facility type error should also be present
      cy.get(h.FACILITY_TYPE_DROPDOWN)
        .shadow()
        .find('.usa-error-message')
        .should('exist')
        .and('contain.text', facilityErrorMessage);

      cy.axeCheck();
    });

    it('preserves location error after selecting a facility type', () => {
      h.submitSearchForm();
      h.errorMessageContains(addrErrorMessage);

      h.selectFacilityTypeInDropdown(h.FACILITY_TYPES.HEALTH);

      h.errorMessageContains(addrErrorMessage);

      cy.axeCheck();
    });

    it('preserves facility type error after typing a location', () => {
      h.submitSearchForm();

      cy.get(h.FACILITY_TYPE_DROPDOWN)
        .shadow()
        .find('.usa-error-message')
        .should('exist');

      h.typeInCityStateInput('Austin, TX', true);

      cy.get(h.FACILITY_TYPE_DROPDOWN)
        .shadow()
        .find('.usa-error-message')
        .should('exist')
        .and('contain.text', facilityErrorMessage);

      cy.axeCheck();
    });

    it('errors survive multiple submits', () => {
      // First empty submit
      h.submitSearchForm();
      h.errorMessageContains(addrErrorMessage);

      // Second empty submit — errors should still be present
      h.submitSearchForm();
      h.errorMessageContains(addrErrorMessage);

      cy.get(h.FACILITY_TYPE_DROPDOWN)
        .shadow()
        .find('.usa-error-message')
        .should('exist');

      cy.axeCheck();
    });

    it('shows service type error for CC provider without service type', () => {
      // Fill location and select CC Provider
      h.typeInCityStateInput('Austin, TX', true);
      h.selectFacilityTypeInDropdown(h.FACILITY_TYPES.CC_PRO);

      cy.wait('@mockServices');
      h.verifyElementIsNotDisabled(h.CCP_SERVICE_TYPE_INPUT);

      // Submit without service type
      h.submitSearchForm();
      h.errorMessageContains(serviceErrorMessage);

      cy.axeCheck();
    });

    it('preserves service type error after interacting with other fields', () => {
      h.typeInCityStateInput('Austin, TX');
      h.selectFacilityTypeInDropdown(h.FACILITY_TYPES.CC_PRO);
      cy.wait('@mockServices');
      h.verifyElementIsNotDisabled(h.CCP_SERVICE_TYPE_INPUT);

      // Submit without service type to trigger error
      h.submitSearchForm();
      h.errorMessageContains(serviceErrorMessage);

      // Focus another field — service type error should persist
      h.focusElement(h.CITY_STATE_ZIP_INPUT);
      h.errorMessageContains(serviceErrorMessage);

      cy.axeCheck();
    });

    it('clears service type error when switching away from CC provider', () => {
      h.typeInCityStateInput('Austin, TX');
      h.selectFacilityTypeInDropdown(h.FACILITY_TYPES.CC_PRO);
      cy.wait('@mockServices');
      h.verifyElementIsNotDisabled(h.CCP_SERVICE_TYPE_INPUT);

      // Submit without service type
      h.submitSearchForm();
      h.errorMessageContains(serviceErrorMessage);

      // Switch to VA health — service type error should clear
      h.selectFacilityTypeInDropdown(h.FACILITY_TYPES.HEALTH);
      h.verifyElementDoesNotExist(h.CCP_SERVICE_TYPE_INPUT);

      cy.axeCheck();
    });

    it('shows both errors simultaneously for CC provider with no location or service type', () => {
      // Select CC Provider first (so service type field appears)
      h.selectFacilityTypeInDropdown(h.FACILITY_TYPES.CC_PRO);
      cy.wait('@mockServices');
      h.verifyElementIsNotDisabled(h.CCP_SERVICE_TYPE_INPUT);

      // Submit with no location and no service type
      // (facility type is already valid since CC Provider was selected)
      h.submitSearchForm();

      // Location error
      h.errorMessageContains(addrErrorMessage);
      // Service type error
      h.errorMessageContains(serviceErrorMessage);

      cy.axeCheck();
    });

    it('clears all errors after fixing fields and resubmitting', () => {
      cy.intercept('GET', '/geocoding/**/*', mockGeocodingData);

      // Empty submit — both errors appear
      h.submitSearchForm();
      h.errorMessageContains(addrErrorMessage);
      cy.get(h.FACILITY_TYPE_DROPDOWN)
        .shadow()
        .find('.usa-error-message')
        .should('exist');

      // Fix both fields
      h.typeInCityStateInput('Austin, TX', true);
      h.selectFacilityTypeInDropdown(h.FACILITY_TYPES.HEALTH);

      // Errors should still be visible before resubmit
      h.errorMessageContains(addrErrorMessage);
      cy.get(h.FACILITY_TYPE_DROPDOWN)
        .shadow()
        .find('.usa-error-message')
        .should('exist');

      // Resubmit with valid values — errors should clear
      h.submitSearchForm();

      cy.get(`${h.SEARCH_FORM_ERROR_MESSAGE} .usa-error-message`).should(
        'not.exist',
      );
      cy.get(h.FACILITY_TYPE_DROPDOWN)
        .shadow()
        .find('.usa-error-message')
        .should('not.exist');

      cy.axeCheck();
    });
  });
}
