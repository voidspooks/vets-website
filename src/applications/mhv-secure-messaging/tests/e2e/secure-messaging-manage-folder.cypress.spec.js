import SecureMessagingSite from './sm_site/SecureMessagingSite';
import PatientInboxPage from './pages/PatientInboxPage';
import FolderManagementPage from './pages/FolderManagementPage';
import createdFolderResponse from './fixtures/customResponse/created-folder-response.json';
import mockFolders from './fixtures/folder-response.json';
import PatientMessageCustomFolderPage from './pages/PatientMessageCustomFolderPage';
import { AXE_CONTEXT, Data } from './utils/constants';
import FolderLoadPage from './pages/FolderLoadPage';

describe('manage custom folders', () => {
  const updatedFolders = {
    ...mockFolders,
    data: [...mockFolders.data, createdFolderResponse.data],
  };

  beforeEach(() => {
    SecureMessagingSite.login();
    PatientInboxPage.loadInboxMessages();
    FolderLoadPage.loadFolders();
  });

  it('verify folder created', () => {
    PatientMessageCustomFolderPage.createCustomFolder(updatedFolders);

    FolderManagementPage.verifyCreateFolderSuccessMessage();
    FolderManagementPage.verifyCreateFolderSuccessMessageHasFocus();
    FolderManagementPage.verifyFolderInList(`eq`);

    cy.injectAxe();
    cy.axeCheck(AXE_CONTEXT);
  });

  it('returns focus to "Create a new folder" button after Cancel is clicked', () => {
    // Use keyboard to expand the create folder form (WCAG SC 2.1.1)
    cy.tabToElement('[data-testid="create-new-folder"]');
    cy.realPress('Enter');

    // Verify the inline form is visible
    cy.findByTestId('create-folder-inline').should('be.visible');

    // Use keyboard to activate Cancel button (WCAG SC 2.1.1)
    cy.tabToElement('[data-testid="cancel-folder-button"]');
    cy.realPress('Enter');

    // Verify form is collapsed and focus returns to trigger button (WCAG SC 2.4.3)
    cy.findByTestId('create-folder-inline').should('not.exist');
    cy.focused().should('have.attr', 'data-testid', 'create-new-folder');

    cy.injectAxe();
    cy.axeCheck(AXE_CONTEXT);
  });

  it(`verify folder deleted`, () => {
    PatientMessageCustomFolderPage.createCustomFolder(updatedFolders);

    PatientMessageCustomFolderPage.loadCustomFolderWithNoMessages();

    cy.findByText(
      'There are no messages in this folder. If this folder is no longer needed, you can remove it.',
    ).should('be.visible');

    FolderManagementPage.clickDeleteFolderButton();

    PatientMessageCustomFolderPage.deleteCustomFolder();
    FolderManagementPage.verifyFolderActionMessage(
      Data.FOLDER_REMOVED_SUCCESSFULLY,
    );
    FolderManagementPage.verifyFolderActionMessageHasFocus();
    FolderManagementPage.verifyFolderInList(`not.eq`);

    cy.injectAxe();
    cy.axeCheck(AXE_CONTEXT);
  });

  it('verify custom folder description in edit section', () => {
    PatientMessageCustomFolderPage.createCustomFolder(updatedFolders);

    // Load the custom folder with no messages
    PatientMessageCustomFolderPage.loadCustomFolderWithNoMessages();

    // Verify the empty folder alert is visible
    cy.findByText(
      'There are no messages in this folder. If this folder is no longer needed, you can remove it.',
    ).should('be.visible');

    // Verify the custom folder description is NOT in the folder header
    cy.findByTestId('folder-description').should('not.exist');

    // Verify the va-additional-info component is visible in the Edit folder section
    cy.findByTestId('custom-folder-info')
      .should('exist')
      .and('have.attr', 'trigger', 'How can I use a custom folder?');

    // Click on the va-additional-info to expand it
    cy.findByTestId('custom-folder-info').click();

    // Verify the expanded content contains the expected text
    cy.findByTestId('custom-folder-info').should(
      'contain',
      'This is a folder you created. You can add conversations to this folder by moving them from your inbox or other folders.',
    );

    // Click again to collapse
    cy.findByTestId('custom-folder-info').click();

    cy.injectAxe();
    cy.axeCheck(AXE_CONTEXT);
  });
});
