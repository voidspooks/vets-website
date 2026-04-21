import MessagesSignaturePage from '../pages/MessagesSignaturePage';
import mockSignature from '../../fixtures/personal-information-signature.json';
import { Data, Locators } from '../../fixtures/constants';

const updatedSignatureResponse = {
  ...mockSignature,
  data: {
    ...mockSignature.data,
    attributes: {
      ...mockSignature.data.attributes,
      signatureName: 'Jack Sparrow',
      signatureTitle: 'Captain',
    },
  },
};

describe('MESSAGES SIGNATURE EDIT', () => {
  beforeEach(() => {
    const updatedFeatureToggles = MessagesSignaturePage.updateFeatureToggles(
      [],
    );
    MessagesSignaturePage.load(updatedFeatureToggles);
  });

  it('verify user can cancel editing signature', () => {
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

  it('verify user can edit and save signature', () => {
    cy.get(Locators.SIGNATURE.EDIT_BTN).click();
    cy.get(Locators.SIGNATURE.NAME_FIELD).should('be.focused');
    cy.get(Locators.SIGNATURE.NAME_FIELD).clear();
    cy.get(Locators.SIGNATURE.NAME_FIELD).type('Jack Sparrow');
    cy.get(Locators.SIGNATURE.TITLE_FIELD).clear();
    cy.get(Locators.SIGNATURE.TITLE_FIELD).type('Captain');

    MessagesSignaturePage.saveSignature(updatedSignatureResponse);

    cy.get(Locators.SIGNATURE.GENERAL).should(
      'contain.text',
      `${updatedSignatureResponse.data.attributes.signatureName +
        updatedSignatureResponse.data.attributes.signatureTitle}`,
    );
    MessagesSignaturePage.verifySuccessAlert();

    cy.injectAxeThenAxeCheck();
  });
});
