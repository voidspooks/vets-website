import { medicationsUrls } from '../../../util/constants';

class RefillStatusPage {
  visitPage = fixture => {
    cy.intercept('GET', '/my_health/v1/prescriptions*', fixture).as(
      'prescriptions',
    );
    cy.visit(medicationsUrls.MEDICATIONS_REFILL_STATUS);
  };

  visitPageWithError = errorResponse => {
    cy.intercept('GET', '/my_health/v1/prescriptions*', errorResponse).as(
      'prescriptionsError',
    );
    cy.visit(medicationsUrls.MEDICATIONS_REFILL_STATUS);
  };

  verifyHeading = () => {
    cy.findByTestId('refill-status-heading').should(
      'have.text',
      'Prescription refill status',
    );
  };

  verifyEmptyViewProcessListSteps = () => {
    cy.findByText('You request a refill').should('exist');
    cy.findByText('We process your refill request').should('exist');
    cy.findByText('We ship your refill to you').should('exist');
  };

  verifyProcessListSteps = () => {
    cy.findByText('Request submitted').should('exist');
    cy.findByText('Fill in progress').should('exist');
    cy.findByText('Prescription shipped').should('exist');
  };

  verifySubmittedPrescription = name => {
    cy.findByTestId('submitted-prescriptions').within(() => {
      cy.findByRole('link', { name }).should('exist');
    });
  };

  verifyInProgressPrescription = name => {
    cy.findByTestId('refill-status-prescriptions').within(() => {
      cy.findByRole('link', { name }).should('exist');
    });
  };

  verifyShippedPrescription = name => {
    cy.findByTestId('shipped-prescriptions').within(() => {
      cy.findByRole('link', { name }).should('exist');
    });
  };

  verifyPrescriptionNotInList = name => {
    cy.findByRole('link', { name }).should('not.exist');
  };

  verifyNeedHelpSection = () => {
    cy.findByTestId('rx-need-help-container').should('exist');
  };

  verifyApiErrorNotification = () => {
    cy.findByTestId('api-error-notification').should('exist');
    cy.findByTestId('no-medications-list').should('exist');
  };
}

export default RefillStatusPage;
