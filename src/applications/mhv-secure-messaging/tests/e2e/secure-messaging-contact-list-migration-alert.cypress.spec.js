import SecureMessagingSite from './sm_site/SecureMessagingSite';
import ContactListPage from './pages/ContactListPage';
import { AXE_CONTEXT, Alerts, Locators, Paths } from './utils/constants';
import { Alerts as AppAlerts } from '../../util/constants';
import mockUser from './fixtures/userResponse/user.json';

// Base migration date used in createMigratingUser fixture (ISO format for reliable parsing)
const MIGRATION_DATE_STRING = '2026-02-13';

/**
 * Computes a date offset from the migration date, formatted for display.
 * @param {number} days - Number of days to offset (negative for before, positive for after)
 * @returns {string} Formatted date string (e.g., "February 7, 2026")
 */
const computeMigrationDate = days => {
  const date = new Date(MIGRATION_DATE_STRING);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// IPE API constants for the ContactListMigrationAlert tooltip
const TOOLTIP_ID = 'test-tooltip-id-contact-list-migration';
const TOOLTIP_NAME =
  AppAlerts.Message.CONTACT_LIST_MIGRATION_ALERT_TOOLTIP_NAME;

/**
 * Creates a mock GET /tooltips response for the ContactListMigrationAlert tooltip.
 * @param {boolean} hidden - Whether the tooltip has been dismissed
 * @returns {Array} Mock tooltips list response
 */
const mockTooltipResponse = (hidden = false) => [
  {
    id: TOOLTIP_ID,
    tooltipName: TOOLTIP_NAME,
    hidden,
    counter: 0,
  },
];

/**
 * Sets up IPE API intercepts required for the ContactListMigrationAlert component.
 * Must be called before cy.visit() so intercepts are in place when the component mounts.
 *
 * @param {boolean} hidden - Whether the tooltip should appear as already dismissed
 */
const setupIpeIntercepts = (hidden = false) => {
  cy.intercept('GET', Paths.INTERCEPT.TOOLTIPS, mockTooltipResponse(hidden)).as(
    'getTooltips',
  );

  cy.intercept('PATCH', Paths.INTERCEPT.TOOLTIPS_BY_ID, req => {
    if (req.url.includes('increment_counter=true')) {
      req.alias = 'patchTooltipIncrement';
    } else {
      req.alias = 'patchTooltipDismiss';
    }
    req.reply({});
  });
};

/**
 * Helper to create a migrating-user fixture from the base user fixture.
 * Adds OH migration schedule data with the specified phase, avoiding the
 * need for a separate full-response fixture file.
 *
 * @param {string} phase - The current migration phase (e.g. 'p6')
 * @param {Array} facilities - Array of { facilityId, facilityName } objects
 * @returns {Object} Modified user fixture with migration data
 */
const createMigratingUser = (
  phase = 'p6',
  facilities = [
    { facilityId: '553', facilityName: 'VA Detroit Healthcare System' },
    { facilityId: '655', facilityName: 'VA Saginaw Healthcare System' },
  ],
) => {
  const migrationSchedule = {
    migrationDate: MIGRATION_DATE_STRING,
    facilities,
    migrationStatus: 'ACTIVE',
    phases: {
      current: phase,
      p0: 'December 15, 2025 at 12:00AM ET',
      p1: 'December 30, 2025 at 12:00AM ET',
      p2: 'January 14, 2026 at 12:00AM ET',
      p3: 'February 7, 2026 at 12:00AM ET',
      p4: 'February 10, 2026 at 12:00AM ET',
      p5: 'February 13, 2026 at 12:00AM ET',
      p6: 'February 15, 2026 at 12:00AM ET',
      p7: 'February 20, 2026 at 12:00AM ET',
      p8: 'March 15, 2026 at 12:00AM ET',
      p9: 'March 30, 2026 at 12:00AM ET',
    },
  };

  return {
    ...mockUser,
    data: {
      ...mockUser.data,
      attributes: {
        ...mockUser.data.attributes,
        profile: {
          ...mockUser.data.attributes.profile,
          userFacilityMigratingToOh: true,
          migrationSchedules: [migrationSchedule],
        },
        vaProfile: {
          ...mockUser.data.attributes.vaProfile,
          facilities: facilities.map(f => ({
            facilityId: f.facilityId,
            isCerner: false,
          })),
          ohMigrationInfo: {
            userAtPretransitionedOhFacility: false,
            userFacilityReadyForInfoAlert: false,
            userFacilityMigratingToOh: true,
            migrationSchedules: [migrationSchedule],
          },
        },
      },
    },
  };
};

/**
 * E2E Test: Contact List Migration Alert (Issue #132291)
 *
 * Purpose:
 * Test that the Contact List page displays the appropriate migration alert for users
 * whose facilities are migrating to or have completed Oracle Health migration.
 *
 * Test Scenarios:
 * 1. User with facility in phases p1-p5 → P1_TO_P5_MIGRATION alert displayed
 * 2. User with facility in phase p6-p8 → POST_MIGRATION alert displayed
 * 3. User in phase p0 (before migration) → No alert displayed
 * 4. User without migration schedules → No alert displayed
 * 5. Alert is closeable and calls IPE API to persist dismissal
 * 6. Alert does not reappear when IPE returns hidden: true (persistent dismissal)
 * 7. First visit creates a new tooltip record via IPE API
 * 8. Accessibility check
 */

describe('SM Contact List Migration Alert', () => {
  const ALERT_TESTID = Locators.ALERTS.CONTACT_LIST_MIGRATION;

  describe('P1_TO_P5_MIGRATION variant (phases p1-p5)', () => {
    const {
      HEADLINE: P1_TO_P5_HEADLINE,
      BODY_TOP: P1_TO_P5_BODY_TOP,
      BODY_BOTTOM: P1_TO_P5_BODY_BOTTOM,
    } = Alerts.CONTACT_LIST_MIGRATION.P1_TO_P5_MIGRATION;

    const testFacilities = [
      { facilityId: '553', facilityName: 'VA Detroit Healthcare System' },
      { facilityId: '655', facilityName: 'VA Saginaw Healthcare System' },
    ];

    ['p1', 'p2', 'p3', 'p4', 'p5'].forEach(phase => {
      describe(`Phase ${phase}`, () => {
        beforeEach(() => {
          setupIpeIntercepts();
          SecureMessagingSite.login(
            undefined,
            undefined,
            true,
            createMigratingUser(phase, testFacilities),
          );
          ContactListPage.loadContactList();
        });

        it(`displays the P1_TO_P5_MIGRATION alert during phase ${phase}`, () => {
          cy.findByTestId(ALERT_TESTID).should('exist');
          cy.findByText(P1_TO_P5_HEADLINE).should('be.visible');
          cy.injectAxe();
          cy.axeCheck(AXE_CONTEXT);
        });

        it('displays the correct headline', () => {
          cy.findByTestId(ALERT_TESTID).within(() => {
            cy.findByText(P1_TO_P5_HEADLINE).should('exist');
          });
          cy.injectAxe();
          cy.axeCheck(AXE_CONTEXT);
        });

        it('displays the bodyTop text with T-6 date reference', () => {
          cy.findByTestId(ALERT_TESTID).within(() => {
            cy.contains(P1_TO_P5_BODY_TOP).should('exist');
            // Assert the computed T-6 date is displayed
            cy.contains(computeMigrationDate(-6)).should('exist');
          });
          cy.injectAxe();
          cy.axeCheck(AXE_CONTEXT);
        });

        it('displays the bodyBottom text', () => {
          cy.findByTestId(ALERT_TESTID).within(() => {
            cy.contains(P1_TO_P5_BODY_BOTTOM).should('exist');
            // Assert the computed T+2 date is displayed
            cy.contains(computeMigrationDate(2)).should('exist');
          });
          cy.injectAxe();
          cy.axeCheck(AXE_CONTEXT);
        });

        it('displays migrating facility names', () => {
          cy.findByTestId(ALERT_TESTID).within(() => {
            cy.findByText('VA Detroit Healthcare System').should('exist');
            cy.findByText('VA Saginaw Healthcare System').should('exist');
          });
          cy.injectAxe();
          cy.axeCheck(AXE_CONTEXT);
        });

        it('displays the note about care team names being different', () => {
          cy.findByTestId(ALERT_TESTID).within(() => {
            cy.contains('Note:').should('exist');
            cy.contains('the care team names will be different').should(
              'exist',
            );
          });
          cy.injectAxe();
          cy.axeCheck(AXE_CONTEXT);
        });
      });
    });

    it('is closeable and calls the IPE API to persist dismissal', () => {
      setupIpeIntercepts();
      SecureMessagingSite.login(
        undefined,
        undefined,
        true,
        createMigratingUser('p3', testFacilities),
      );
      ContactListPage.loadContactList();

      cy.injectAxe();
      cy.findByTestId(ALERT_TESTID).should('exist');
      cy.axeCheck(AXE_CONTEXT);

      // Close the alert via the VA web component close button
      cy.findByTestId(ALERT_TESTID)
        .shadow()
        .find('button.va-alert-close')
        .click({ force: true });

      // Confirm the IPE API was called to persist the dismissal
      cy.wait('@patchTooltipDismiss');
      cy.findByTestId(ALERT_TESTID).should('not.exist');
    });
  });

  describe('Phase p0 (pre-migration: T-60)', () => {
    beforeEach(() => {
      setupIpeIntercepts();
      SecureMessagingSite.login(
        undefined,
        undefined,
        true,
        createMigratingUser('p0'),
      );
      ContactListPage.loadContactList();
    });

    it('does NOT display any migration alert during phase p0', () => {
      cy.findByTestId(ALERT_TESTID).should('not.exist');
      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });
  });

  describe('POST_MIGRATION variant (phases p6-p8)', () => {
    const {
      HEADLINE: POST_MIGRATION_HEADLINE,
      BODY_TOP: POST_MIGRATION_BODY_TOP,
      BODY_BOTTOM: POST_MIGRATION_BODY_BOTTOM,
    } = Alerts.CONTACT_LIST_MIGRATION.POST_MIGRATION;

    const testFacilities = [
      { facilityId: '553', facilityName: 'VA Detroit Healthcare System' },
      { facilityId: '655', facilityName: 'VA Saginaw Healthcare System' },
    ];

    ['p6', 'p7', 'p8'].forEach(phase => {
      describe(`Phase ${phase}`, () => {
        beforeEach(() => {
          setupIpeIntercepts();
          SecureMessagingSite.login(
            undefined,
            undefined,
            true,
            createMigratingUser(phase, testFacilities),
          );
          ContactListPage.loadContactList();
        });

        it(`displays the POST_MIGRATION alert during phase ${phase}`, () => {
          cy.findByTestId(ALERT_TESTID).should('exist');
          cy.findByText(POST_MIGRATION_HEADLINE).should('be.visible');
          cy.injectAxe();
          cy.axeCheck(AXE_CONTEXT);
        });

        it('displays the correct headline', () => {
          cy.findByTestId(ALERT_TESTID).within(() => {
            cy.findByText(POST_MIGRATION_HEADLINE).should('exist');
          });
          cy.injectAxe();
          cy.axeCheck(AXE_CONTEXT);
        });

        it('displays the bodyTop text', () => {
          cy.findByTestId(ALERT_TESTID).within(() => {
            cy.contains(POST_MIGRATION_BODY_TOP).should('exist');
          });
          cy.injectAxe();
          cy.axeCheck(AXE_CONTEXT);
        });

        it('displays the bodyBottom text', () => {
          cy.findByTestId(ALERT_TESTID).within(() => {
            cy.contains(POST_MIGRATION_BODY_BOTTOM).should('exist');
          });
          cy.injectAxe();
          cy.axeCheck(AXE_CONTEXT);
        });
      });
    });

    it('displays migrating facility names', () => {
      setupIpeIntercepts();
      SecureMessagingSite.login(
        undefined,
        undefined,
        true,
        createMigratingUser('p6', testFacilities),
      );
      ContactListPage.loadContactList();

      cy.findByTestId(ALERT_TESTID).within(() => {
        cy.findByText('VA Detroit Healthcare System').should('exist');
        cy.findByText('VA Saginaw Healthcare System').should('exist');
      });
      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });

    it('displays the reassurance message', () => {
      setupIpeIntercepts();
      SecureMessagingSite.login(
        undefined,
        undefined,
        true,
        createMigratingUser('p6', testFacilities),
      );
      ContactListPage.loadContactList();

      cy.findByTestId(ALERT_TESTID).within(() => {
        cy.contains(
          'You can still send messages to care teams at these facilities',
        ).should('exist');
        cy.contains('the care team names will be different').should('exist');
      });
      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });

    it('is closeable and calls the IPE API to persist dismissal', () => {
      setupIpeIntercepts();
      SecureMessagingSite.login(
        undefined,
        undefined,
        true,
        createMigratingUser('p6', testFacilities),
      );
      ContactListPage.loadContactList();

      cy.injectAxe();
      cy.findByTestId(ALERT_TESTID).should('exist');
      cy.axeCheck(AXE_CONTEXT);

      // Close the alert via the VA web component close button
      cy.findByTestId(ALERT_TESTID)
        .shadow()
        .find('button.va-alert-close')
        .click({ force: true });

      // Confirm the IPE API was called to persist the dismissal
      cy.wait('@patchTooltipDismiss');
      cy.findByTestId(ALERT_TESTID).should('not.exist');
    });
  });

  describe('User without migration schedules', () => {
    beforeEach(() => {
      setupIpeIntercepts();
      SecureMessagingSite.login(undefined, undefined, true, mockUser);
      ContactListPage.loadContactList();
    });

    it('does NOT display the contact list migration alert', () => {
      cy.findByTestId(ALERT_TESTID).should('not.exist');
      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });

    it('passes accessibility check', () => {
      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });
  });

  describe('Persistent dismissal (IPE integration)', () => {
    it('does not display the alert when the tooltip is already dismissed (hidden: true)', () => {
      // Simulate returning to the page after a prior dismissal
      setupIpeIntercepts(true);
      SecureMessagingSite.login(
        undefined,
        undefined,
        true,
        createMigratingUser('p6'),
      );
      ContactListPage.loadContactList();

      cy.wait('@getTooltips');
      cy.findByTestId(ALERT_TESTID).should('not.exist');
      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });

    it('calls the IPE PATCH endpoint to persist dismissal when closed', () => {
      setupIpeIntercepts();
      SecureMessagingSite.login(
        undefined,
        undefined,
        true,
        createMigratingUser('p6'),
      );
      ContactListPage.loadContactList();

      cy.findByTestId(ALERT_TESTID).should('exist');

      cy.findByTestId(ALERT_TESTID)
        .shadow()
        .find('button.va-alert-close')
        .click({ force: true });

      // The PATCH to /my_health/v1/tooltips/:id must be called to persist dismissal
      cy.wait('@patchTooltipDismiss');
      cy.findByTestId(ALERT_TESTID).should('not.exist');

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });
  });

  describe('First visit (no existing tooltip)', () => {
    it('creates a new tooltip via the IPE API and displays the alert', () => {
      // Empty list = no prior tooltip record for this user
      cy.intercept('GET', Paths.INTERCEPT.TOOLTIPS, []).as('getTooltips');
      cy.intercept('POST', Paths.INTERCEPT.TOOLTIPS, {
        id: TOOLTIP_ID,
        tooltipName: TOOLTIP_NAME,
        hidden: false,
        counter: 0,
      }).as('createTooltip');
      cy.intercept('PATCH', Paths.INTERCEPT.TOOLTIPS_BY_ID, req => {
        if (req.url.includes('increment_counter=true')) {
          req.alias = 'patchTooltipIncrement';
        } else {
          req.alias = 'patchTooltipDismiss';
        }
        req.reply({});
      });

      SecureMessagingSite.login(
        undefined,
        undefined,
        true,
        createMigratingUser('p6'),
      );
      ContactListPage.loadContactList();

      // Component should create a new tooltip, increment the counter, then display the alert
      cy.wait('@createTooltip');
      cy.wait('@patchTooltipIncrement');
      cy.findByTestId(ALERT_TESTID).should('exist');

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });
  });
});
