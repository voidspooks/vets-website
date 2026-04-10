import manifest from '../../../manifest.json';
import { mockChatbotApi, mockFeatureToggles } from './helpers/chatbot-helpers';

describe('VA Virtual Agent Chatbot', () => {
  beforeEach(() => {
    mockFeatureToggles();
  });

  it('renders the chatbot application', () => {
    mockChatbotApi();
    cy.visit(manifest.rootUrl);
    cy.wait('@mockFeatures');

    // Verify the page loads with expected content
    // Update selector as the chatbot component develops
    cy.findByTestId('chatbox-container').should('be.visible');

    // Verify AI disclaimer is visible
    cy.contains(
      'We may use artificial intelligence (AI) for these responses',
    ).should('be.visible');

    cy.injectAxeThenAxeCheck();
  });

  it('submits a message and renders a mocked chatbot response', () => {
    mockChatbotApi();
    cy.visit(manifest.rootUrl);
    cy.wait('@mockFeatures');

    cy.findByTestId('btnAcceptDisclaimer').click();
    cy.wait('@createThread');
    cy.wait('@runThreadInit');

    cy.findByTestId('chat-composer-input').then($input => {
      const inputElement = $input[0];
      inputElement.value = 'How do I get started?';
      inputElement.dispatchEvent(
        new Event('input', { bubbles: true, composed: true }),
      );
    });

    cy.findByTestId('chat-composer-submit').click();

    cy.findByTestId('chat-typing-indicator').should('exist');
    cy.wait('@runThreadUser');
    cy.contains('This is an e2e mocked chatbot response.').should('be.visible');
    cy.findByTestId('chat-typing-indicator').should('not.exist');
    cy.injectAxeThenAxeCheck();
  });

  it('shows two response options and supports selecting a button-pair option', () => {
    mockChatbotApi({
      userResponsesByMessage: {
        'Home Loan COE': {
          body:
            'event: messages/complete\n' +
            'data: [{"id":"faq-1","type":"ai","content":"To request a Certificate of Eligibility (COE) for a home loan, go to the [eBenefits page](https://www.ebenefits.va.gov/ebenefits/about/feature?feature=cert-of-eligibility-home-loan).","additional_kwargs":{}}]\n\n',
          isStream: true,
        },
        coe: {
          body:
            'event: messages/complete\n' +
            'data: [{"id":"disambiguation-1","type":"ai","content":"Select from the following topics, or try rephrasing your question:","additional_kwargs":{"buttons":["Home Loan COE","Education COE"]}}]\n\n',
          isStream: true,
        },
      },
    });

    cy.visit(manifest.rootUrl);
    cy.wait('@mockFeatures');
    cy.findByTestId('btnAcceptDisclaimer').click();
    cy.wait('@createThread');
    cy.wait('@runThreadInit');

    cy.findByTestId('chat-composer-input').then($input => {
      const inputElement = $input[0];
      inputElement.value = 'coe';
      inputElement.dispatchEvent(
        new Event('input', { bubbles: true, composed: true }),
      );
    });

    cy.findByTestId('chat-composer-submit').click();
    cy.wait('@runThreadUser');

    cy.contains(
      'Select from the following topics, or try rephrasing your question:',
    ).should('be.visible');
    cy.get('va-button-pair').should('be.visible');
    cy.selectVaButtonPairPrimary();
    cy.wait('@runThreadUser');
    cy.contains('To request a Certificate of Eligibility (COE)').should(
      'be.visible',
    );
    cy.injectAxeThenAxeCheck();
  });

  it('shows three response options and supports selecting one', () => {
    mockChatbotApi({
      userResponsesByMessage: {
        topic: {
          body:
            'event: messages/complete\n' +
            'data: [{"id":"three-options-1","type":"ai","content":"Choose one of the following topics:","additional_kwargs":{"buttons":["Claims Status","VA Health Care","PACT Act"]}}]\n\n',
          isStream: true,
        },
      },
    });

    cy.visit(manifest.rootUrl);
    cy.wait('@mockFeatures');
    cy.findByTestId('btnAcceptDisclaimer').click();
    cy.wait('@createThread');
    cy.wait('@runThreadInit');

    cy.findByTestId('chat-composer-input').then($input => {
      const inputElement = $input[0];
      inputElement.value = 'topic';
      inputElement.dispatchEvent(
        new Event('input', { bubbles: true, composed: true }),
      );
    });

    cy.findByTestId('chat-composer-submit').click();
    cy.wait('@runThreadUser');

    cy.contains('Choose one of the following topics:').should('be.visible');
    cy.findAllByTestId('chat-message-option').should('have.length', 3);
    cy.contains('button', 'PACT Act').click();
    cy.wait('@runThreadUser');
    cy.contains('This is an e2e mocked chatbot response.').should('be.visible');
    cy.injectAxeThenAxeCheck();
  });
});
