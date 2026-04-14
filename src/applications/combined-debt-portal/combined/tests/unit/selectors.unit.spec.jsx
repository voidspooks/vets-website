import { expect } from 'chai';
import {
  groupVbsCopaysByStatements,
  selectVbsGroupedCopaysByMonth,
  selectVbsStatementGroup,
  selectLighthouseStatementGroups,
  selectLighthousePreviousStatements,
  selectCurrentStatementMcpState,
} from '../../utils/selectors';
import { vbsCompositeId } from '../../utils/vbsCopayStatements';

/**
 * Mock shapes align with vets-api medical copays:
 * - V0 GET /v0/medical_copays `data[]`: string `id`, `pSFacilityNum`, `pSStatementDateOutput`, …
 * - V1 GET /v1/medical_copays/{id} (non-Cerner): `selectedStatement` with `attributes.associatedStatements[]`
 *   (`id`, `date`, `compositeId` per schema; invoice display uses attributes.invoiceDate ?? invoiceDate ?? date).
 */

const FACILITY = '648';

/** Minimal V0 list row — only fields required by groupCopaysByMonth / findCopayById, plus realistic id shape. */
const v0CopayRow = (id, pSStatementDateOutput, overrides = {}) => ({
  id,
  pSFacilityNum: FACILITY,
  pSStatementDateOutput,
  pSStatementDate: pSStatementDateOutput.replace(/\//g, ''),
  ...overrides,
});

const OPEN_ROW_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const PRIOR_FEB_ID = '4fa85f64-5717-4562-b3fc-2c963f66afa7';
const PRIOR_JAN_ID = '5fa85f64-5717-4562-b3fc-2c963f66afa8';

const mcpStateWithStatements = data => ({
  combinedPortal: {
    mcp: {
      statements: { data },
      shouldUseLighthouseCopays: false,
    },
  },
});

const mcpStateWithDetail = selectedStatement => ({
  combinedPortal: {
    mcp: {
      selectedStatement,
      shouldUseLighthouseCopays: true,
    },
  },
});

describe('combined utils/selectors', () => {
  describe('groupVbsCopaysByStatements', () => {
    it('returns id/pSStatementDateOutput for every copay in grouped output (all rows, including multiple per month)', () => {
      const laterInFeb = '6fa85f64-5717-4562-b3fc-2c963f66afa9';
      const grouped = [
        {
          compositeId: vbsCompositeId(FACILITY, 2, 2024),
          copays: [
            v0CopayRow(PRIOR_FEB_ID, '02/28/2024', {
              compositeId: vbsCompositeId(FACILITY, 2, 2024),
            }),
            v0CopayRow(laterInFeb, '02/05/2024', {
              compositeId: vbsCompositeId(FACILITY, 2, 2024),
            }),
          ],
        },
        {
          compositeId: vbsCompositeId(FACILITY, 1, 2024),
          copays: [v0CopayRow(PRIOR_JAN_ID, '01/10/2024')],
        },
      ];

      expect(groupVbsCopaysByStatements(grouped)).to.deep.equal([
        {
          id: PRIOR_FEB_ID,
          pSStatementDateOutput: '02/28/2024',
        },
        {
          id: laterInFeb,
          pSStatementDateOutput: '02/05/2024',
        },
        {
          id: PRIOR_JAN_ID,
          pSStatementDateOutput: '01/10/2024',
        },
      ]);
    });

    it('returns an empty array when grouped is empty', () => {
      expect(groupVbsCopaysByStatements([])).to.deep.equal([]);
    });
  });

  describe('selectVbsGroupedCopaysByMonth', () => {
    it('returns [] when currentCopayId is null', () => {
      const state = mcpStateWithStatements([]);
      expect(selectVbsGroupedCopaysByMonth(state, null)).to.deep.equal([]);
    });

    it('returns grouped prior months for V0-shaped copay rows', () => {
      const open = v0CopayRow(OPEN_ROW_ID, '03/01/2024');
      const priorFeb = v0CopayRow(PRIOR_FEB_ID, '02/01/2024');
      const state = mcpStateWithStatements([open, priorFeb]);
      const groups = selectVbsGroupedCopaysByMonth(state, OPEN_ROW_ID);
      expect(groups).to.have.lengthOf(1);
      expect(groups[0].compositeId).to.equal(vbsCompositeId(FACILITY, 2, 2024));
      expect(groups[0].copays.map(c => c.id)).to.deep.equal([PRIOR_FEB_ID]);
    });
  });

  describe('selectVbsStatementGroup', () => {
    it('returns the group matching composite statementId', () => {
      const open = v0CopayRow(OPEN_ROW_ID, '03/01/2024');
      const feb = v0CopayRow(PRIOR_FEB_ID, '02/01/2024');
      const jan = v0CopayRow(PRIOR_JAN_ID, '01/01/2024');
      const state = mcpStateWithStatements([open, feb, jan]);
      const compositeFeb = vbsCompositeId(FACILITY, 2, 2024);
      const group = selectVbsStatementGroup(state, OPEN_ROW_ID, compositeFeb);
      expect(group).to.exist;
      expect(group.compositeId).to.equal(compositeFeb);
      expect(group.copays.map(c => c.id)).to.deep.equal([PRIOR_FEB_ID]);
    });

    it('returns undefined when statementId is null', () => {
      const state = mcpStateWithStatements([
        v0CopayRow(OPEN_ROW_ID, '03/01/2024'),
      ]);
      expect(selectVbsStatementGroup(state, OPEN_ROW_ID, null)).to.equal(
        undefined,
      );
    });
  });

  describe('selectLighthouseStatementGroups', () => {
    it('groups associatedStatements by compositeId and sorts copays by date', () => {
      const state = mcpStateWithDetail({
        id: '675-K3FD983',
        type: 'medicalCopayDetails',
        attributes: {
          billNumber: 'BILL-123456',
          associatedStatements: [
            {
              id: '4-1abZUKu7LncRZa',
              compositeId: '648-1-2024',
              date: '2024-01-05T12:00:00.000Z',
            },
            {
              id: '4-1abZUKu7LncRZb',
              compositeId: '648-1-2024',
              date: '2024-01-20T12:00:00.000Z',
            },
          ],
        },
      });
      const groups = selectLighthouseStatementGroups(state);
      expect(groups).to.have.lengthOf(1);
      expect(groups[0].statementId).to.equal('648-1-2024');
      expect(groups[0].copays.map(c => c.id)).to.deep.equal([
        '4-1abZUKu7LncRZb',
        '4-1abZUKu7LncRZa',
      ]);
    });

    it('returns an empty array when there are no associatedStatements', () => {
      const state = mcpStateWithDetail({
        id: '675-K3FD983',
        type: 'medicalCopayDetails',
        attributes: {},
      });
      expect(selectLighthouseStatementGroups(state)).to.deep.equal([]);
    });
  });

  describe('selectLighthousePreviousStatements', () => {
    it('maps associated statements to id and invoiceDate (attributes.invoiceDate, then invoiceDate, then date)', () => {
      const state = mcpStateWithDetail({
        id: '675-K3FD983',
        type: 'medicalCopayDetails',
        attributes: {
          associatedStatements: [
            {
              id: '4-1abZUKu7LncRZi',
              compositeId: 'composite-1',
              date: '2025-04-30T00:00:00.000Z',
              attributes: { invoiceDate: '2025-04-30T00:00:00.000Z' },
            },
            {
              id: '4-1abZUKu7LncRZj',
              compositeId: 'composite-1',
              date: '2025-03-15T00:00:00.000Z',
              invoiceDate: '2025-03-15T00:00:00.000Z',
            },
            {
              id: '4-1abZUKu7LncRZk',
              compositeId: 'composite-2',
              date: '2025-02-01T00:00:00.000Z',
            },
          ],
        },
      });
      const rows = selectLighthousePreviousStatements(state);
      expect(rows).to.have.lengthOf(3);
      expect(rows[0]).to.deep.include({
        id: '4-1abZUKu7LncRZi',
        invoiceDate: '2025-04-30T00:00:00.000Z',
      });
      expect(rows[1]).to.deep.include({
        id: '4-1abZUKu7LncRZj',
        invoiceDate: '2025-03-15T00:00:00.000Z',
      });
      expect(rows[2]).to.deep.include({
        id: '4-1abZUKu7LncRZk',
        invoiceDate: '2025-02-01T00:00:00.000Z',
      });
    });
  });

  describe('selectCurrentStatementMcpState', () => {
    it('exposes copay detail and loading flags from state', () => {
      const state = {
        combinedPortal: {
          mcp: {
            selectedStatement: { id: '675-K3FD983' },
            statements: { data: [] },
            shouldUseLighthouseCopays: true,
            isCopayDetailLoading: false,
            pending: false,
          },
        },
        featureToggles: {},
      };
      const slice = selectCurrentStatementMcpState(state);
      expect(slice.shouldUseLighthouseCopays).to.be.true;
      expect(slice.copayDetail).to.deep.equal({ id: '675-K3FD983' });
      expect(slice.isCopayDetailLoading).to.be.false;
      expect(slice.statementsLoaded).to.be.true;
      expect(slice.statementsPending).to.be.false;
    });
  });
});
