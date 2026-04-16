import PageObject from '../../page-objects/PageObject';

export class ReviewAndConfirmPageObject extends PageObject {
  /**
   * Validates that we're on the Review and Confirm page
   */
  validate() {
    cy.findByRole('heading', {
      level: 1,
      name: 'Review your appointment details',
    }).should('exist');

    cy.findByRole('heading', { level: 2, name: 'Date and time' }).should(
      'exist',
    );
    cy.findByTestId('slot-day-time').should('exist');
    cy.findByRole('heading', { level: 2, name: 'Details' }).should('exist');

    return this;
  }

  /**
   * Validates the Details section displays Community Care content
   */
  assertProviderInfo() {
    cy.findByRole('heading', { level: 2, name: 'Details' }).should('exist');
    cy.findByText(/Community care/).should('exist');
    return this;
  }

  /**
   * Validates the Details section heading, modality, and organization name
   */
  assertDetailsSection({ modality = 'In-person' } = {}) {
    cy.findByRole('heading', { level: 2, name: 'Details' }).should('exist');
    cy.findByTestId('review-modality').should('contain.text', modality);
    return this;
  }

  /**
   * Validates that the edit link for details is available
   */
  assertEditDetailsLink() {
    cy.findByTestId('edit-details-link').should('exist');
    return this;
  }

  /**
   * Validates date and time information is displayed
   */
  assertDateTimeInfo() {
    cy.findByTestId('slot-day-time')
      .should('exist')
      .within(() => {
        // Check for day of week, month, date and year
        cy.findByText(
          /Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/,
        ).should('exist');
        // Check for time format
        cy.findByText(/\d{1,2}:\d{2} (a.m.|p.m.)/).should('exist');
      });
    return this;
  }

  /**
   * Validates that a CC submission error is displayed when appointment creation fails
   */
  assertApiErrorAlert() {
    cy.findByTestId('create-error-alert').within(() => {
      cy.findByText(/We couldn\u2019t schedule this appointment/i).should(
        'exist',
      );
      cy.findByText(/call this provider to schedule an appointment/i).should(
        'exist',
      );
      cy.findByTestId('referral-community-care-office').should('exist');
    });
    return this;
  }

  /**
   * Validates that a VA submission error is displayed when appointment creation fails
   */
  assertApiErrorAlertVA() {
    cy.findByTestId('create-error-alert').within(() => {
      cy.findByText(/We couldn\u2019t schedule this appointment/i).should(
        'exist',
      );
      cy.findByText(/call your facility to help with your appointment/i).should(
        'exist',
      );
      cy.findByTestId('va-facility-info').should('exist');
    });
    return this;
  }

  /**
   * Validates that the edit link for date and time is available
   */
  assertEditDateTimeLink() {
    cy.findByTestId('edit-when-information-link').should('exist');
    return this;
  }

  /**
   * Clicks the Edit link for date and time
   */
  clickEditDateTime() {
    cy.findByTestId('edit-when-information-link').click();
    return this;
  }

  /**
   * Clicks the Continue button to proceed with scheduling
   */
  clickContinue() {
    cy.findByTestId('continue-button').click();
    return this;
  }

  /**
   * Clicks the Back button
   */
  clickBack() {
    cy.contains('button', 'Back').click();
    return this;
  }

  /**
   * Validates the URL for the page
   */
  _validateUrl() {
    cy.url().should('include', '/review');
    return this;
  }

  /**
   * Validates the header for the page
   */
  _validateHeader() {
    cy.findByRole('heading', {
      level: 1,
      name: 'Review your appointment details',
    }).should('exist');
    return this;
  }
}

export default new ReviewAndConfirmPageObject();
