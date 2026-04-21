import MessagesSignaturePage from '../pages/MessagesSignaturePage';
import mockSignature from '../../fixtures/personal-information-signature.json';
import { Data, Locators } from '../../fixtures/constants';

describe('MESSAGES SIGNATURE REMOVE', () => {
  beforeEach(() => {
    const updatedFeatureToggles = MessagesSignaturePage.updateFeatureToggles(
      [],
    );
    MessagesSignaturePage.load(updatedFeatureToggles);
  });

  it('verify remove alert details', () => {
    cy.get(Locators.SIGNATURE.REMOVE_BTN).click();

    cy.get(Locators.SIGNATURE.ALERTS.CROSS_BTN).should('be.focused');
    cy.get(Locators.SIGNATURE.ALERTS.REMOVE_TITLE).should(
      'have.text',
      Data.SIGNATURE.ALERTS.REMOVE,
    );
    cy.get(Locators.SIGNATURE.ALERTS.REMOVE_TEXT).should(
      'have.text',
      Data.SIGNATURE.ALERTS.REMOVE_TEXT,
    );

    cy.get(Locators.SIGNATURE.ALERTS.MODAL)
      .shadow()
      .find('va-button')
      .first()
      .shadow()
      .should('have.text', Data.SIGNATURE.ALERTS.REMOVE_BTN);
    cy.get(Locators.SIGNATURE.ALERTS.MODAL)
      .shadow()
      .find('va-button[secondary]')
      .first()
      .shadow()
      .should('have.text', Data.SIGNATURE.ALERTS.CANCEL_REMOVE_BTN);

    cy.injectAxeThenAxeCheck();
  });

  it('verify user can cancel remove signature', () => {
    cy.get(Locators.SIGNATURE.REMOVE_BTN).click();
    cy.get(Locators.SIGNATURE.ALERTS.MODAL)
      .shadow()
      .find('va-button[secondary]')
      .click();

    cy.get(Locators.SIGNATURE.REMOVE_BTN)
      .shadow()
      .find('button')
      .should('be.focused');

    cy.get(Locators.SIGNATURE.REMOVE_BTN).click();
    cy.get(Locators.SIGNATURE.ALERTS.CROSS_BTN)
      .first()
      .click();

    cy.get(Locators.SIGNATURE.REMOVE_BTN)
      .shadow()
      .find('button')
      .should('be.focused');

    cy.injectAxeThenAxeCheck();
  });

  it('verify user can remove signature', () => {
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

    MessagesSignaturePage.removeSignature(noSignatureResponse);

    MessagesSignaturePage.verifySuccessAlert();
    cy.get(Locators.SIGNATURE.EDIT_BTN).should('be.visible');
    cy.get(Locators.SIGNATURE.GENERAL).should(
      'contain.text',
      Data.SIGNATURE.CHOOSE_EDIT,
    );

    cy.injectAxeThenAxeCheck();
  });
});
