import { expect } from 'chai';

import {
  reconcileToxicExposureConditions,
  sweepOrphanedTEConditions,
  sippableIdForDisability,
} from '../../utils/reconcile-toxic-exposure-conditions';

describe('reconcile-toxic-exposure-conditions', () => {
  describe('sippableIdForDisability', () => {
    it('derives the sippableId from the condition name only', () => {
      expect(
        sippableIdForDisability({
          condition: 'Anemia',
          sideOfBody: 'Bilateral',
        }),
      ).to.equal('anemia');
    });

    it('falls back to the null-condition id when condition is missing', () => {
      expect(sippableIdForDisability({})).to.equal('unknowncondition');
      expect(sippableIdForDisability(undefined)).to.equal('unknowncondition');
      expect(sippableIdForDisability({ condition: '   ' })).to.equal(
        'unknowncondition',
      );
    });
  });

  describe('reconcileToxicExposureConditions', () => {
    it('returns newFormData unchanged when there is no toxicExposure data', () => {
      const oldData = { newDisabilities: [{ condition: 'Anemia' }] };
      const newData = { newDisabilities: [] };
      expect(reconcileToxicExposureConditions(oldData, newData)).to.equal(
        newData,
      );
    });

    it('returns newFormData unchanged when nothing is orphaned', () => {
      const conditions = { anemia: true, none: false };
      const oldData = {
        newDisabilities: [{ condition: 'Anemia' }],
        toxicExposure: { conditions },
      };
      const newData = {
        newDisabilities: [{ condition: 'Anemia' }],
        toxicExposure: { conditions },
      };
      expect(reconcileToxicExposureConditions(oldData, newData)).to.equal(
        newData,
      );
    });

    it('drops a deleted condition from toxicExposure.conditions', () => {
      const oldData = {
        newDisabilities: [
          { condition: 'Anemia' },
          { condition: 'Tinnitus (ringing or hissing in ears)' },
        ],
        toxicExposure: {
          conditions: {
            anemia: true,
            tinnitusringingorhissinginears: true,
            none: false,
          },
        },
      };
      const newData = {
        newDisabilities: [
          { condition: 'Tinnitus (ringing or hissing in ears)' },
        ],
        toxicExposure: {
          conditions: {
            anemia: true,
            tinnitusringingorhissinginears: true,
            none: false,
          },
        },
      };
      const result = reconcileToxicExposureConditions(oldData, newData);
      expect(result.toxicExposure.conditions).to.deep.equal({
        tinnitusringingorhissinginears: true,
        none: false,
      });
    });

    it('always preserves the none key', () => {
      const oldData = {
        newDisabilities: [{ condition: 'Anemia' }],
        toxicExposure: { conditions: { anemia: true, none: true } },
      };
      const newData = {
        newDisabilities: [],
        toxicExposure: { conditions: { anemia: true, none: true } },
      };
      const result = reconcileToxicExposureConditions(oldData, newData);
      expect(result.toxicExposure.conditions).to.deep.equal({ none: true });
    });

    it('migrates the TE value from the old sippableId to the new one on rename', () => {
      const oldData = {
        newDisabilities: [{ condition: 'Anemia' }],
        toxicExposure: { conditions: { anemia: true, none: false } },
      };
      const newData = {
        newDisabilities: [{ condition: 'Anemia, Bilateral' }],
        toxicExposure: { conditions: { anemia: true, none: false } },
      };
      const result = reconcileToxicExposureConditions(oldData, newData);
      expect(result.toxicExposure.conditions).to.deep.equal({
        anemiabilateral: true,
        none: false,
      });
    });

    it('does not lose a false rename value', () => {
      const oldData = {
        newDisabilities: [{ condition: 'Anemia' }],
        toxicExposure: { conditions: { anemia: false, none: true } },
      };
      const newData = {
        newDisabilities: [{ condition: 'Anemia, Bilateral' }],
        toxicExposure: { conditions: { anemia: false, none: true } },
      };
      const result = reconcileToxicExposureConditions(oldData, newData);
      expect(result.toxicExposure.conditions).to.deep.equal({
        anemiabilateral: false,
        none: true,
      });
    });

    it('migrates multiple independent renames in a single pass', () => {
      const oldData = {
        newDisabilities: [{ condition: 'Anemia' }, { condition: 'Tinnitus' }],
        toxicExposure: {
          conditions: { anemia: true, tinnitus: false, none: false },
        },
      };
      const newData = {
        newDisabilities: [
          { condition: 'Anemia, Bilateral' },
          { condition: 'Tinnitus (ringing or hissing in ears)' },
        ],
        toxicExposure: {
          conditions: { anemia: true, tinnitus: false, none: false },
        },
      };
      const result = reconcileToxicExposureConditions(oldData, newData);
      expect(result.toxicExposure.conditions).to.deep.equal({
        anemiabilateral: true,
        tinnitusringingorhissinginears: false,
        none: false,
      });
    });

    it('does not migrate a value when the old sippableId has no entry', () => {
      const oldData = {
        newDisabilities: [{ condition: 'Anemia' }],
        toxicExposure: { conditions: { none: false } },
      };
      const newData = {
        newDisabilities: [{ condition: 'Anemia, Bilateral' }],
        toxicExposure: { conditions: { none: false } },
      };
      const result = reconcileToxicExposureConditions(oldData, newData);
      expect(result).to.equal(newData);
    });

    it('is resilient when oldFormData is undefined', () => {
      const newData = {
        newDisabilities: [{ condition: 'Anemia' }],
        toxicExposure: {
          conditions: { anemia: true, tinnitus: true, none: false },
        },
      };
      const result = reconcileToxicExposureConditions(undefined, newData);
      expect(result.toxicExposure.conditions).to.deep.equal({
        anemia: true,
        none: false,
      });
    });
  });

  describe('sweepOrphanedTEConditions', () => {
    it('removes keys that do not match a current newDisabilities sippableId', () => {
      const formData = {
        newDisabilities: [{ condition: 'Anemia, Bilateral' }],
        toxicExposure: {
          conditions: {
            anemia: true,
            anemiabilateral: false,
            none: false,
          },
        },
      };
      const result = sweepOrphanedTEConditions(formData);
      expect(result.toxicExposure.conditions).to.deep.equal({
        anemiabilateral: false,
        none: false,
      });
    });

    it('preserves none when all conditions are gone', () => {
      const formData = {
        newDisabilities: [],
        toxicExposure: { conditions: { anemia: true, none: true } },
      };
      const result = sweepOrphanedTEConditions(formData);
      expect(result.toxicExposure.conditions).to.deep.equal({ none: true });
    });

    it('returns the same reference when there is no toxicExposure data', () => {
      const formData = { newDisabilities: [{ condition: 'Anemia' }] };
      expect(sweepOrphanedTEConditions(formData)).to.equal(formData);
    });

    it('returns the same reference when there are no orphans', () => {
      const conditions = { anemia: true, none: false };
      const formData = {
        newDisabilities: [{ condition: 'Anemia' }],
        toxicExposure: { conditions },
      };
      expect(sweepOrphanedTEConditions(formData)).to.equal(formData);
    });
  });
});
