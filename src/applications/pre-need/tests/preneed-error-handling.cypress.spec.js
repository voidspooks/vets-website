import preneedHelpers from './utils/cypress-preneed-helpers';
import testData from './schema/maximal-test.json';
import cemeteries from './fixtures/mocks/cemeteries.json';
import featureToggles from './fixtures/mocks/feature-toggles.json';

describe('Pre-need form VA 40-10007 Error Handling', () => {
  it('handles API submission errors gracefully', () => {
    // Intercept with error response
    cy.intercept('POST', '/simple_forms_api/v1/simple_forms', {
      statusCode: 500,
      body: {
        errors: [
          {
            title: 'Internal server error',
            detail: 'Internal server error',
            code: '500',
            status: '500',
          },
        ],
      },
    }).as('submitError');

    cy.intercept('GET', '/simple_forms_api/v1/cemeteries', cemeteries);
    cy.intercept('GET', '/v0/feature_toggles?*', featureToggles);

    preneedHelpers.visitIntro();

    // Fill out form with minimal data
    cy.selectRadio('root_application_claimant_relationshipToVet', '1');
    preneedHelpers.clickContinue();

    cy.fillName(
      'root_application_claimant_name',
      testData.data.application.claimant.name,
    );
    cy.fill(
      'input[name="root_application_claimant_ssn"]',
      testData.data.application.claimant.ssn,
    );
    cy.fillDate(
      'root_application_claimant_dateOfBirth',
      testData.data.application.claimant.dateOfBirth,
    );
    cy.fill(
      'input[name="root_application_veteran_placeOfBirth"]',
      testData.data.application.veteran.placeOfBirth,
    );
    preneedHelpers.clickContinue();

    // Demographics
    cy.get(
      'input[name="root_application_veteran_race_isSpanishHispanicLatino"]',
    ).click();
    cy.selectRadio(
      'root_application_veteran_gender',
      testData.data.application.veteran.gender,
    );
    cy.selectRadio(
      'root_application_veteran_maritalStatus',
      testData.data.application.veteran.maritalStatus,
    );
    preneedHelpers.clickContinue();

    // Military details
    cy.get('#root_application_veteran_militaryStatus').select(
      testData.data.application.veteran.militaryStatus,
    );
    preneedHelpers.clickContinue();

    // Military history
    cy.fillDate(
      'root_application_veteran_serviceRecords_0_dateRange_from',
      testData.data.application.veteran.serviceRecords[0].dateRange.from,
    );
    cy.fillDate(
      'root_application_veteran_serviceRecords_0_dateRange_to',
      testData.data.application.veteran.serviceRecords[0].dateRange.to,
    );
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).click();
    cy.fill(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
      'ALLIED FORCES',
    );
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keydown', { keyCode: 40 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keyup', { keyCode: 40 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keydown', { keyCode: 13 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keyup', { keyCode: 13 });
    preneedHelpers.clickContinue();

    // Previous names
    cy.selectRadio('root_application_veteran_view:hasServiceName', 'N');
    preneedHelpers.clickContinue();

    // Burial benefits
    cy.fill(
      'input[name="root_application_claimant_desiredCemetery"]',
      testData.data.application.claimant.desiredCemetery.label,
    );
    cy.get('.autosuggest-item').should('exist');
    cy.get('body').click({ force: true });
    cy.selectRadio('root_application_hasCurrentlyBuried', '2');
    preneedHelpers.clickContinue();

    // Supporting documents
    preneedHelpers.clickContinue();

    // Contact information
    cy.fillAddress(
      'root_application_claimant_address',
      testData.data.application.claimant.address,
    );
    cy.fill('input[name$="email"]', testData.data.application.claimant.email);
    cy.fill(
      'input[name$="phoneNumber"]',
      testData.data.application.claimant.phoneNumber,
    );
    preneedHelpers.clickContinue();

    // Preparer
    cy.selectRadio(
      'root_application_applicant_applicantRelationshipToClaimant',
      'Self',
    );
    preneedHelpers.clickContinue();

    // Review and submit
    cy.get('[name="privacyAgreementAccepted"]')
      .find('[type="checkbox"]')
      .check({ force: true });
    cy.get('.form-progress-buttons .usa-button-primary').click();

    // Verify error message is displayed
    cy.wait('@submitError');
    cy.get('.usa-alert-error').should('be.visible');
    cy.get('.usa-alert-error').should('contain', 'run into a problem');
  });

  it('handles network timeout errors', () => {
    cy.intercept('POST', '/simple_forms_api/v1/simple_forms', {
      forceNetworkError: true,
    }).as('networkError');

    cy.intercept('GET', '/simple_forms_api/v1/cemeteries', cemeteries);
    cy.intercept('GET', '/v0/feature_toggles?*', featureToggles);

    preneedHelpers.visitIntro();

    // Quick form fill
    cy.selectRadio('root_application_claimant_relationshipToVet', '1');
    preneedHelpers.clickContinue();

    cy.fillName(
      'root_application_claimant_name',
      testData.data.application.claimant.name,
    );
    cy.fill(
      'input[name="root_application_claimant_ssn"]',
      testData.data.application.claimant.ssn,
    );
    cy.fillDate(
      'root_application_claimant_dateOfBirth',
      testData.data.application.claimant.dateOfBirth,
    );
    cy.fill(
      'input[name="root_application_veteran_placeOfBirth"]',
      testData.data.application.veteran.placeOfBirth,
    );
    preneedHelpers.clickContinue();

    cy.get(
      'input[name="root_application_veteran_race_isSpanishHispanicLatino"]',
    ).click();
    cy.selectRadio('root_application_veteran_gender', 'Female');
    cy.selectRadio('root_application_veteran_maritalStatus', 'Single');
    preneedHelpers.clickContinue();

    cy.get('#root_application_veteran_militaryStatus').select('A');
    preneedHelpers.clickContinue();

    cy.fillDate(
      'root_application_veteran_serviceRecords_0_dateRange_from',
      '2003-01-01',
    );
    cy.fillDate(
      'root_application_veteran_serviceRecords_0_dateRange_to',
      '2005-03-02',
    );
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).click();
    cy.fill(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
      'ARMY',
    );
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keydown', { keyCode: 40 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keyup', { keyCode: 40 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keydown', { keyCode: 13 });
    preneedHelpers.clickContinue();

    cy.selectRadio('root_application_veteran_view:hasServiceName', 'N');
    preneedHelpers.clickContinue();

    cy.fill(
      'input[name="root_application_claimant_desiredCemetery"]',
      'BEVERLY NATIONAL CEMETERY',
    );
    cy.get('.autosuggest-item').should('exist');
    cy.get('body').click({ force: true });
    cy.selectRadio('root_application_hasCurrentlyBuried', '2');
    preneedHelpers.clickContinue();

    preneedHelpers.clickContinue();

    cy.fillAddress('root_application_claimant_address', {
      street: '101 Main St',
      city: 'Boston',
      country: 'USA',
      state: 'MA',
      postalCode: '02101',
    });
    cy.fill('input[name$="email"]', 'test@test.com');
    cy.fill('input[name$="phoneNumber"]', '5555555555');
    preneedHelpers.clickContinue();

    cy.selectRadio(
      'root_application_applicant_applicantRelationshipToClaimant',
      'Self',
    );
    preneedHelpers.clickContinue();

    cy.get('[name="privacyAgreementAccepted"]')
      .find('[type="checkbox"]')
      .check({ force: true });
    cy.get('.form-progress-buttons .usa-button-primary').click();

    // Verify network error handling
    cy.wait('@networkError');
    cy.contains('error connecting to VA.gov').should('be.visible');
  });

  it('validates cemetery selection and shows error for invalid input', () => {
    preneedHelpers.interceptSetup();
    preneedHelpers.visitIntro();

    // Navigate to burial benefits page
    cy.selectRadio('root_application_claimant_relationshipToVet', '1');
    preneedHelpers.clickContinue();

    cy.fillName(
      'root_application_claimant_name',
      testData.data.application.claimant.name,
    );
    cy.fill(
      'input[name="root_application_claimant_ssn"]',
      testData.data.application.claimant.ssn,
    );
    cy.fillDate(
      'root_application_claimant_dateOfBirth',
      testData.data.application.claimant.dateOfBirth,
    );
    cy.fill(
      'input[name="root_application_veteran_placeOfBirth"]',
      testData.data.application.veteran.placeOfBirth,
    );
    preneedHelpers.clickContinue();

    cy.get(
      'input[name="root_application_veteran_race_isSpanishHispanicLatino"]',
    ).click();
    cy.selectRadio('root_application_veteran_gender', 'Male');
    cy.selectRadio('root_application_veteran_maritalStatus', 'Single');
    preneedHelpers.clickContinue();

    cy.get('#root_application_veteran_militaryStatus').select('A');
    preneedHelpers.clickContinue();

    cy.fillDate(
      'root_application_veteran_serviceRecords_0_dateRange_from',
      testData.data.application.veteran.serviceRecords[0].dateRange.from,
    );
    cy.fillDate(
      'root_application_veteran_serviceRecords_0_dateRange_to',
      testData.data.application.veteran.serviceRecords[0].dateRange.to,
    );
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).click();
    cy.fill(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
      'ALLIED FORCES',
    );
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keydown', { keyCode: 40 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keyup', { keyCode: 40 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keydown', { keyCode: 13 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keyup', { keyCode: 13 });
    preneedHelpers.clickContinue();

    cy.selectRadio('root_application_veteran_view:hasServiceName', 'N');
    preneedHelpers.clickContinue();

    // Fill burial benefits page without cemetery first, then add it
    cy.selectRadio('root_application_hasCurrentlyBuried', '2');

    // Fill valid cemetery
    cy.fill(
      'input[name="root_application_claimant_desiredCemetery"]',
      testData.data.application.claimant.desiredCemetery.label,
    );
    cy.get('.autosuggest-item').should('exist');
    cy.get('body').click({ force: true });
    preneedHelpers.clickContinue();

    // Should proceed to next page
    cy.url().should('contain', 'supporting-documents');
  });

  it('handles invalid address validation', () => {
    // Setup intercepts with invalid address response
    cy.intercept('POST', '/simple_forms_api/v1/simple_forms', {
      data: {
        attributes: {
          confirmationNumber: '123fake-submission-id-567',
          submittedAt: '2016-05-16',
        },
      },
    });
    cy.intercept('GET', '/simple_forms_api/v1/cemeteries', cemeteries);
    cy.intercept('GET', '/v0/feature_toggles?*', featureToggles);

    preneedHelpers.visitIntro();

    // Navigate to contact information page
    cy.selectRadio('root_application_claimant_relationshipToVet', '1');
    preneedHelpers.clickContinue();

    cy.fillName(
      'root_application_claimant_name',
      testData.data.application.claimant.name,
    );
    cy.fill(
      'input[name="root_application_claimant_ssn"]',
      testData.data.application.claimant.ssn,
    );
    cy.fillDate(
      'root_application_claimant_dateOfBirth',
      testData.data.application.claimant.dateOfBirth,
    );
    cy.fill(
      'input[name="root_application_veteran_placeOfBirth"]',
      testData.data.application.veteran.placeOfBirth,
    );
    preneedHelpers.clickContinue();

    cy.get(
      'input[name="root_application_veteran_race_isSpanishHispanicLatino"]',
    ).click();
    cy.selectRadio('root_application_veteran_gender', 'Male');
    cy.selectRadio('root_application_veteran_maritalStatus', 'Single');
    preneedHelpers.clickContinue();

    cy.get('#root_application_veteran_militaryStatus').select('A');
    preneedHelpers.clickContinue();

    cy.fillDate(
      'root_application_veteran_serviceRecords_0_dateRange_from',
      testData.data.application.veteran.serviceRecords[0].dateRange.from,
    );
    cy.fillDate(
      'root_application_veteran_serviceRecords_0_dateRange_to',
      testData.data.application.veteran.serviceRecords[0].dateRange.to,
    );
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).click();
    cy.fill(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
      'ALLIED FORCES',
    );
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keydown', { keyCode: 40 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keyup', { keyCode: 40 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keydown', { keyCode: 13 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_0_serviceBranch"]',
    ).trigger('keyup', { keyCode: 13 });
    preneedHelpers.clickContinue();

    cy.selectRadio('root_application_veteran_view:hasServiceName', 'N');
    preneedHelpers.clickContinue();

    cy.fill(
      'input[name="root_application_claimant_desiredCemetery"]',
      'BEVERLY NATIONAL CEMETERY',
    );
    cy.get('.autosuggest-item').should('exist');
    cy.get('body').click({ force: true });
    cy.selectRadio('root_application_hasCurrentlyBuried', '2');
    preneedHelpers.clickContinue();

    preneedHelpers.clickContinue();

    // Try invalid address (missing required fields)
    cy.fill('input[name="root_application_claimant_address_street"]', '123');
    preneedHelpers.clickContinue();

    // Should show validation errors for missing fields
    cy.get('.usa-input-error-message').should('have.length.at.least', 1);

    // Fill complete address
    cy.fillAddress('root_application_claimant_address', {
      street: '123 Main St',
      city: 'Boston',
      country: 'USA',
      state: 'MA',
      postalCode: '02101',
    });
    cy.fill('input[name$="email"]', 'test@test.com');
    cy.fill('input[name$="phoneNumber"]', '5555555555');
    preneedHelpers.clickContinue();

    // Should proceed successfully
    cy.url().should('contain', 'preparer');
  });
});
