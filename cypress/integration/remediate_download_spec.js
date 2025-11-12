// Cypress e2e stub for Remediate & Download flow
// This is a test scaffold; adapt selectors to match the app and run with your Cypress setup.

describe('Remediate & Download flow', () => {
  it('shows post-download banner and opens unblock modal', () => {
    // Visit the dashboard page (adjust path if needed)
    cy.visit('/');

    // TODO: stub /api/upload-document response to return remediation with documentProtected=true
    // TODO: stub /api/download-document to return a blob

    // Upload file (adjust selector)
    const fileName = 'Protected.docx';
    cy.get('input[type=file]').attachFile(fileName);
    cy.contains('Process').click();

    // Wait for analysis and assert banner appears
    cy.contains('This file was protected when analyzed').should('be.visible');

    // Click show unblock steps
    cy.contains('Show unblock steps').click();

    // Modal should appear
    cy.contains('Downloaded file opens in Protected View?').should('be.visible');

    // Copy command
    cy.contains('Copy command').click();
    // Can't reliably assert clipboard in all browsers; ensure button state changes
    cy.contains('Copied').should('exist');
  });
});
