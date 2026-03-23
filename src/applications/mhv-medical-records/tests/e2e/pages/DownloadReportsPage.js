class DownloadReportsPage {
  goToReportsPage = () => {
    cy.visit('my-health/medical-records/download');
  };

  goToDownloadAllPage = () => {
    cy.get('[data-testid="go-to-download-all"]').click();
  };

  clickCcdAccordionItem = () => {
    // Use shadow DOM to access internal button - pattern from Travel Pay and Platform expandAccordions
    // This avoids web component lifecycle issues by clicking the actual button inside the shadow DOM
    // Using { force: true } because the button can be covered by the headline element in the shadow DOM
    cy.get('[data-testid="ccdAccordionItem"]', { timeout: 15000 })
      .shadow()
      .find('button[aria-controls="content"]')
      .click({ force: true, waitForAnimations: true });

    // Verify accordion opened successfully
    cy.contains('Continuity of Care Document', { timeout: 10000 }).should(
      'be.visible',
    );
  };

  clickSelfEnteredAccordionItem = () => {
    cy.get('[data-testid="selfEnteredAccordionItem"]').click();
  };

  verifyCcdDownloadXmlFileButton = () => {
    cy.get('[data-testid="generateCcdButtonXmlVistA"]').should('be.visible');
  };

  clickCcdDownloadXmlFileButton = (
    ccdGenerateResponse,
    pathToCcdDownloadResponse,
  ) => {
    cy.fixture(pathToCcdDownloadResponse, 'utf8').then(xmlBody => {
      cy.intercept(
        'GET',
        '/my_health/v1/medical_records/ccd/generate',
        ccdGenerateResponse,
      ).as('ccdGenerateResponse');
      cy.intercept('GET', '/my_health/v1/medical_records/ccd/d**', {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xmlBody,
      }).as('getXml');
      // Use shadow DOM to access the anchor inside the va-link web component
      cy.get('[data-testid="generateCcdButtonXmlVistA"]')
        .shadow()
        .find('a')
        .click({ force: true });
      cy.wait('@ccdGenerateResponse');
      cy.wait('@getXml');
    });
  };

  clickCcdDownloadXmlFileButtonWithoutDownloadIntercept = ccdGenerateResponse => {
    cy.intercept(
      'GET',
      '/my_health/v1/medical_records/ccd/generate',
      ccdGenerateResponse,
    ).as('ccdGenerateResponse');
    // Use shadow DOM to access the anchor inside the va-link web component
    cy.get('[data-testid="generateCcdButtonXmlVistA"]')
      .shadow()
      .find('a')
      .click({ force: true });
    cy.wait('@ccdGenerateResponse');
  };

  verifyCcdDownloadStartedAlert = () => {
    cy.get('[data-testid="alert-download-started"]')
      .should('be.focused')
      .and('contain', 'Continuity of Care Document download started');
  };

  /**
   * Verifies the unified CCD loading spinner is shown.
   * Used by VistaAndOHContent (both-sources and OH-only users)
   * where a single spinner replaces all download sections.
   */
  verifyUnifiedCcdSpinner = () => {
    cy.get('[data-testid="generating-ccd-indicator"]').should('exist');
  };

  verifySelfEnteredDownloadButton = () => {
    cy.get('[data-testid="downloadSelfEnteredButton"]').should('be.visible');
  };

  updateDateGenerated = arr => {
    const newDate = new Date();
    return arr.map(item => {
      const newDateGenerated = new Date(newDate);
      newDateGenerated.setDate(newDate.getDate());
      return {
        ...item,
        dateGenerated: newDateGenerated.toISOString(),
      };
    });
  };

  verifyCcdExpiredError = () => {
    cy.get('[data-testid="expired-alert-message"]')
      .should('be.visible')
      .and(
        'contain',
        "We can't download your continuity of care document right now",
      );
  };

  clickDownloadSelfEnteredButton = selfEnteredResponse => {
    cy.intercept(
      'GET',
      '/my_health/v1/medical_records/self_entered',
      selfEnteredResponse,
    ).as('getSelfEnteredRecords');
    cy.get('[data-testid="downloadSelfEnteredButton"]').click();
  };

  verifySelfEnteredDownloadStartedAlert = () => {
    cy.get('[data-testid="download-success-alert-message"]').should(
      'contain',
      'Self-entered health information report download started',
    );
  };

  /**
   * Sets up all three intercepts for the V2 CCD download flow,
   * simulating real polling by matching on specific IDs:
   *
   * 1. generate → returns jobId ("test-job-id-12345") with taskId null
   * 2. status/test-job-id-12345 → NOT_READY, returns taskId "12345"
   *    (app switches pollId to the taskId)
   * 3. status/12345 → READY for all formats
   * 4. download/12345.{format} → returns the document body
   */
  interceptCcdV2Flow = ({
    format,
    contentType,
    body,
    authoredOn = new Date().toISOString(),
    generateFixture = './applications/mhv-medical-records/tests/e2e/fixtures/ccd-generate-response-v2.json',
    statusNotReadyFixture = './applications/mhv-medical-records/tests/e2e/fixtures/ccd-status-not-ready-v2.json',
    statusReadyFixture = './applications/mhv-medical-records/tests/e2e/fixtures/ccd-status-ready-v2.json',
  }) => {
    // Step 1: Intercept generate endpoint
    cy.fixture(generateFixture).then(generateBody => {
      cy.intercept(
        'GET',
        '/my_health/v2/medical_records/ccd/generate',
        generateBody,
      ).as('generateCcdV2');

      // const jobId = generateBody.data.attributes.jobId;

      // Step 2a: First status poll uses the jobId from generate → NOT_READY.
      // The response includes a taskId, causing the app to switch its pollId.
      cy.fixture(statusNotReadyFixture).then(notReadyBody => {
        cy.intercept(
          'GET',
          `/my_health/v2/medical_records/ccd/status/test-job-id-12345`,
          notReadyBody,
        ).as('statusCcdV2NotReady');
      });

      // Step 2b: Second status poll uses the taskId from the NOT_READY response → READY.
      cy.fixture(statusReadyFixture).then(readyBody => {
        // Override authoredOn so the client-side cache freshness check
        // (Date.now() − authoredOn < 10 min) passes. Callers can supply
        // a fixed mock date for determinism; defaults to now.
        const patchedBody = {
          ...readyBody,
          data: {
            ...readyBody.data,
            attributes: {
              ...readyBody.data.attributes,
              authoredOn,
            },
          },
        };

        cy.intercept(
          'GET',
          `/my_health/v2/medical_records/ccd/status/12345`,
          patchedBody,
        ).as('statusCcdV2Ready');

        // Step 3: Download endpoint uses the taskId (final pollId returned to caller)
        cy.intercept(
          'GET',
          `/my_health/v2/medical_records/ccd/download/12345.${format}`,
          {
            statusCode: 200,
            headers: { 'Content-Type': contentType },
            body,
          },
        ).as('downloadCcdV2');
      });
    });
  };

  clickCcdDownloadXmlButtonV2 = (pathToFixture, { authoredOn } = {}) => {
    cy.fixture(pathToFixture, 'utf8').then(xmlBody => {
      this.interceptCcdV2Flow({
        format: 'xml',
        contentType: 'application/xml',
        body: xmlBody,
        ...(authoredOn && { authoredOn }),
      });

      // Use shadow DOM to access the link inside the web component
      // Using { force: true } to bypass visibility checks - web component links can have 0x0 dimensions during hydration
      cy.get('[data-testid="generateCcdButtonXmlOH"]', { timeout: 15000 })
        .shadow()
        .find('a')
        .click({ force: true });

      cy.wait('@generateCcdV2', { timeout: 15000 });
      // Wait for both polling calls: NOT_READY (jobId), then READY (taskId)
      cy.wait('@statusCcdV2NotReady', { timeout: 15000 });
      cy.wait('@statusCcdV2Ready', { timeout: 15000 });
      cy.wait('@downloadCcdV2', { timeout: 15000 });
    });
  };

  clickCcdDownloadHtmlButtonV2 = (pathToFixture, { authoredOn } = {}) => {
    cy.fixture(pathToFixture, 'utf8').then(htmlBody => {
      this.interceptCcdV2Flow({
        format: 'html',
        contentType: 'text/html',
        body: htmlBody,
        ...(authoredOn && { authoredOn }),
      });

      // Use shadow DOM to access the link inside the web component
      // Using { force: true } to bypass visibility checks - web component links can have 0x0 dimensions during hydration
      cy.get('[data-testid="generateCcdButtonHtmlOH"]', { timeout: 15000 })
        .shadow()
        .find('a')
        .click({ force: true });

      cy.wait('@generateCcdV2', { timeout: 15000 });
      // Wait for both polling calls: NOT_READY (jobId), then READY (taskId)
      cy.wait('@statusCcdV2NotReady', { timeout: 15000 });
      cy.wait('@statusCcdV2Ready', { timeout: 15000 });
      cy.wait('@downloadCcdV2', { timeout: 15000 });
    });
  };

  clickCcdDownloadPdfButtonV2 = ({ authoredOn } = {}) => {
    const pdfMock = '%PDF-1.4\n%mock pdf content\n%%EOF';

    this.interceptCcdV2Flow({
      format: 'pdf',
      contentType: 'application/pdf',
      body: pdfMock,
      ...(authoredOn && { authoredOn }),
    });

    // Use shadow DOM to access the link inside the web component
    // Using { force: true } to bypass visibility checks - web component links can have 0x0 dimensions during hydration
    cy.get('[data-testid="generateCcdButtonPdfOH"]', { timeout: 15000 })
      .shadow()
      .find('a')
      .click({ force: true });

    cy.wait('@generateCcdV2', { timeout: 15000 });
    // Wait for both polling calls: NOT_READY (jobId), then READY (taskId)
    cy.wait('@statusCcdV2NotReady', { timeout: 15000 });
    cy.wait('@statusCcdV2Ready', { timeout: 15000 });
    cy.wait('@downloadCcdV2', { timeout: 15000 });
  };

  verifyDualAccordionVisible = () => {
    // Verify both VistA and OH download sections exist by checking for their download buttons
    // Using .should('exist') instead of .should('be.visible') because web components can have 0x0 dimensions
    cy.get('[data-testid="generateCcdButtonXmlVistA"]', {
      timeout: 15000,
    }).should('exist');
    cy.get('[data-testid="generateCcdButtonXmlOH"]', {
      timeout: 15000,
    }).should('exist');

    // Verify facility-specific headings are present for dual CCD (hybrid users only)
    // These are bold <p> tags, not semantic headings
    cy.contains('p', 'Download your CCD for these facilities', {
      timeout: 10000,
    }).should('exist');
  };

  verifyVistaDownloadLinksVisible = () => {
    // Using .should('exist') instead of .should('be.visible') because web components can have 0x0 dimensions
    cy.get('[data-testid="generateCcdButtonXmlVistA"]', {
      timeout: 15000,
    }).should('exist');
    cy.get('[data-testid="generateCcdButtonPdfVistA"]', {
      timeout: 15000,
    }).should('exist');
    cy.get('[data-testid="generateCcdButtonHtmlVistA"]', {
      timeout: 15000,
    }).should('exist');
  };

  verifyOHDownloadLinksVisible = () => {
    // Using .should('exist') instead of .should('be.visible') because web components can have 0x0 dimensions
    cy.get('[data-testid="generateCcdButtonXmlOH"]', {
      timeout: 15000,
    }).should('exist');
    cy.get('[data-testid="generateCcdButtonPdfOH"]', {
      timeout: 15000,
    }).should('exist');
    cy.get('[data-testid="generateCcdButtonHtmlOH"]', {
      timeout: 15000,
    }).should('exist');
  };

  clickCcdDownloadXmlButtonVista = pathToFixture => {
    cy.fixture(pathToFixture, 'utf8').then(xmlBody => {
      cy.intercept('GET', '/my_health/v1/medical_records/ccd/generate', {
        statusCode: 200,
        body: { status: 'OK' },
      }).as('ccdGenerateResponse');
      cy.intercept('GET', '/my_health/v1/medical_records/ccd/d**', {
        statusCode: 200,
        headers: { 'Content-Type': 'application/xml' },
        body: xmlBody,
      }).as('downloadCcdVistaXml');

      cy.get('[data-testid="generateCcdButtonXmlVistA"]', { timeout: 15000 })
        .shadow()
        .find('a')
        .click({ force: true });

      cy.wait('@ccdGenerateResponse', { timeout: 15000 });
      cy.wait('@downloadCcdVistaXml', { timeout: 15000 });
    });
  };

  clickCcdDownloadPdfButtonVista = () => {
    const pdfMock = '%PDF-1.4\n%mock pdf content\n%%EOF';

    cy.intercept('GET', '/my_health/v1/medical_records/ccd/generate', {
      statusCode: 200,
      body: { status: 'OK' },
    }).as('ccdGenerateResponse');
    cy.intercept('GET', '/my_health/v1/medical_records/ccd/d**.pdf', {
      statusCode: 200,
      headers: { 'Content-Type': 'application/pdf' },
      body: pdfMock,
    }).as('downloadCcdVistaPdf');

    cy.get('[data-testid="generateCcdButtonPdfVistA"]', { timeout: 15000 })
      .shadow()
      .find('a')
      .click({ force: true });

    cy.wait('@ccdGenerateResponse', { timeout: 15000 });
    cy.wait('@downloadCcdVistaPdf', { timeout: 15000 });
  };

  clickCcdDownloadHtmlButtonVista = pathToFixture => {
    cy.fixture(pathToFixture, 'utf8').then(htmlBody => {
      cy.intercept('GET', '/my_health/v1/medical_records/ccd/generate', {
        statusCode: 200,
        body: { status: 'OK' },
      }).as('ccdGenerateResponse');
      cy.intercept('GET', '/my_health/v1/medical_records/ccd/d**.html', {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: htmlBody,
      }).as('downloadCcdVistaHtml');

      cy.get('[data-testid="generateCcdButtonHtmlVistA"]', { timeout: 15000 })
        .shadow()
        .find('a')
        .click({ force: true });

      cy.wait('@ccdGenerateResponse', { timeout: 15000 });
      cy.wait('@downloadCcdVistaHtml', { timeout: 15000 });
    });
  };
}
export default new DownloadReportsPage();
