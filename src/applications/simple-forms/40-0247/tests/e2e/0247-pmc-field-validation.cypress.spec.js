// Validation-focused tests; axe checks covered in main spec

import manifest from '../../manifest.json';
import formConfig from '../../config/form';
import featureToggles from '../../../shared/tests/e2e/fixtures/mocks/feature-toggles.json';
import mockSubmit from '../../../shared/tests/e2e/fixtures/mocks/application-submit.json';
import {
  fillTextWebComponent,
  fillFullNameWebComponentPattern,
  fillDateWebComponentPattern,
  selectRadioWebComponent,
  selectYesNoWebComponent,
} from '../../../shared/tests/e2e/helpers';

const { rootUrl } = manifest;

const clickContinue = () => {
  cy.findByText(/continue/i, { selector: 'button' }).click();
};

const startForm = () => {
  cy.visit(rootUrl);
  cy.findAllByText(/start/i, { selector: 'a' })
    .first()
    .click();
};

describe('40-0247 PMC - Field Validation', () => {
  beforeEach(() => {
    cy.intercept('GET', '/v0/feature_toggles?*', featureToggles);
    cy.intercept(formConfig.submitUrl, mockSubmit);
    cy.config('includeShadowDom', true);
  });

  it('validates all form fields through complete flow without page refreshes', () => {
    // Start the form once
    startForm();

    // ===== VETERAN PERSONAL INFORMATION PAGE =====
    // Test required field errors when submitting empty page
    clickContinue();

    cy.get('va-text-input[name="root_veteranFullName_first"]')
      .should('have.attr', 'error')
      .and('not.be.empty');
    cy.get('va-text-input[name="root_veteranFullName_last"]')
      .should('have.attr', 'error')
      .and('not.be.empty');
    cy.get('va-memorable-date[name="root_veteranDateOfBirth"]')
      .should('have.attr', 'error')
      .and('not.be.empty');
    cy.get('va-memorable-date[name="root_veteranDateOfDeath"]')
      .should('have.attr', 'error')
      .and('not.be.empty');

    // Fill name fields to clear those errors
    fillFullNameWebComponentPattern('veteranFullName', {
      first: 'John',
      middle: '',
      last: 'Veteran',
    });

    // Test date of death before date of birth error
    fillDateWebComponentPattern('veteranDateOfBirth', '2000-01-01');
    fillDateWebComponentPattern('veteranDateOfDeath', '1990-01-01');
    clickContinue();

    cy.get('va-memorable-date[name="root_veteranDateOfDeath"]')
      .should('have.attr', 'error')
      .and('contain', 'after the date of birth');

    // Fix death date but make it less than 16 years after birth
    fillDateWebComponentPattern('veteranDateOfDeath', '2010-01-01');
    clickContinue();

    cy.get('va-memorable-date[name="root_veteranDateOfDeath"]')
      .should('have.attr', 'error')
      .and('contain', 'at least 16 years');

    // Fix with valid date and continue to next page
    fillDateWebComponentPattern('veteranDateOfDeath', '2020-01-01');
    clickContinue();

    // ===== IDENTIFICATION INFORMATION PAGE =====
    cy.url().should('include', 'identification-information');

    // Test required field error
    clickContinue();

    cy.get('va-text-input[name="root_veteranId_ssn"]')
      .should('have.attr', 'error')
      .and('not.be.empty');

    // Fix by providing SSN and continue to next page
    fillTextWebComponent('veteranId_ssn', '333221111');
    clickContinue();

    // ===== SUPPORTING DOCUMENTATION PAGE =====
    cy.url().should('include', 'supporting-documentation');
    // File upload is optional - continue to next page
    clickContinue();

    // ===== REQUEST TYPE PAGE =====
    cy.url().should('include', 'request-type');

    // Test required field error
    clickContinue();

    cy.get('va-radio[name="root_isFirstRequest"]')
      .should('have.attr', 'error')
      .and('contain', 'first Presidential Memorial Certificate request');

    // Fix by making selection and continue to next page
    selectRadioWebComponent('isFirstRequest', 'Y');
    clickContinue();

    // ===== APPLICANT PERSONAL INFORMATION PAGE =====
    cy.url().should('include', 'applicant-personal-information');

    // Test required field errors
    clickContinue();

    cy.get('va-text-input[name="root_applicantFullName_first"]')
      .should('have.attr', 'error')
      .and('not.be.empty');
    cy.get('va-text-input[name="root_applicantFullName_last"]')
      .should('have.attr', 'error')
      .and('not.be.empty');

    // Fix by filling name and continue to next page
    fillFullNameWebComponentPattern('applicantFullName', {
      first: 'Joe',
      middle: '',
      last: 'Applicant',
    });
    clickContinue();

    // ===== APPLICANT ADDRESS PAGE =====
    cy.url().should('include', 'applicant-address');

    // Fill address and continue to next page
    cy.get('[name="root_applicantAddress_state"]').should(
      'not.have.attr',
      'disabled',
    );
    cy.fillAddressWebComponentPattern('applicantAddress', {
      country: 'USA',
      street: '123 Any St',
      city: 'Anytown',
      state: 'NY',
      postalCode: '12345',
    });
    clickContinue();

    // ===== APPLICANT CONTACT INFORMATION PAGE =====
    cy.url().should('include', 'applicant-contact-information');

    // Test required field error
    clickContinue();

    cy.get('va-text-input[name="root_applicantPhone"]')
      .should('have.attr', 'error')
      .and('not.be.empty');

    // Fix by filling phone and continue to next page
    fillTextWebComponent('applicantPhone', '5551234567');
    clickContinue();

    // ===== CERTIFICATES PAGE =====
    cy.url().should('include', 'certificates');

    // Test required field error
    clickContinue();

    cy.get('va-text-input[name="root_certificates"]')
      .should('have.attr', 'error')
      .and('contain', 'Enter the number of certificates');

    // Test zero value error
    fillTextWebComponent('certificates', '0');
    clickContinue();

    cy.get('va-text-input[name="root_certificates"]')
      .should('have.attr', 'error')
      .and('contain', 'Enter a number between 1 and 99');

    // Test exceeds max error
    fillTextWebComponent('certificates', '100');
    clickContinue();

    cy.get('va-text-input[name="root_certificates"]')
      .should('have.attr', 'error')
      .and('contain', 'Enter a number between 1 and 99');

    // Fix with valid value and continue to next page
    fillTextWebComponent('certificates', '5');
    clickContinue();

    // ===== ADDITIONAL CERTIFICATES YES/NO PAGE =====
    cy.url().should('include', 'additional-certificates');

    // Test required field error
    clickContinue();

    cy.get('va-radio[name="root_additionalCertificates"]')
      .should('have.attr', 'error')
      .and('contain', 'send additional certificates');

    // Select Yes to test additional copies page
    selectYesNoWebComponent('additionalCertificates', true);
    clickContinue();

    // ===== ADDITIONAL CERTIFICATES REQUEST PAGE =====
    // Test required field error for number of certificates
    clickContinue();

    cy.get('va-text-input[name="root_additionalCopies"]')
      .should('have.attr', 'error')
      .and('contain', 'Enter the number of certificates');

    // Test exceeds max error
    fillTextWebComponent('additionalCopies', '100');
    clickContinue();

    cy.get('va-text-input[name="root_additionalCopies"]')
      .should('have.attr', 'error')
      .and('contain', 'Enter a number between 1 and 99');

    // Fix with valid value
    fillTextWebComponent('additionalCopies', '3');

    // Test required field errors for additional address
    clickContinue();

    // Verify address errors appear
    cy.get('va-select[name="root_additionalAddress_country"]')
      .should('have.attr', 'error')
      .and('contain', 'Select a country');

    // Fill the additional address to clear errors
    cy.get('[name="root_additionalAddress_country"]').should(
      'not.have.attr',
      'disabled',
    );
    cy.fillAddressWebComponentPattern('additionalAddress', {
      country: 'USA',
      street: '456 Another St',
      city: 'Othertown',
      state: 'CA',
      postalCode: '90210',
    });

    // Verify address errors are cleared
    cy.get('va-select[name="root_additionalAddress_country"]').should(
      'not.have.attr',
      'error',
    );
    clickContinue();

    // ===== REVIEW PAGE =====
    cy.url().should('include', 'review-and-submit');

    // Sign and submit - wait for signature input to be ready
    cy.get('#veteran-signature')
      .should('be.visible')
      .shadow()
      .find('input')
      .should('exist')
      .type('Joe Applicant', { force: true });
    cy.get('va-checkbox[id="veteran-certify"]')
      .shadow()
      .find('input')
      .click({ force: true });
    cy.findByText('Submit request', { selector: 'button' }).click();
    cy.url().should('include', 'confirmation');
  });
});
