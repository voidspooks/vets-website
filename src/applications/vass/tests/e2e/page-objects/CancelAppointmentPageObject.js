import PageObject from './PageObject';
import { URLS } from '../../../utils/constants';

export class CancelAppointmentPageObject extends PageObject {
  /**
   * Assert the Cancel Appointment page is displayed with all appointment card details
   * @param {Object} options - Options
   * @param {string} options.agentName - Expected agent name (defaults to 'Agent Smith')
   * @returns {CancelAppointmentPageObject}
   */
  assertCancelAppointmentPage({ agentName = 'Agent Smith' } = {}) {
    // Assert the URL is correct
    this.assertUrl(URLS.CANCEL_APPOINTMENT);

    // Page heading
    this.assertHeading({
      name: 'Would you like to cancel this call?',
      level: 1,
      exist: true,
    });

    // Assert no error states on initial load
    this.assertWrapperErrorAlert({ exist: false });

    // Page structure
    this.assertElement('cancel-appointment-page');

    // Appointment card
    this.assertElement('appointment-card');
    this.assertElement('appointment-type', {
      containsText: 'Phone appointment',
    });

    // When section
    this.assertElement('when-section');

    // What section
    this.assertElement('what-section', {
      containsText: 'VA Solid Start',
    });

    // Who section with agent name
    this.assertElement('who-section', {
      containsText: agentName,
    });

    // Cancel/print buttons should NOT be present on this page (different from Confirmation)
    this.assertElement('print-button', { exist: false });
    this.assertElement('cancel-button', { exist: false });

    // Button pair for cancel confirmation
    this.assertElement('cancel-confirm-button-pair');

    // Assert need help footer
    this.assertNeedHelpFooter();

    return this;
  }

  /**
   * Click "Yes, cancel appointment" button
   * @returns {CancelAppointmentPageObject}
   */
  clickYesCancelAppointment() {
    cy.findByTestId('cancel-confirm-button-pair')
      .shadow()
      .find('va-button')
      .first()
      .click();
    return this;
  }

  /**
   * Click "No, don't cancel" button
   * @returns {CancelAppointmentPageObject}
   */
  clickNoDontCancel() {
    cy.findByTestId('cancel-confirm-button-pair')
      .shadow()
      .find('va-button')
      .last()
      .click();
    return this;
  }
}

export default new CancelAppointmentPageObject();
