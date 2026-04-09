import manifest from '../../manifest.json';
import SecureMessagingSite from './sm_site/SecureMessagingSite';
import PatientInboxPage from './pages/PatientInboxPage';
import mockFolders from './fixtures/folder-response.json';
import { AXE_CONTEXT } from './utils/constants';

// Derive unread-inbox fixture from the base folder response
const mockFoldersWithUnread = {
  ...mockFolders,
  data: mockFolders.data.map(
    folder =>
      folder.attributes.folderId === 0
        ? {
            ...folder,
            attributes: { ...folder.attributes, unreadCount: 5 },
          }
        : folder,
  ),
};

describe(manifest.appName, () => {
  describe('unread message count in Inbox tab', () => {
    beforeEach(() => {
      SecureMessagingSite.login();
    });

    it('displays unread count next to Inbox when there are unread messages', () => {
      PatientInboxPage.loadInboxMessages(
        undefined,
        undefined,
        undefined,
        200,
        mockFoldersWithUnread,
      );
      cy.get('[data-testid="inbox-inner-nav"]').within(() => {
        cy.contains('a', /Inbox \(5\)/).should('be.visible');
      });
      cy.injectAxeThenAxeCheck(AXE_CONTEXT);
    });

    it('does not display unread count when inbox has no unread messages', () => {
      PatientInboxPage.loadInboxMessages();
      cy.get('[data-testid="inbox-inner-nav"]').within(() => {
        cy.contains('a', 'Inbox').should('be.visible');
        cy.contains('a', /Inbox \(/).should('not.exist');
      });
      cy.injectAxeThenAxeCheck(AXE_CONTEXT);
    });
  });

  describe('draft count on More Folders page', () => {
    beforeEach(() => {
      SecureMessagingSite.login();
    });

    it('displays draft count next to Drafts and no count on other folders', () => {
      PatientInboxPage.loadInboxMessages();
      cy.contains('a', 'More folders').click();
      cy.get('.folders-list').within(() => {
        cy.get('[data-testid="Drafts"]').should('contain', '(32)');
        cy.get('[data-testid="Deleted"]').should('not.contain', '(');
        cy.get('[data-testid="TEST2"]').should('not.contain', '(');
      });
      cy.injectAxeThenAxeCheck(AXE_CONTEXT);
    });
  });
});
