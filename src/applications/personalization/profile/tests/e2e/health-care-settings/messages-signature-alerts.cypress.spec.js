import MessagesSignaturePage from '../pages/MessagesSignaturePage';
import mockSignature from '../../fixtures/personal-information-signature.json';
import { Data, Locators } from '../../fixtures/constants';

describe('MESSAGES SIGNATURE ALERTS', () => {
  it('verify empty fields alerts', () => {
    const updatedFeatureToggles = MessagesSignaturePage.updateFeatureToggles(
      [],
    );

    MessagesSignaturePage.load(updatedFeatureToggles);

    cy.get(Locators.SIGNATURE.EDIT_BTN).click();
    cy.get(Locators.SIGNATURE.NAME_FIELD).clear();
    cy.get(Locators.SIGNATURE.TITLE_FIELD).clear();
    cy.get(Locators.SIGNATURE.SAVE_BTN).click({ waitForAnimations: true });

    cy.get(Locators.SIGNATURE.ALERTS.FIELD_ERROR).each(el => {
      cy.wrap(el).should('have.text', Data.SIGNATURE.ALERTS.EMPTY_FIELD);
    });

    cy.injectAxeThenAxeCheck();
  });
});

describe('MESSAGES SIGNATURE ADD ALERTS', () => {
  beforeEach(() => {
    const noSignatureResponse = {
      ...mockSignature,
      data: {
        ...mockSignature.data,
        attributes: {
          ...mockSignature.data.attributes,
          signatureName: null,
          signatureTitle: null,
        },
      },
    };

    const updatedFeatureToggles = MessagesSignaturePage.updateFeatureToggles(
      [],
    );
    MessagesSignaturePage.load(updatedFeatureToggles, noSignatureResponse);
  });

  it('verify alert modal details', () => {
    cy.get(Locators.SIGNATURE.EDIT_BTN).click();
    cy.get(Locators.SIGNATURE.NAME_FIELD).type('Jack Sparrow');
    cy.get(Locators.SIGNATURE.CANCEL_BTN).click();

    cy.get(Locators.SIGNATURE.ALERTS.CROSS_BTN).should('be.focused');
    cy.get(Locators.SIGNATURE.ALERTS.CONFIRM_CANCEL_MODAL)
      .shadow()
      .find('h2')
      .should('have.text', Data.SIGNATURE.ALERTS.CANCEL_CHANGES);
    cy.get(Locators.SIGNATURE.ALERTS.CONFIRM_CANCEL_MODAL)
      .find('p')
      .should('contain.text', Data.SIGNATURE.ALERTS.CANCEL_ALERT);

    MessagesSignaturePage.getCancelChangesBtn().should(
      'have.text',
      Data.SIGNATURE.ALERTS.CANCEL_BTN,
    );
    MessagesSignaturePage.getBackToEditBtn().should(
      'have.text',
      Data.SIGNATURE.ALERTS.BACK_TO_EDIT_BTN,
    );

    cy.injectAxeThenAxeCheck();
  });

  it('verify user can cancel changes', () => {
    cy.get(Locators.SIGNATURE.EDIT_BTN).click();
    cy.get(Locators.SIGNATURE.NAME_FIELD).type('Jack Sparrow');
    cy.get(Locators.SIGNATURE.CANCEL_BTN).click();

    MessagesSignaturePage.getCancelChangesBtn().click();
    cy.get(Locators.SIGNATURE.EDIT_BTN).should('be.focused');

    cy.get(Locators.SIGNATURE.EDIT_BTN).click();
    cy.get(Locators.SIGNATURE.NAME_FIELD).type('Jack Sparrow');
    cy.get(Locators.SIGNATURE.CANCEL_BTN).click();

    cy.get(Locators.SIGNATURE.ALERTS.CROSS_BTN)
      .first()
      .click();
    cy.get(Locators.SIGNATURE.CANCEL_BTN).should('be.focused');

    cy.injectAxeThenAxeCheck();
  });

  it('verify user can back to editing', () => {
    cy.get(Locators.SIGNATURE.EDIT_BTN).click();
    cy.get(Locators.SIGNATURE.NAME_FIELD).type('Jack Sparrow');
    cy.get(Locators.SIGNATURE.CANCEL_BTN).click();

    MessagesSignaturePage.getBackToEditBtn().click();
    cy.get(Locators.SIGNATURE.CANCEL_BTN).should('be.focused');

    cy.injectAxeThenAxeCheck();
  });
});

describe('MESSAGES SIGNATURE EDIT ALERTS', () => {
  beforeEach(() => {
    const updatedFeatureToggles = MessagesSignaturePage.updateFeatureToggles(
      [],
    );
    MessagesSignaturePage.load(updatedFeatureToggles);
  });

  it('verify alert modal details', () => {
    cy.get(Locators.SIGNATURE.EDIT_BTN).click();
    cy.get(Locators.SIGNATURE.NAME_FIELD).clear();
    cy.get(Locators.SIGNATURE.NAME_FIELD).type('Jack Sparrow');
    cy.get(Locators.SIGNATURE.CANCEL_BTN).click();

    cy.get(Locators.SIGNATURE.ALERTS.CONFIRM_CANCEL_MODAL)
      .shadow()
      .find('h2')
      .should('have.text', Data.SIGNATURE.ALERTS.CANCEL_CHANGES);
    cy.get(Locators.SIGNATURE.ALERTS.CONFIRM_CANCEL_MODAL)
      .find('p')
      .should('contain.text', Data.SIGNATURE.ALERTS.CANCEL_ALERT);
    MessagesSignaturePage.getCancelChangesBtn().should(
      'have.text',
      Data.SIGNATURE.ALERTS.CANCEL_BTN,
    );
    MessagesSignaturePage.getBackToEditBtn().should(
      'have.text',
      Data.SIGNATURE.ALERTS.BACK_TO_EDIT_BTN,
    );

    cy.injectAxeThenAxeCheck();
  });

  it('verify user can cancel changes', () => {
    cy.get(Locators.SIGNATURE.EDIT_BTN).click();
    cy.get(Locators.SIGNATURE.NAME_FIELD).clear();
    cy.get(Locators.SIGNATURE.NAME_FIELD).type('Jack Sparrow');
    cy.get(Locators.SIGNATURE.CANCEL_BTN).click();

    MessagesSignaturePage.getCancelChangesBtn().click();
    cy.get(Locators.SIGNATURE.EDIT_BTN).should('be.focused');

    cy.get(Locators.SIGNATURE.EDIT_BTN).click();
    cy.get(Locators.SIGNATURE.NAME_FIELD).clear();
    cy.get(Locators.SIGNATURE.NAME_FIELD).type('Jack Sparrow');
    cy.get(Locators.SIGNATURE.CANCEL_BTN).click();

    cy.get(Locators.SIGNATURE.ALERTS.CROSS_BTN)
      .first()
      .click();
    cy.get(Locators.SIGNATURE.CANCEL_BTN).should('be.focused');

    cy.injectAxeThenAxeCheck();
  });

  it('verify user can back to editing', () => {
    cy.get(Locators.SIGNATURE.EDIT_BTN).click();
    cy.get(Locators.SIGNATURE.NAME_FIELD).type('Jack Sparrow');
    cy.get(Locators.SIGNATURE.CANCEL_BTN).click();

    MessagesSignaturePage.getBackToEditBtn().click();
    cy.get(Locators.SIGNATURE.CANCEL_BTN).should('be.focused');

    cy.injectAxeThenAxeCheck();
  });
});
