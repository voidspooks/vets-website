import PageObject from '../../page-objects/PageObject';

export class ProviderSelectionPageObject extends PageObject {
  /**
   * Validates that we're on the Provider Selection page
   */
  validate() {
    cy.findByRole('heading', {
      level: 1,
      name: 'Which provider do you want to schedule with?',
    }).should('exist');

    return this;
  }

  /**
   * Validates that provider cards are displayed
   * @param {number} count - Expected number of visible provider cards
   */
  assertProviderCards(count = 5) {
    cy.findAllByTestId('provider-selection-card').should('have.length', count);
    return this;
  }

  /**
   * Validates that the show more button exists with the correct text
   * @param {number} remainingCount - Expected number of remaining providers
   */
  assertShowMoreButton(remainingCount) {
    cy.findByTestId('show-more-providers-button')
      .should('exist')
      .shadow()
      .find('button')
      .should('contain.text', `Show ${remainingCount} more providers`);
    return this;
  }

  /**
   * Validates that the show more button is not visible
   */
  assertNoShowMoreButton() {
    cy.findByTestId('show-more-providers-button').should('not.exist');
    return this;
  }

  /**
   * Clicks the show more providers button
   */
  clickShowMore() {
    cy.findByTestId('show-more-providers-button')
      .shadow()
      .find('button')
      .click();
    return this;
  }

  /**
   * Validates that an API error message is displayed
   */
  assertApiError() {
    cy.findByTestId('error').should('exist');
    return this;
  }

  /**
   * Validates the "different provider" section is displayed
   */
  assertDifferentProviderSection() {
    cy.findByTestId('different-provider-section').should('exist');
    return this;
  }

  /**
   * Clicks on a provider's "Review available appointments" link by index
   * @param {number} index - Index of the provider link to click
   */
  clickProviderLink(index = 0) {
    cy.findAllByTestId('provider-selection-card')
      .eq(index)
      .find('va-link')
      .click();
    return this;
  }

  /**
   * Validates the URL for the page
   */
  _validateUrl() {
    cy.url().should('include', '/provider-selection');
    return this;
  }

  /**
   * Validates the header for the page
   */
  _validateHeader() {
    cy.findByRole('heading', {
      level: 1,
      name: 'Which provider do you want to schedule with?',
    }).should('exist');
    return this;
  }
}

export default new ProviderSelectionPageObject();
