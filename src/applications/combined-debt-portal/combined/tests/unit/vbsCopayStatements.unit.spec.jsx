import { expect } from 'chai';
import {
  vbsCompositeId,
  getCopaysForPriorMonthlyStatements,
  groupCopaysByMonth,
} from '../../utils/vbsCopayStatements';

/** Minimal VBS copay row for monthly-statement helpers */
const vbsCopay = (id, pSFacilityNum, pSStatementDateOutput) => ({
  id,
  pSFacilityNum,
  pSStatementDateOutput,
});

/**
 * Same rows DetailCopayPage passes as `previousStatements` to PreviousStatements (legacy VBS).
 * PreviousStatements only reads `id` and `pSStatementDateOutput`; `compositeId` is included
 * for debugging / contract clarity.
 */
const legacyPreviousStatementsPayload = (copays, facilityId, currentCopayId) =>
  getCopaysForPriorMonthlyStatements(copays, facilityId, currentCopayId).map(
    ({ id, pSStatementDateOutput, compositeId }) => ({
      id,
      pSStatementDateOutput,
      compositeId,
    }),
  );

describe('vbsCopayStatements', () => {
  const FACILITY = '648';

  describe('vbsCompositeId', () => {
    it('builds a Lighthouse-style composite id from facility, month, and year', () => {
      expect(vbsCompositeId('648', 3, 2024)).to.equal('648-3-2024');
    });

    it('stringifies numeric facility ids', () => {
      expect(vbsCompositeId(648, 12, 2023)).to.equal('648-12-2023');
    });
  });

  describe('getCopaysForPriorMonthlyStatements', () => {
    it('returns an empty array when copays is null or undefined', () => {
      expect(
        getCopaysForPriorMonthlyStatements(null, FACILITY, 'open'),
      ).to.deep.equal([]);
      expect(
        getCopaysForPriorMonthlyStatements(undefined, FACILITY, 'open'),
      ).to.deep.equal([]);
    });

    it('returns an empty array when the open copay id is not in the list', () => {
      const copays = [vbsCopay('a', FACILITY, '03/15/2024')];
      expect(
        getCopaysForPriorMonthlyStatements(copays, FACILITY, 'missing'),
      ).to.deep.equal([]);
    });

    it('resolves the current copay when currentCopayId strictly matches copay.id (same type)', () => {
      const open = {
        id: 1001,
        pSFacilityNum: FACILITY,
        pSStatementDateOutput: '03/15/2024',
      };
      const prior = {
        id: 1002,
        pSFacilityNum: FACILITY,
        pSStatementDateOutput: '02/10/2024',
      };
      const result = getCopaysForPriorMonthlyStatements(
        [open, prior],
        FACILITY,
        1001,
      );
      expect(result).to.have.lengthOf(1);
      expect(result[0].id).to.equal(1002);
    });

    it('returns an empty array when the open copay has no valid billing month', () => {
      const copays = [
        vbsCopay('open', FACILITY, ''),
        vbsCopay('prior', FACILITY, '02/01/2024'),
      ];
      expect(
        getCopaysForPriorMonthlyStatements(copays, FACILITY, 'open'),
      ).to.deep.equal([]);
    });

    it('excludes the current copay, other facilities, and statements on or after the current month', () => {
      const open = vbsCopay('open', FACILITY, '03/15/2024');
      const copays = [
        open,
        vbsCopay('wrong-facility', '999', '02/01/2024'),
        vbsCopay('older', FACILITY, '08/01/2023'),
        vbsCopay('future', FACILITY, '04/01/2024'),
        vbsCopay('feb', FACILITY, '02/10/2024'),
        vbsCopay('jan', FACILITY, '01/05/2024'),
        vbsCopay('dec', FACILITY, '12/01/2023'),
        vbsCopay('nov', FACILITY, '11/15/2023'),
        vbsCopay('oct', FACILITY, '10/01/2023'),
        vbsCopay('sep', FACILITY, '09/01/2023'),
      ];

      const result = getCopaysForPriorMonthlyStatements(
        copays,
        FACILITY,
        'open',
      );

      expect(result.map(c => c.id)).to.deep.equal([
        'feb',
        'jan',
        'dec',
        'nov',
        'oct',
        'sep',
        'older',
      ]);
      expect(result.every(c => typeof c.compositeId === 'string')).to.be.true;
    });

    it('sorts prior copays by statement date descending', () => {
      const copays = [
        vbsCopay('sep', FACILITY, '09/01/2023'),
        vbsCopay('feb', FACILITY, '02/01/2024'),
        vbsCopay('open', FACILITY, '03/01/2024'),
        vbsCopay('jan', FACILITY, '01/01/2024'),
      ];

      const result = getCopaysForPriorMonthlyStatements(
        copays,
        FACILITY,
        'open',
      );

      expect(result.map(c => c.id)).to.deep.equal(['feb', 'jan', 'sep']);
    });

    it('assigns compositeId matching vbsCompositeId for the copay billing month', () => {
      const open = vbsCopay('open', FACILITY, '03/01/2024');
      const prior = vbsCopay('feb', FACILITY, '02/15/2024');
      const result = getCopaysForPriorMonthlyStatements(
        [open, prior],
        FACILITY,
        'open',
      );

      expect(result).to.have.lengthOf(1);
      expect(result[0].compositeId).to.equal(vbsCompositeId(FACILITY, 2, 2024));
    });

    it('matches the legacy `previousStatements` prop shape for PreviousStatements (DetailCopayPage)', () => {
      const open = vbsCopay('open', FACILITY, '03/01/2024');
      const febLate = vbsCopay('feb-late', FACILITY, '02/28/2024');
      const febEarly = vbsCopay('feb-early', FACILITY, '02/05/2024');
      const jan = vbsCopay('jan', FACILITY, '01/10/2024');
      const copays = [open, febLate, febEarly, jan];

      const payload = legacyPreviousStatementsPayload(copays, FACILITY, 'open');

      expect(payload).to.deep.equal([
        {
          id: 'feb-late',
          pSStatementDateOutput: '02/28/2024',
          compositeId: vbsCompositeId(FACILITY, 2, 2024),
        },
        {
          id: 'feb-early',
          pSStatementDateOutput: '02/05/2024',
          compositeId: vbsCompositeId(FACILITY, 2, 2024),
        },
        {
          id: 'jan',
          pSStatementDateOutput: '01/10/2024',
          compositeId: vbsCompositeId(FACILITY, 1, 2024),
        },
      ]);

      if (process.env.DEBUG_VBS_PREVIOUS_STATEMENTS) {
        // eslint-disable-next-line no-console
        console.log(
          '[DEBUG_VBS_PREVIOUS_STATEMENTS] legacy previousStatements payload:',
          JSON.stringify(payload, null, 2),
        );
      }
    });
  });

  describe('groupCopaysByMonth', () => {
    it('returns one group per monthly statement, ordered newest billing month first', () => {
      const open = vbsCopay('open', FACILITY, '03/01/2024');
      const copays = [
        open,
        vbsCopay('feb', FACILITY, '02/01/2024'),
        vbsCopay('jan', FACILITY, '01/01/2024'),
        vbsCopay('dec', FACILITY, '12/01/2023'),
        vbsCopay('nov', FACILITY, '11/01/2023'),
        vbsCopay('oct', FACILITY, '10/01/2023'),
        vbsCopay('sep', FACILITY, '09/01/2023'),
      ];

      const groups = groupCopaysByMonth(copays, FACILITY, 'open');

      expect(groups.map(g => g.compositeId)).to.deep.equal([
        vbsCompositeId(FACILITY, 2, 2024),
        vbsCompositeId(FACILITY, 1, 2024),
        vbsCompositeId(FACILITY, 12, 2023),
        vbsCompositeId(FACILITY, 11, 2023),
        vbsCompositeId(FACILITY, 10, 2023),
        vbsCompositeId(FACILITY, 9, 2023),
      ]);
    });

    it('merges multiple copay rows in the same billing month into one group', () => {
      const open = vbsCopay('open', FACILITY, '03/01/2024');
      const earlierFeb = vbsCopay('feb-early', FACILITY, '02/01/2024');
      const laterFeb = vbsCopay('feb-late', FACILITY, '02/28/2024');
      const copays = [open, earlierFeb, laterFeb];

      const groups = groupCopaysByMonth(copays, FACILITY, 'open');

      expect(groups).to.have.lengthOf(1);
      expect(groups[0].compositeId).to.equal(vbsCompositeId(FACILITY, 2, 2024));
      expect(groups[0].copays.map(c => c.id)).to.deep.equal([
        'feb-late',
        'feb-early',
      ]);
    });

    it('matches getCopaysForPriorMonthlyStatements row count when flattened', () => {
      const open = vbsCopay('open', FACILITY, '03/01/2024');
      const copays = [
        open,
        vbsCopay('feb-a', FACILITY, '02/10/2024'),
        vbsCopay('feb-b', FACILITY, '02/05/2024'),
        vbsCopay('jan', FACILITY, '01/01/2024'),
      ];

      const flat = getCopaysForPriorMonthlyStatements(copays, FACILITY, 'open');
      const grouped = groupCopaysByMonth(copays, FACILITY, 'open');
      const flattenedFromGroups = grouped.flatMap(g => g.copays);

      expect(flattenedFromGroups).to.have.lengthOf(flat.length);
      expect(flattenedFromGroups.map(c => c.id).sort()).to.deep.equal(
        flat.map(c => c.id).sort(),
      );
    });

    it('preserves each copay row (e.g. details) when flattening and when grouped — only compositeId is added', () => {
      const detailsA = [{ pDTransDescOutput: 'Line A', pDAmount: '1' }];
      const detailsB = [{ pDTransDescOutput: 'Line B', pDAmount: '2' }];
      const open = {
        ...vbsCopay('open', FACILITY, '03/01/2024'),
        details: [],
      };
      const febA = {
        ...vbsCopay('feb-a', FACILITY, '02/10/2024'),
        details: detailsA,
      };
      const febB = {
        ...vbsCopay('feb-b', FACILITY, '02/05/2024'),
        details: detailsB,
      };
      const copays = [open, febA, febB];

      const flat = getCopaysForPriorMonthlyStatements(copays, FACILITY, 'open');
      expect(flat.find(c => c.id === 'feb-a').details).to.deep.equal(detailsA);
      expect(flat.find(c => c.id === 'feb-b').details).to.deep.equal(detailsB);

      const [febGroup] = groupCopaysByMonth(copays, FACILITY, 'open');
      expect(febGroup.copays).to.have.lengthOf(2);
      expect(febGroup.copays.find(c => c.id === 'feb-a').details).to.deep.equal(
        detailsA,
      );
      expect(febGroup.copays.find(c => c.id === 'feb-b').details).to.deep.equal(
        detailsB,
      );
    });
  });
});
