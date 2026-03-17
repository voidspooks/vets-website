import mockRepresentativesSearchResults from '../../constants/mock-representative-data.json';
import mockGeocodingData from '../../constants/mock-geocoding-data.json';
import { generateFeatureToggles } from '../../mocks/feature-toggles';

const representativeTypeOptions = [
  'Accredited VSO representative',
  'Accredited attorney',
  'Accredited claims agent',
];

Cypress.Commands.add('verifyOptions', () => {
  // Verify VSO is checked by default
  cy.contains('va-radio-option', 'Accredited VSO representative')
    .find('input')
    .should('be.checked');

  // Verify options available
  for (let i = 0; i < 3; i += 1) {
    cy.get('va-radio')
      .children()
      .eq(i)
      .then($option => {
        const value = $option.attr('label');
        expect(value).to.equal(representativeTypeOptions[i]);
      });
  }
});

describe('Representative Search', () => {
  beforeEach(() => {
    cy.intercept(
      'GET',
      '/v0/feature_toggles*',
      generateFeatureToggles({ findARepresentativeEnableFrontend: true }),
    );
    cy.intercept('GET', '/v0/maintenance_windows', []);

    cy.intercept(
      'GET',
      '/services/veteran/v0/vso_accredited_representatives?**',
      mockRepresentativesSearchResults,
    ).as('searchRepresentatives');
  });

  it('does a simple search and finds a result on the list', () => {
    cy.intercept('GET', '/geocoding/**/*', mockGeocodingData);

    cy.visit('/get-help-from-accredited-representative/find-rep/');

    cy.injectAxe();
    cy.axeCheck();

    cy.verifyOptions();

    cy.get('#street-city-state-zip')
      .find('input[type="text"]')
      .type('Austin, TX');

    cy.get('va-button[text="Search"]').click({ waitForAnimations: true });

    cy.get('#search-results-subheader').contains('Austin, TX');
  });

  it('shows search result header even when no results are found', () => {
    cy.visit('/get-help-from-accredited-representative/find-rep/');
    generateFeatureToggles();
    cy.intercept(
      'GET',
      '/services/veteran/v0/vso_accredited_representatives?**',
      {
        data: [],
        meta: { pagination: { totalEntries: 0 } },
      },
    ).as('searchFacilities');
    cy.intercept('GET', '/geocoding/**/*', mockGeocodingData);
    cy.visit('/get-help-from-accredited-representative/find-rep/');
    cy.injectAxe();
    cy.axeCheck();

    cy.verifyOptions();

    cy.get('#street-city-state-zip')
      .find('input[type="text"]')
      .type('Austin, TX');

    cy.get('va-button[text="Search"]').click({ waitForAnimations: true });

    cy.get('#search-results-subheader').contains('No results found');
  });

  it('should not trigger Use My Location when pressing enter in the input field', () => {
    cy.visit('/get-help-from-accredited-representative/find-rep/');
    cy.injectAxe();
    cy.axeCheck();
    cy.get('#street-city-state-zip')
      .find('input[type="text"]')
      .type('27606{enter}');

    // Wait for Use My Location to be triggered (it should not be)
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(8000);
    // If Use My Location is triggered and succeeds, it will change the contents of the search field:
    cy.get('#street-city-state-zip')
      .invoke('val')
      .then(searchString => expect(searchString).to.equal('27606'));
    // If Use My Location is triggered and fails, it will trigger a modal alert:
    cy.get('#va-modal-title').should('not.exist');
  });

  it('adds and clears organization name in search results', () => {
    cy.intercept('GET', '/geocoding/**/*', mockGeocodingData);
    cy.intercept(
      'GET',
      '/v0/feature_toggles*',
      generateFeatureToggles({
        findARepresentativeEnableFrontend: true,
        findARepresentativeEnabled: true,
      }),
    );
    cy.intercept(
      'GET',
      '/representation_management/v0/accredited_organizations',
      [{ data: { attributes: { name: 'American Legion' } } }],
    );

    cy.visit('/get-help-from-accredited-representative/find-rep/');

    cy.injectAxe();
    cy.axeCheck();

    cy.verifyOptions();

    cy.get('#street-city-state-zip')
      .find('input[type="text"]')
      .type('Austin, TX');

    cy.get('.organization-select')
      .find('input[type="text"]')
      .type('American Legion{enter}');

    cy.intercept(
      'GET',
      '/services/veteran/v0/vso_accredited_representatives?**',
      {
        data: [],
        meta: { pagination: { totalEntries: 0 } },
      },
    ).as('searchRepresentatives');

    cy.get('va-button[text="Search"]').click({ waitForAnimations: true });

    cy.wait('@searchRepresentatives')
      .its('request.url')
      .should('include', 'org_name=American+Legion');

    cy.get('.organization-select')
      .find('input[type="text"]')
      .not('[disabled]')
      .type('{selectAll}{del}{enter}');

    cy.get('va-button[text="Search"]').click({ waitForAnimations: true });

    cy.wait('@searchRepresentatives')
      .its('request.url')
      .should('not.include', 'org_name=');
  });

  it('does not see organization select combo box when feature toggle is off', () => {
    cy.intercept('GET', '/geocoding/**/*', mockGeocodingData);

    cy.visit('/get-help-from-accredited-representative/find-rep/');

    cy.injectAxe();
    cy.axeCheck();

    cy.verifyOptions();

    cy.get('#street-city-state-zip')
      .find('input[type="text"]')
      .type('Austin, TX');

    cy.get('.organization-select').should('not.exist');

    cy.intercept(
      'GET',
      '/services/veteran/v0/vso_accredited_representatives?**',
      {
        data: [],
        meta: { pagination: { totalEntries: 0 } },
      },
    ).as('searchRepresentatives');

    cy.get('va-button[text="Search"]').click({ waitForAnimations: true });

    cy.wait('@searchRepresentatives')
      .its('request.url')
      .should('not.include', 'org_name=');
  });
});
