import MessagesSignaturePage from '../pages/MessagesSignaturePage';
import mockSignature from '../../fixtures/personal-information-signature.json';
import { Data, Locators } from '../../fixtures/constants';

describe('MESSAGES SIGNATURE ADD', () => {
  beforeEach(() => {
    const updatedFeatureToggles = MessagesSignaturePage.updateFeatureToggles(
      [],
    );
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

    MessagesSignaturePage.load(updatedFeatureToggles, noSignatureResponse);
  });

  it('verify user can cancel adding signature', () => {
    cy.get(Locators.SIGNATURE.EDIT_BTN).click();
    cy.get(Locators.SIGNATURE.NAME_LABEL)
      .should('be.visible')
      .and('contain.text', Data.SIGNATURE.ALERTS.REQUIRED);
    cy.get(Locators.SIGNATURE.TITLE_LABEL)
      .should('be.visible')
      .and('contain.text', Data.SIGNATURE.ALERTS.REQUIRED);

    cy.get(Locators.SIGNATURE.CANCEL_BTN).click();
    cy.get(Locators.SIGNATURE.EDIT_BTN).should('be.focused');

    cy.injectAxeThenAxeCheck();
  });

  it('verify user can add and save signature', () => {
    cy.get(Locators.SIGNATURE.EDIT_BTN).click();
    cy.get(Locators.SIGNATURE.NAME_FIELD)
      .should('be.focused')
      .type('Name');
    cy.get(Locators.SIGNATURE.TITLE_FIELD).type('TestTitle');

    MessagesSignaturePage.saveSignature();

    cy.get(Locators.SIGNATURE.GENERAL).should(
      'contain.text',
      `${mockSignature.data.attributes.signatureName +
        mockSignature.data.attributes.signatureTitle}`,
    );
    MessagesSignaturePage.verifySuccessAlert();

    cy.injectAxeThenAxeCheck();
  });
});
