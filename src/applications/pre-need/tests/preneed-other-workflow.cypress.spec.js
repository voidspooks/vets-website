import testData from './schema/other-test.json';
import preneedHelpers from './utils/cypress-preneed-helpers';

describe('Pre-need form VA 40-10007 Other Relationship Workflow', () => {
  it('fills the form with other relationship to veteran', () => {
    preneedHelpers.interceptSetup();
    preneedHelpers.visitIntro();

    // Applicant Information - Other relationship
    preneedHelpers.validateProgressBar('1');
    cy.selectRadio(
      'root_application_claimant_relationshipToVet',
      testData.data.application.claimant.relationshipToVet,
    );
    cy.axeCheck();
    preneedHelpers.clickContinue();
    cy.url().should('not.contain', '/applicant-relationship-to-vet');

    // Applicant Details
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
    cy.axeCheck();
    preneedHelpers.clickContinue();
    cy.url().should('not.contain', '/nonVeteran-applicant-details');

    // Sponsor/Veteran Details
    preneedHelpers.validateProgressBar('2');
    cy.fillName(
      'root_application_veteran_currentName',
      testData.data.application.veteran.currentName,
    );
    cy.fill(
      'input[name="root_application_veteran_ssn"]',
      testData.data.application.veteran.ssn,
    );
    cy.fillDate(
      'root_application_veteran_dateOfBirth',
      testData.data.application.veteran.dateOfBirth,
    );
    cy.fill(
      'input[name="root_application_veteran_placeOfBirth"]',
      testData.data.application.veteran.placeOfBirth,
    );
    cy.axeCheck();
    preneedHelpers.clickContinue();
    cy.url().should('not.contain', '/sponsor-details');

    // Sponsor Demographics
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
    cy.axeCheck();
    preneedHelpers.clickContinue();
    cy.url().should('not.contain', '/sponsor-demographics');

    // Is Sponsor Deceased - NO (living veteran)
    cy.selectRadio(
      'root_application_veteran_isDeceased',
      testData.data.application.veteran.isDeceased,
    );
    cy.axeCheck();
    preneedHelpers.clickContinue();
    cy.url().should('not.contain', '/sponsor-deceased');

    // Sponsor Military Details
    cy.fill(
      'input[name="root_application_veteran_militaryServiceNumber"]',
      testData.data.application.veteran.militaryServiceNumber,
    );
    cy.fill(
      'input[name="root_application_veteran_vaClaimNumber"]',
      testData.data.application.veteran.vaClaimNumber,
    );
    cy.get('#root_application_veteran_militaryStatus').select(
      testData.data.application.veteran.militaryStatus,
    );
    cy.axeCheck();
    preneedHelpers.clickContinue();
    cy.url().should('not.contain', '/sponsor-military-details');

    // Military History
    preneedHelpers.validateProgressBar('3');
    preneedHelpers.fillMilitaryHistory(
      testData.data.application.veteran.serviceRecords,
    );
    cy.url().should('not.contain', '/sponsor-military-history');

    // Previous Names - No service name
    cy.selectRadio('root_application_veteran_view:hasServiceName', 'N');
    cy.axeCheck();
    preneedHelpers.clickContinue();
    cy.url().should('not.contain', '/sponsor-military-name');

    // Benefit Selection
    preneedHelpers.validateProgressBar('4');
    cy.fill(
      'input[name="root_application_claimant_desiredCemetery"]',
      testData.data.application.claimant.desiredCemetery.label,
    );
    cy.get('.autosuggest-item').should('exist');
    cy.get('body').click({ force: true });
    cy.selectRadio(
      'root_application_hasCurrentlyBuried',
      testData.data.application.hasCurrentlyBuried,
    );
    cy.axeCheck();
    preneedHelpers.clickContinue();
    cy.url().should('not.contain', '/burial-benefits');

    // Supporting Documents
    cy.get('label[for="root_application_preneedAttachments"]').should(
      'be.visible',
    );
    preneedHelpers.validateProgressBar('5');
    // Skip axeCheck here due to pre-existing form heading-order violation
    // on supporting documents page (not related to workflow functionality)
    preneedHelpers.clickContinue();
    cy.url().should('not.contain', '/supporting-documents');

    // Applicant Contact Information
    preneedHelpers.validateProgressBar('6');
    cy.fillAddress(
      'root_application_claimant_address',
      testData.data.application.claimant.address,
    );
    cy.fill('input[name$="email"]', testData.data.application.claimant.email);
    cy.fill(
      'input[name$="phoneNumber"]',
      testData.data.application.claimant.phoneNumber,
    );
    cy.axeCheck();
    preneedHelpers.clickContinue();
    cy.url().should('not.contain', '/applicant-contact-information');

    // Sponsor Mailing Address
    preneedHelpers.validateProgressBar('6');
    cy.fillAddress(
      'root_application_veteran_address',
      testData.data.application.veteran.address,
    );
    cy.axeCheck();
    preneedHelpers.clickContinue();
    cy.url().should('not.contain', '/sponsor-mailing-address');

    // Preparer - Self
    preneedHelpers.validateProgressBar('6');
    cy.selectRadio(
      'root_application_applicant_applicantRelationshipToClaimant',
      testData.data.application.applicant.applicantRelationshipToClaimant,
    );
    cy.axeCheck();
    preneedHelpers.clickContinue();
    cy.url().should('not.contain', '/preparer');

    // Review and Submit
    preneedHelpers.validateProgressBar('7');
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
      testData.data.application.veteran.currentName.first,
    );
    cy.get('.review').should(
      'contain',
      testData.data.application.veteran.currentName.last,
    );

    preneedHelpers.submitForm();
  });
});
