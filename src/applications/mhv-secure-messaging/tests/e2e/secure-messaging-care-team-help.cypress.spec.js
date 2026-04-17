import SecureMessagingSite from './sm_site/SecureMessagingSite';
import GeneralFunctionsPage from './pages/GeneralFunctionsPage';
import PilotEnvPage from './pages/PilotEnvPage';
import { AXE_CONTEXT, Data } from './utils/constants';
import { ExternalLinks } from '../../util/constants';
import mockCernerMixedUser from './fixtures/userResponse/user-cerner-mixed-pretransitioned.json';
import mockCernerAllUser from './fixtures/userResponse/user-cerner-all.json';
import mockFacilities from './fixtures/facilityResponse/facilities-no-cerner.json';
import mockVamcEhr from './fixtures/vamc-ehr.json';

describe('SM CARE TEAM HELP PAGE', () => {
  const updatedFeatureToggles = GeneralFunctionsPage.updateFeatureToggles([
    { name: 'mhv_secure_messaging_cerner_pilot', value: true },
    { name: 'mhv_secure_messaging_curated_list_flow', value: true },
  ]);

  const navigateToCareTeamHelp = () => {
    PilotEnvPage.navigateToSelectCareTeamPage();
    cy.findByRole('link', {
      name: Data.CURATED_LIST.CANT_FIND_TEAM_LINK,
    }).click();
  };

  describe('Hybrid user (both Oracle Health and VistA)', () => {
    beforeEach(() => {
      SecureMessagingSite.login(
        updatedFeatureToggles,
        mockVamcEhr,
        true,
        mockCernerMixedUser,
        mockFacilities,
      );
      PilotEnvPage.loadInboxMessages();
      navigateToCareTeamHelp();
    });

    it('shows contact list reasons and search suggestions', () => {
      // Hybrid shows search suggestions with provider name
      cy.findByText(/type of care, provider name/).should('exist');

      // Hybrid users now see contact list reasons (previously only VistA)
      cy.findByText(/You removed them from your contact list/).should('exist');
      cy.findByText(/Your account isn['’]t connected to them/).should('exist');

      // Should show the "names may appear different" bullet with R&S link
      cy.findByText(/Their name may appear different/).should('exist');
      cy.findByTestId('name-change-link')
        .should('exist')
        .and('have.attr', 'href', ExternalLinks.CARE_TEAM_NAME_GLOSSARY);

      // Contact list link
      cy.findByTestId('update-contact-list-link')
        .should('exist')
        .and('have.attr', 'href', Data.LINKS.CONTACT_LIST);

      cy.injectAxeThenAxeCheck(AXE_CONTEXT);
    });
  });

  describe('VistA-only user', () => {
    beforeEach(() => {
      SecureMessagingSite.login(updatedFeatureToggles);
      PilotEnvPage.loadInboxMessages();
      navigateToCareTeamHelp();
    });

    it('shows VistA contact list reasons without name change bullet', () => {
      // VistA shows search suggestions
      cy.findByText(/type of care, provider name/).should('exist');

      // VistA-only should show contact list reasons
      cy.findByText(/You removed them from your contact list/).should('exist');

      // VistA-only should NOT show name change bullet
      cy.findByText(/Their name may appear different/).should('not.exist');
      cy.findByTestId('name-change-link').should('not.exist');

      // Should have "Update your contact list" link
      cy.findByTestId('update-contact-list-link').should('exist');

      cy.injectAxeThenAxeCheck(AXE_CONTEXT);
    });
  });

  describe('Oracle Health-only (Cerner) user', () => {
    beforeEach(() => {
      SecureMessagingSite.login(
        updatedFeatureToggles,
        mockVamcEhr,
        true,
        mockCernerAllUser,
        mockFacilities,
      );
      PilotEnvPage.loadInboxMessages();
      navigateToCareTeamHelp();
    });

    it('shows name change bullet without contact list reasons', () => {
      // Oracle-only shows search suggestions with provider name
      cy.findByText(/type of care, provider name/).should('exist');

      // Oracle-only should NOT show VistA contact list reasons
      cy.findByText(/You removed them from your contact list/).should(
        'not.exist',
      );
      cy.findByText(/Your account isn’t connected to them/).should('not.exist');

      // Should show the "names may appear different" bullet with R&S link
      cy.findByText(/Their name may appear different/).should('exist');
      cy.findByTestId('name-change-link')
        .should('exist')
        .and('have.attr', 'href', ExternalLinks.CARE_TEAM_NAME_GLOSSARY);

      // Oracle-only should NOT see the Update your contact list link
      cy.findByTestId('update-contact-list-link').should('not.exist');

      cy.injectAxeThenAxeCheck(AXE_CONTEXT);
    });
  });
});
