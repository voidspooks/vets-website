import { expect } from 'chai';
import {
  findHighImpactFieldEntryForPath,
  HIGH_IMPACT_FIELDS,
} from '../../../utils/sideNav/highImpactFields';

describe('highImpactFields', () => {
  describe('findHighImpactFieldEntryForPath', () => {
    it('should match /new-disabilities/add', () => {
      const match = findHighImpactFieldEntryForPath('/new-disabilities/add');
      expect(match).to.not.be.null;
      expect(match.field).to.equal('newDisabilities');
      expect(match.resetToChapter).to.equal(1);
    });

    it('should match /conditions/summary', () => {
      const match = findHighImpactFieldEntryForPath('/conditions/summary');
      expect(match).to.not.be.null;
      expect(match.field).to.equal('newDisabilities');
    });

    it('should match /conditions/:index/condition with numeric index', () => {
      const match = findHighImpactFieldEntryForPath('/conditions/0/condition');
      expect(match).to.not.be.null;
      expect(match.field).to.equal('newDisabilities');
    });

    it('should match /conditions/:index/condition with multi-digit index', () => {
      const match = findHighImpactFieldEntryForPath('/conditions/12/condition');
      expect(match).to.not.be.null;
      expect(match.field).to.equal('newDisabilities');
    });

    it('should match /disabilities/rated-disabilities', () => {
      const match = findHighImpactFieldEntryForPath(
        '/disabilities/rated-disabilities',
      );
      expect(match).to.not.be.null;
      expect(match.field).to.equal('ratedDisabilities');
      expect(match.resetToChapter).to.equal(1);
    });

    it('should match /claim-type', () => {
      const match = findHighImpactFieldEntryForPath('/claim-type');
      expect(match).to.not.be.null;
      expect(match.field).to.equal('view:claimType');
      expect(match.resetToChapter).to.equal(1);
    });

    it('should return null for /veteran-information', () => {
      expect(findHighImpactFieldEntryForPath('/veteran-information')).to.be
        .null;
    });

    it('should return null for /review-and-submit', () => {
      expect(findHighImpactFieldEntryForPath('/review-and-submit')).to.be.null;
    });

    it('should return null for /supporting-evidence/orientation', () => {
      expect(
        findHighImpactFieldEntryForPath('/supporting-evidence/orientation'),
      ).to.be.null;
    });
  });

  describe('newDisabilities change detection', () => {
    const entry = HIGH_IMPACT_FIELDS.find(e => e.field === 'newDisabilities');

    it('should detect addition of a new condition', () => {
      const oldVal = [{ condition: 'PTSD' }];
      const newVal = [{ condition: 'PTSD' }, { condition: 'Tinnitus' }];
      expect(entry.hasImpactfulChange(oldVal, newVal)).to.be.true;
    });

    it('should detect removal of a condition', () => {
      const oldVal = [{ condition: 'PTSD' }, { condition: 'Tinnitus' }];
      const newVal = [{ condition: 'PTSD' }];
      expect(entry.hasImpactfulChange(oldVal, newVal)).to.be.true;
    });

    it('should detect replacement of a condition', () => {
      const oldVal = [{ condition: 'PTSD' }];
      const newVal = [{ condition: 'Tinnitus' }];
      expect(entry.hasImpactfulChange(oldVal, newVal)).to.be.true;
    });

    it('should not detect change when conditions are the same', () => {
      const oldVal = [{ condition: 'PTSD' }, { condition: 'Tinnitus' }];
      const newVal = [{ condition: 'PTSD' }, { condition: 'Tinnitus' }];
      expect(entry.hasImpactfulChange(oldVal, newVal)).to.be.false;
    });

    it('should not detect change when conditions are in different order', () => {
      const oldVal = [{ condition: 'PTSD' }, { condition: 'Tinnitus' }];
      const newVal = [{ condition: 'Tinnitus' }, { condition: 'PTSD' }];
      expect(entry.hasImpactfulChange(oldVal, newVal)).to.be.false;
    });

    it('should handle empty to non-empty', () => {
      expect(entry.hasImpactfulChange([], [{ condition: 'PTSD' }])).to.be.true;
    });

    it('should handle undefined old value', () => {
      expect(entry.hasImpactfulChange(undefined, [{ condition: 'PTSD' }])).to.be
        .true;
    });

    it('should not detect change from undefined to empty', () => {
      expect(entry.hasImpactfulChange(undefined, [])).to.be.false;
    });
  });

  describe('ratedDisabilities change detection', () => {
    const entry = HIGH_IMPACT_FIELDS.find(e => e.field === 'ratedDisabilities');

    it('should detect selection of a rated disability', () => {
      const oldVal = [{ name: 'PTSD', 'view:selected': false }];
      const newVal = [{ name: 'PTSD', 'view:selected': true }];
      expect(entry.hasImpactfulChange(oldVal, newVal)).to.be.true;
    });

    it('should detect deselection of a rated disability', () => {
      const oldVal = [{ name: 'PTSD', 'view:selected': true }];
      const newVal = [{ name: 'PTSD', 'view:selected': false }];
      expect(entry.hasImpactfulChange(oldVal, newVal)).to.be.true;
    });

    it('should not detect change when selections are the same', () => {
      const oldVal = [
        { name: 'PTSD', 'view:selected': true },
        { name: 'Tinnitus', 'view:selected': false },
      ];
      const newVal = [
        { name: 'PTSD', 'view:selected': true },
        { name: 'Tinnitus', 'view:selected': false },
      ];
      expect(entry.hasImpactfulChange(oldVal, newVal)).to.be.false;
    });

    it('should handle undefined old value', () => {
      expect(
        entry.hasImpactfulChange(undefined, [
          { name: 'PTSD', 'view:selected': true },
        ]),
      ).to.be.true;
    });
  });

  describe('view:claimType change detection', () => {
    const entry = HIGH_IMPACT_FIELDS.find(e => e.field === 'view:claimType');

    it('should detect change in claimingNew', () => {
      const oldVal = {
        'view:claimingNew': true,
        'view:claimingIncrease': false,
      };
      const newVal = {
        'view:claimingNew': false,
        'view:claimingIncrease': false,
      };
      expect(entry.hasImpactfulChange(oldVal, newVal)).to.be.true;
    });

    it('should detect change in claimingIncrease', () => {
      const oldVal = {
        'view:claimingNew': true,
        'view:claimingIncrease': false,
      };
      const newVal = {
        'view:claimingNew': true,
        'view:claimingIncrease': true,
      };
      expect(entry.hasImpactfulChange(oldVal, newVal)).to.be.true;
    });

    it('should not detect change when values are the same', () => {
      const oldVal = {
        'view:claimingNew': true,
        'view:claimingIncrease': false,
      };
      const newVal = {
        'view:claimingNew': true,
        'view:claimingIncrease': false,
      };
      expect(entry.hasImpactfulChange(oldVal, newVal)).to.be.false;
    });

    it('should handle undefined old value', () => {
      const newVal = {
        'view:claimingNew': true,
        'view:claimingIncrease': false,
      };
      expect(entry.hasImpactfulChange(undefined, newVal)).to.be.true;
    });
  });
});
