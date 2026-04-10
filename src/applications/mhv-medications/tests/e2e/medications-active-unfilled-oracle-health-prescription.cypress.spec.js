import MedicationsSite from './med_site/MedicationsSite';
import MedicationsListPage from './pages/MedicationsListPage';
import MedicationsDetailsPage from './pages/MedicationsDetailsPage';
import unfilledOhRxList from './fixtures/list-active-unfilled-oh-prescription.json';
import unfilledOhRx from './fixtures/active-unfilled-oh-prescription.json';
import cernerUser from './fixtures/cerner-user.json';

describe('Medications Active Unfilled Oracle Health Prescription', () => {
  it('displays unfilled OH message on list page when prescription has never been dispensed', () => {
    const site = new MedicationsSite();
    const listPage = new MedicationsListPage();

    site.login(true, false, cernerUser);
    listPage.visitMedicationsListPageURL(unfilledOhRxList);

    // Verify the unfilled OH message component is displayed
    cy.get('[data-testid="active-unfilled-oh"]').should('be.visible');

    // Verify message contains prescription-related content (works with both flag versions)
    cy.get('[data-testid="active-unfilled-oh"]').should(
      'contain.text',
      'prescription',
    );

    // Verify the refill button is NOT displayed for unfilled OH prescription
    cy.get('[data-testid="refill-request-button"]').should('not.exist');

    cy.injectAxe();
    cy.axeCheck('main');
  });

  it('displays unfilled OH message on details page when prescription has never been dispensed', () => {
    const site = new MedicationsSite();
    const listPage = new MedicationsListPage();
    const detailsPage = new MedicationsDetailsPage();

    site.login(true, false, cernerUser);
    listPage.visitMedicationsListPageURL(unfilledOhRxList);

    // Navigate to details page
    detailsPage.clickMedicationDetailsLink(unfilledOhRx, 1);

    // Verify the unfilled OH message component is displayed on details page
    cy.get('[data-testid="active-unfilled-oh"]').should('be.visible');

    // Verify message contains prescription-related content
    cy.get('[data-testid="active-unfilled-oh"]').should(
      'contain.text',
      'prescription',
    );

    cy.injectAxe();
    cy.axeCheck('main');
  });

  it('displays pharmacy phone number in unfilled OH message when available', () => {
    const site = new MedicationsSite();
    const listPage = new MedicationsListPage();

    // Create fixture with pharmacy phone
    const unfilledOhRxWithPhone = {
      ...unfilledOhRxList,
      data: [
        {
          ...unfilledOhRxList.data[0],
          attributes: {
            ...unfilledOhRxList.data[0].attributes,
            cmopDivisionPhone: '509-434-7000',
            pharmacyPhoneNumber: '509-434-7000',
          },
        },
      ],
    };

    site.login(true, false, cernerUser);
    listPage.visitMedicationsListPageURL(unfilledOhRxWithPhone);

    // Verify the message contains pharmacy reference
    cy.get('[data-testid="active-unfilled-oh"]')
      .should('be.visible')
      .and('contain', 'VA pharmacy');

    // Verify the phone number component is present
    cy.get('[data-testid="pharmacy-phone-number"]').should('exist');

    cy.injectAxe();
    cy.axeCheck('main');
  });

  it('displays pharmacy contact message when pharmacy phone is not available', () => {
    const site = new MedicationsSite();
    const listPage = new MedicationsListPage();

    site.login(true, false, cernerUser);
    listPage.visitMedicationsListPageURL(unfilledOhRxList);

    // Verify the message is displayed and contains pharmacy/refill guidance
    cy.get('[data-testid="active-unfilled-oh"]')
      .should('be.visible')
      .and('contain', 'pharmacy');

    cy.injectAxe();
    cy.axeCheck('main');
  });

  it('does not display unfilled OH message for prescription that has been dispensed', () => {
    const site = new MedicationsSite();
    const listPage = new MedicationsListPage();

    // Create fixture with dispensed date
    const filledOhRxList = {
      ...unfilledOhRxList,
      data: [
        {
          ...unfilledOhRxList.data[0],
          attributes: {
            ...unfilledOhRxList.data[0].attributes,
            dispensedDate: '2026-03-15T04:00:00.000Z',
            isRefillable: true,
          },
        },
      ],
    };

    site.login(true, false, cernerUser);
    listPage.visitMedicationsListPageURL(filledOhRxList);

    // Verify the unfilled OH message is NOT displayed
    cy.get('[data-testid="active-unfilled-oh"]').should('not.exist');

    // Verify the refill button IS displayed for filled prescription
    cy.get('[data-testid="refill-request-button"]').should('exist');

    cy.injectAxe();
    cy.axeCheck('main');
  });

  it('does not display unfilled OH message for non-Oracle Health facility', () => {
    const site = new MedicationsSite();
    const listPage = new MedicationsListPage();

    // Create fixture with non-OH facility (station number 500 instead of 668)
    const nonOhRxList = {
      ...unfilledOhRxList,
      data: [
        {
          ...unfilledOhRxList.data[0],
          attributes: {
            ...unfilledOhRxList.data[0].attributes,
            stationNumber: '500',
            dispensedDate: '2026-03-10T04:00:00.000Z',
            isRefillable: true,
            refillStatus: 'active',
          },
        },
      ],
    };

    site.login();
    listPage.visitMedicationsListPageURL(nonOhRxList);

    // Verify the unfilled OH message is NOT displayed
    cy.get('[data-testid="active-unfilled-oh"]').should('not.exist');

    // Verify the refill button IS displayed for non-OH facility
    cy.get('[data-testid="refill-request-button"]').should('exist');

    cy.injectAxe();
    cy.axeCheck('main');
  });
});
