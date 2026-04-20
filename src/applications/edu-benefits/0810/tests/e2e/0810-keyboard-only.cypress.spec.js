/* eslint-disable cypress/unsafe-to-chain-command */
import formConfig from '../../config/form';
import user from '../fixtures/mocks/user.json';
import prefilledForm from '../fixtures/mocks/prefilled-form.json';
import sip from '../fixtures/mocks/sip-put.json';
import manifest from '../../manifest.json';

describe('22-0810 EDU Form', () => {
  beforeEach(function() {
    if (Cypress.env('CI')) this.skip();
  });

  it('should be keyboard-only navigable', () => {
    // Authenticated endpoints for login, prefill, andn sip
    cy.intercept('GET', '/v0/user', user);
    cy.intercept('GET', '/v0/in_progress_forms/22-0810', prefilledForm);
    cy.intercept('PUT', '/v0/in_progress_forms/22-0810', sip);
    cy.login(user);
    // Default endpoints to intercept
    cy.intercept('GET', '/v0/feature_toggles*', {
      data: {
        type: 'feature_toggles',
        features: [],
      },
    });
    cy.intercept('GET', '/data/cms/vamc-ehr.json', {});
    // Submit endpoint
    cy.intercept('POST', '/v0/education_benefits_claims/0810', {});

    // Navigate to the Introduction Page
    cy.visit(manifest.rootUrl);
    cy.injectAxeThenAxeCheck();
    cy.focused().should(
      'contain.text',
      'Request national exam fee reimbursement online',
    );
    // Tab to and press 'Start your Request reimbursement for national exam fees'
    cy.repeatKey('Tab', 5);
    cy.realPress(['Enter']);

    // Your education benefits information - Step 1 (has previously applied not selected to visit eligibility warning page)
    cy.url().should(
      'include',
      formConfig.chapters.educationBenefitsChapter.pages.hasPreviouslyApplied
        .path,
    );
    cy.injectAxeThenAxeCheck();
    cy.focused().should('contain.text', 'Your VA education benefits');
    cy.realPress('Tab');
    cy.allyEvaluateRadioButtons(
      [
        'input#root_hasPreviouslyAppliedYesinput',
        'input#root_hasPreviouslyAppliedNoinput',
      ],
      'ArrowDown',
    );
    // Set to 'No' to visit eligibility warning page
    cy.chooseRadio('N');
    cy.tabToContinueForm();

    // You VA education benefits history eligibility warning page - Step 1
    cy.url().should(
      'include',
      formConfig.chapters.educationBenefitsChapter.pages
        .educationBenefitsEligibility.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.focused().should('contain.text', 'Your VA education benefits');
    cy.realPress('Tab');
    cy.focused().should(
      'contain.text',
      'Apply for VA education benefits using Form 22-1990',
    );
    cy.realPress('Tab');
    cy.focused().should(
      'contain.text',
      'Apply for VA education benefits as a dependent using Form 22-5490',
    );
    cy.realPress('Tab');
    cy.focused().should(
      'contain.text',
      'Apply to use transferred education benefits using Form 22-1990e',
    );
    cy.clickFormBack();

    // Your education benefits information - Step 1 (has previously applied selected to visit benefits history page)
    cy.url().should(
      'include',
      formConfig.chapters.educationBenefitsChapter.pages.hasPreviouslyApplied
        .path,
    );
    cy.injectAxeThenAxeCheck();
    cy.focused().should('contain.text', 'Your VA education benefits');
    cy.get('input#root_hasPreviouslyAppliedNoinput').focus();
    // Set to 'Yes' to visit benefit program page
    cy.chooseRadio('Y');
    cy.tabToContinueForm();

    // Select a VA benefit program page - Step 1
    cy.url().should(
      'include',
      formConfig.chapters.educationBenefitsChapter.pages.selectVABenefit.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.focused().should('contain.text', 'Select a VA benefit program');
    cy.realPress('Tab');
    cy.allyEvaluateRadioButtons(
      [
        'input#root_vaBenefitProgramchapter33input',
        'input#root_vaBenefitProgramchapter35input',
        'input#root_vaBenefitProgramchapter30input',
        'input#root_vaBenefitProgramchapter1606input',
      ],
      'ArrowDown',
    );
    cy.chooseRadio('chapter35');
    cy.tabToContinueForm();

    // Your personal information - Step 2
    cy.url().should('include', 'personal-information');
    cy.injectAxeThenAxeCheck();
    cy.focused().should(
      'contain.text',
      'Confirm the personal information we have on file for you',
    );
    cy.repeatKey('Tab', 6);
    cy.realPress(['Enter']);

    // Your VA payee number page - Step 2
    cy.url().should(
      'include',
      formConfig.chapters.personalInformationChapter.pages.payeeNumber.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.focused().should('contain.text', 'Your VA payee number');
    cy.realPress('Tab');
    cy.get(':focus')
      .first()
      .type('M2', { delay: 250 });
    cy.tabToContinueForm();

    // Your personal information contact information page - Step 2
    cy.url().should('include', 'contact-information');
    cy.injectAxeThenAxeCheck();
    cy.focused().should(
      'contain.text',
      'Confirm the contact information we have on file for you',
    );
    cy.repeatKey('Tab', 7);
    cy.realPress(['Enter']);

    // Exam name and date taken page - Step 3
    cy.url().should(
      'include',
      formConfig.chapters.examInformationChapter.pages.examNameAndDateTaken
        .path,
    );
    cy.injectAxeThenAxeCheck();
    cy.focused().should('contain.text', 'Exam name and date taken');
    cy.realPress('Tab');
    cy.typeInFocused('Exam Name');
    cy.realPress('Tab');
    cy.fillVaMemorableDate('root_examDate', '2025-08-01', false);
    cy.tabToContinueForm();

    // Exam information org details page - Step 3
    cy.url().should(
      'include',
      formConfig.chapters.examInformationChapter.pages.organizationInfo.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.focused().should(
      'contain.text',
      'Name and address of organization issuing the exam',
    );
    cy.realPress('Tab');
    cy.typeInFocused('Exam Org');
    cy.realPress('Tab');
    cy.typeInFocused('Exam Street');
    cy.repeatKey('Tab', 3);
    cy.typeInFocused('Exam City');
    cy.selectVaSelect('root_organizationAddress_state', 'MI');
    cy.realPress('Tab');
    cy.typeInFocused('23456');
    cy.tabToContinueForm();

    // Exam cost page - Step 3
    cy.url().should(
      'include',
      formConfig.chapters.examInformationChapter.pages.examCost.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.focused().should('contain.text', 'Exam cost');
    cy.realPress('Tab');
    cy.typeInFocused('250.75');
    cy.tabToContinueForm();

    // Remarks - Step 4
    cy.url().should(
      'include',
      formConfig.chapters.remarksChapter.pages.remarksPage.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.focused().should('contain.text', 'Enter your remarks');
    cy.realPress('Tab');
    cy.typeInFocused('Here are some remarks');
    cy.tabToContinueForm();

    // Submission instructions - Step 5
    cy.url().should(
      'include',
      formConfig.chapters.submissionInstructionsChapter.pages
        .submissionInstructions.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.focused().should('contain.text', 'How to submit your form');
    cy.tabToContinueForm();

    // Review page
    cy.url().should('include', 'review-and-submit');
    cy.injectAxeThenAxeCheck();
    cy.get('#veteran-signature')
      .shadow()
      .get('#inputField')
      .type('John Doe');
    cy.tabToElementAndPressSpace('va-checkbox');
    cy.tabToSubmitForm();

    // Confirmation page
    cy.url().should('include', '/confirmation');
    cy.focused().should('contain.text', 'Complete all submission steps');
  });
});
