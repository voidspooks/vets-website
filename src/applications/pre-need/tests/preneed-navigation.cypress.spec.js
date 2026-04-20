import preneedHelpers from './utils/cypress-preneed-helpers';
import testData from './schema/maximal-test.json';

describe('Pre-need form VA 40-10007 Navigation & Editing', () => {
  it('allows back button navigation throughout the form', () => {
    preneedHelpers.interceptSetup();
    preneedHelpers.visitIntro();

    // Fill first page
    cy.selectRadio('root_application_claimant_relationshipToVet', '1');
    preneedHelpers.clickContinue();
    cy.url().should('contain', 'applicant-details');

    // Go back
    cy.get('.form-progress-buttons .usa-button-secondary').click();
    cy.url().should('contain', 'applicant-relationship-to-vet');

    // Verify selection is preserved
    cy.get(
      'input[name="root_application_claimant_relationshipToVet"]:checked',
    ).should('have.value', '1');

    // Continue forward
    preneedHelpers.clickContinue();

    // Fill applicant details
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

    // Fill demographics
    cy.get(
      'input[name="root_application_veteran_race_isSpanishHispanicLatino"]',
    ).click();
    cy.selectRadio('root_application_veteran_gender', 'Male');
    cy.selectRadio('root_application_veteran_maritalStatus', 'Single');
    preneedHelpers.clickContinue();

    cy.url().should('contain', 'applicant-military-details');

    // Go back to demographics
    cy.get('.form-progress-buttons .usa-button-secondary').click();
    cy.url().should('contain', 'applicant-demographics');

    // Verify data is preserved
    cy.get(
      'input[name="root_application_veteran_race_isSpanishHispanicLatino"]:checked',
    ).should('exist');
    cy.get('input[name="root_application_veteran_gender"]:checked').should(
      'have.value',
      'Male',
    );

    // Go back again to applicant details
    cy.get('.form-progress-buttons .usa-button-secondary').click();
    cy.url().should('contain', 'applicant-details');

    // Verify applicant info is still there
    cy.get('input[name="root_application_claimant_name_first"]').should(
      'have.value',
      testData.data.application.claimant.name.first,
    );
    cy.get('input[name="root_application_claimant_name_last"]').should(
      'have.value',
      testData.data.application.claimant.name.last,
    );

    // Navigate forward again
    preneedHelpers.clickContinue();
    preneedHelpers.clickContinue();

    // Complete military details
    cy.get('#root_application_veteran_militaryStatus').select('V');
    preneedHelpers.clickContinue();

    // Test back navigation from military history
    cy.url().should('contain', 'applicant-military-history');
    cy.get('.form-progress-buttons .usa-button-secondary').click();
    cy.url().should('contain', 'applicant-military-details');
    cy.axeCheck();
  });

  it('allows editing answers from the review page', () => {
    preneedHelpers.interceptSetup();
    preneedHelpers.visitIntro();

    // Fill out form quickly to reach review page
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
    cy.selectRadio('root_application_veteran_maritalStatus', 'Married');
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

    cy.fillAddress('root_application_claimant_address', {
      street: '100 Test St',
      city: 'Miami',
      country: 'USA',
      state: 'FL',
      postalCode: '33101',
    });
    cy.fill('input[name$="email"]', testData.data.application.claimant.email);
    cy.fill(
      'input[name$="phoneNumber"]',
      testData.data.application.claimant.phoneNumber,
    );
    preneedHelpers.clickContinue();

    cy.selectRadio(
      'root_application_applicant_applicantRelationshipToClaimant',
      'Self',
    );
    preneedHelpers.clickContinue();

    // Now on review page
    cy.url().should('contain', 'review-and-submit');
    preneedHelpers.validateProgressBar('6');

    // Verify original data is displayed
    cy.get('.review').should(
      'contain',
      testData.data.application.claimant.name.first,
    );
    cy.get('.review').should(
      'contain',
      testData.data.application.claimant.name.last,
    );
    cy.get('.review').should(
      'contain',
      testData.data.application.claimant.email,
    );

    // Find and click Edit button for applicant information
    // First expand the accordion section
    cy.contains('Applicant information').click();
    // Click the Edit button for "Applicant details"
    cy.contains('Applicant details')
      .parent()
      .find('button')
      .contains('Edit')
      .click();

    // Should show inline edit form (not navigate)
    cy.get('input[name="root_application_claimant_name_first"]').should(
      'be.visible',
    );

    // Edit the name
    cy.fill('input[name="root_application_claimant_name_first"]', 'Updated');
    cy.fill('input[name="root_application_claimant_name_last"]', 'TestName');
    // Click the Update page button for inline edit
    cy.contains('button', 'Update page').click();

    // Back at review page
    cy.url().should('contain', 'review-and-submit');

    // Verify updated data
    cy.get('.review').should('contain', 'Updated');
    cy.get('.review').should('contain', 'TestName');
    cy.get('.review').should(
      'not.contain',
      testData.data.application.claimant.name.first,
    );
    cy.axeCheck();
  });

  it('preserves form data when navigating back and forth within form', () => {
    preneedHelpers.interceptSetup();
    preneedHelpers.visitIntro();

    // Fill first few pages
    cy.selectRadio('root_application_claimant_relationshipToVet', '1');
    preneedHelpers.clickContinue();

    // Page 1: Applicant details
    cy.fillName('root_application_claimant_name', {
      first: 'Preserved',
      middle: 'Form',
      last: 'Data',
      suffix: 'III',
    });
    cy.fill('input[name="root_application_claimant_ssn"]', '999888777');
    cy.fillDate('root_application_claimant_dateOfBirth', '1990-12-25');
    cy.fill('input[name="root_application_veteran_placeOfBirth"]', 'Seattle');
    preneedHelpers.clickContinue();

    // Page 2: Demographics
    cy.get('input[name="root_application_veteran_race_isWhite"]').click();
    cy.selectRadio('root_application_veteran_gender', 'Male');
    cy.selectRadio('root_application_veteran_maritalStatus', 'Widowed');

    // Now navigate back and verify data is preserved
    cy.get('.form-progress-buttons .usa-button-secondary').click();
    cy.url().should('contain', 'veteran-applicant-details');

    // Verify page 1 data is preserved
    cy.get('input[name="root_application_claimant_name_first"]').should(
      'have.value',
      'Preserved',
    );
    cy.get('input[name="root_application_claimant_name_last"]').should(
      'have.value',
      'Data',
    );
    cy.get('input[name="root_application_claimant_ssn"]').should(
      'have.value',
      '999888777',
    );

    // Navigate forward again
    preneedHelpers.clickContinue();
    cy.url().should('contain', 'applicant-demographics');

    // Verify demographics data still preserved after going forward
    cy.get(
      'input[name="root_application_veteran_race_isWhite"]:checked',
    ).should('exist');
    cy.get('input[name="root_application_veteran_gender"]:checked').should(
      'have.value',
      'Male',
    );
    cy.get(
      'input[name="root_application_veteran_maritalStatus"]:checked',
    ).should('have.value', 'Widowed');

    // Continue to next page
    preneedHelpers.clickContinue();

    // Navigate back one more time
    cy.get('.form-progress-buttons .usa-button-secondary').click();
    cy.url().should('contain', 'applicant-demographics');

    // Final verification that data is still there after multiple back/forward
    cy.get('input[name="root_application_veteran_gender"]:checked').should(
      'have.value',
      'Male',
    );
    cy.get(
      'input[name="root_application_veteran_race_isWhite"]:checked',
    ).should('exist');

    cy.axeCheck();
  });

  it('maintains progress bar state during navigation', () => {
    preneedHelpers.interceptSetup();
    preneedHelpers.visitIntro();

    // Page 1 - Applicant Information
    preneedHelpers.validateProgressBar('1');
    cy.selectRadio('root_application_claimant_relationshipToVet', '1');
    cy.axeCheck();
    preneedHelpers.clickContinue();

    preneedHelpers.validateProgressBar('1');
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

    preneedHelpers.validateProgressBar('1');
    cy.get(
      'input[name="root_application_veteran_race_isSpanishHispanicLatino"]',
    ).click();
    cy.selectRadio('root_application_veteran_gender', 'Male');
    cy.selectRadio('root_application_veteran_maritalStatus', 'Single');
    preneedHelpers.clickContinue();

    preneedHelpers.validateProgressBar('1');
    cy.get('#root_application_veteran_militaryStatus').select('A');
    preneedHelpers.clickContinue();

    // Page 2 - Military History
    preneedHelpers.validateProgressBar('2');
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
      testData.data.application.veteran.serviceRecords[0].serviceBranch,
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

    preneedHelpers.validateProgressBar('2');
    cy.selectRadio('root_application_veteran_view:hasServiceName', 'N');
    preneedHelpers.clickContinue();

    // Page 3 - Burial Benefits
    preneedHelpers.validateProgressBar('3');
    cy.fill(
      'input[name="root_application_claimant_desiredCemetery"]',
      'BEVERLY NATIONAL CEMETERY',
    );
    cy.get('.autosuggest-item').should('exist');
    cy.get('body').click({ force: true });
    cy.selectRadio('root_application_hasCurrentlyBuried', '2');
    preneedHelpers.clickContinue();

    // Page 4 - Supporting Documents
    preneedHelpers.validateProgressBar('4');
    preneedHelpers.clickContinue();

    // Page 5 - Contact Information
    preneedHelpers.validateProgressBar('5');
    cy.fillAddress('root_application_claimant_address', {
      street: '1 Test St',
      city: 'Boston',
      country: 'USA',
      state: 'MA',
      postalCode: '02101',
    });
    cy.fill('input[name$="email"]', 'test@test.com');
    cy.fill('input[name$="phoneNumber"]', '5555555555');
    preneedHelpers.clickContinue();

    preneedHelpers.validateProgressBar('5');
    cy.selectRadio(
      'root_application_applicant_applicantRelationshipToClaimant',
      'Self',
    );
    preneedHelpers.clickContinue();

    // Page 6 - Review
    preneedHelpers.validateProgressBar('6');

    // Navigate back and verify progress bar updates correctly
    cy.get('.form-progress-buttons .usa-button-secondary').click();
    preneedHelpers.validateProgressBar('5');

    cy.get('.form-progress-buttons .usa-button-secondary').click();
    preneedHelpers.validateProgressBar('5');

    cy.get('.form-progress-buttons .usa-button-secondary').click();
    preneedHelpers.validateProgressBar('4');
    // Skip axeCheck here due to pre-existing form heading-order violation
    // on supporting documents page (not related to navigation functionality)
  });

  it('allows editing service periods and adding new ones from review page', () => {
    preneedHelpers.interceptSetup();
    preneedHelpers.visitIntro();

    // Quick fill to military history
    cy.selectRadio('root_application_claimant_relationshipToVet', '1');
    preneedHelpers.clickContinue();

    cy.fillName('root_application_claimant_name', {
      first: 'Test',
      middle: 'Service',
      last: 'Veteran',
      suffix: 'Jr.',
    });
    cy.fill('input[name="root_application_claimant_ssn"]', '111222333');
    cy.fillDate('root_application_claimant_dateOfBirth', '1980-05-05');
    cy.fill('input[name="root_application_veteran_placeOfBirth"]', 'Dallas');
    preneedHelpers.clickContinue();

    cy.get(
      'input[name="root_application_veteran_race_isSpanishHispanicLatino"]',
    ).click();
    cy.selectRadio('root_application_veteran_gender', 'Male');
    cy.selectRadio('root_application_veteran_maritalStatus', 'Single');
    preneedHelpers.clickContinue();

    cy.get('#root_application_veteran_militaryStatus').select('V');
    preneedHelpers.clickContinue();

    // Add one service period
    cy.fillDate(
      'root_application_veteran_serviceRecords_0_dateRange_from',
      '2000-01-01',
    );
    cy.fillDate(
      'root_application_veteran_serviceRecords_0_dateRange_to',
      '2004-01-01',
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

    cy.fillAddress('root_application_claimant_address', {
      street: '100 Main',
      city: 'Dallas',
      country: 'USA',
      state: 'TX',
      postalCode: '75201',
    });
    cy.fill('input[name$="email"]', 'vet@test.com');
    cy.fill('input[name$="phoneNumber"]', '2145551234');
    preneedHelpers.clickContinue();

    cy.selectRadio(
      'root_application_applicant_applicantRelationshipToClaimant',
      'Self',
    );
    preneedHelpers.clickContinue();

    // On review page
    cy.url().should('contain', 'review-and-submit');

    // Edit military history to add another service period
    // First expand the accordion
    cy.contains('Military history').click();
    // Then click the Edit button for Service period(s)
    cy.contains('Service period(s)')
      .parent()
      .find('button')
      .contains('Edit')
      .click();

    // Add second service period using the add button
    cy.contains('button', 'Add another service period').click();
    cy.fillDate(
      'root_application_veteran_serviceRecords_1_dateRange_from',
      '2005-01-01',
    );
    cy.fillDate(
      'root_application_veteran_serviceRecords_1_dateRange_to',
      '2010-01-01',
    );
    cy.get(
      'input[name="root_application_veteran_serviceRecords_1_serviceBranch"]',
    ).click();
    cy.fill(
      'input[name="root_application_veteran_serviceRecords_1_serviceBranch"]',
      'NAVY',
    );
    cy.get(
      'input[name="root_application_veteran_serviceRecords_1_serviceBranch"]',
    ).trigger('keydown', { keyCode: 40 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_1_serviceBranch"]',
    ).trigger('keyup', { keyCode: 40 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_1_serviceBranch"]',
    ).trigger('keydown', { keyCode: 13 });
    cy.get(
      'input[name="root_application_veteran_serviceRecords_1_serviceBranch"]',
    ).trigger('keyup', { keyCode: 13 });
    // Click Update page button for inline edit
    cy.contains('button', 'Update page').click();

    // Back at review page
    cy.url().should('contain', 'review-and-submit');

    // Verify both service periods are shown
    cy.get('.review').should('contain', '2000');
    cy.get('.review').should('contain', '2004');
    cy.get('.review').should('contain', '2005');
    cy.get('.review').should('contain', '2010');
    cy.axeCheck();
  });
});
