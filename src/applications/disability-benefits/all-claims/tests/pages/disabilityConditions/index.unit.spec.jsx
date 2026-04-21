import 'platform/testing/unit/mocha-setup';
import { expect } from 'chai';
import sinon from 'sinon';

import { disabilityConditionsWorkflow } from '../../../pages/disabilityConditions';

const findPageByPath = path =>
  Object.values(disabilityConditionsWorkflow).find(page => page.path === path);

describe('V2 disability conditions workflow — TE orphan reconciliation', () => {
  describe('NewCondition page onNavForward (rename via edit-mode submit)', () => {
    const newConditionPage = () =>
      findPageByPath('conditions/:index/new-condition');

    it('sweeps an orphan toxicExposure.conditions key after a rename', () => {
      const setFormData = sinon.spy();
      const goNextPath = sinon.spy();

      // Simulates the post-submit Redux state after the user renamed
      // "Anemia" → "Ankle Sprain, Bilateral". The TE entry for the old
      // sippableId is still there because edit-mode bypasses
      // pageConfig.updateFormData.
      const formData = {
        newDisabilities: [
          { condition: 'Ankle Sprain, Bilateral', cause: 'NEW' },
          { condition: 'Asthma', cause: 'NEW' },
        ],
        toxicExposure: {
          conditions: { anemia: true, asthma: true, none: false },
        },
      };

      newConditionPage().onNavForward({
        formData,
        index: 0,
        setFormData,
        goNextPath,
        urlParams: { edit: true },
      });

      expect(setFormData.called).to.be.true;
      const reconciled = setFormData.firstCall.args[0];
      // sweepOrphanedTEConditions drops keys whose sippableId is no longer
      // in newDisabilities. It does not migrate the old value onto the new
      // sippableId, so the renamed condition simply starts unchecked.
      expect(reconciled.toxicExposure.conditions).to.deep.equal({
        asthma: true,
        none: false,
      });
    });

    it('does not mutate toxicExposure.conditions when nothing is orphaned', () => {
      const setFormData = sinon.spy();
      const goNextPath = sinon.spy();

      const formData = {
        newDisabilities: [{ condition: 'Asthma', cause: 'NEW' }],
        toxicExposure: { conditions: { asthma: true, none: false } },
      };

      newConditionPage().onNavForward({
        formData,
        index: 0,
        setFormData,
        goNextPath,
        urlParams: {},
      });

      // setFormData may still be called for unrelated side-of-body cleanup,
      // but no payload should rewrite the (already-clean) TE conditions.
      setFormData.getCalls().forEach(call => {
        const payload = call.args[0];
        if (payload?.toxicExposure) {
          expect(payload.toxicExposure.conditions).to.deep.equal({
            asthma: true,
            none: false,
          });
        }
      });
      expect(goNextPath.calledOnce).to.be.true;
    });
  });

  describe('Summary page onNavForward (defensive sweep before TE chapter)', () => {
    const summaryPageConfig = () => findPageByPath('conditions/summary');

    it('sweeps any orphans left by an item-page edit before continuing', () => {
      const setFormData = sinon.spy();
      const goPath = sinon.spy();

      const formData = {
        newDisabilities: [
          { condition: 'Ankle Sprain, Bilateral', cause: 'NEW' },
          { condition: 'Asthma', cause: 'NEW' },
        ],
        toxicExposure: {
          conditions: { anemia: true, asthma: true, none: false },
        },
        'view:hasConditions': false,
      };

      summaryPageConfig().onNavForward({
        formData,
        setFormData,
        goPath,
        pageList: [],
        urlParams: {},
      });

      expect(setFormData.called).to.be.true;
      const reconciled = setFormData.firstCall.args[0];
      expect(reconciled.toxicExposure.conditions).to.not.have.property(
        'anemia',
      );
      expect(reconciled.toxicExposure.conditions).to.deep.equal({
        asthma: true,
        none: false,
      });
    });

    it('does not call setFormData when nothing is orphaned', () => {
      const setFormData = sinon.spy();
      const goPath = sinon.spy();

      const formData = {
        newDisabilities: [{ condition: 'Asthma', cause: 'NEW' }],
        toxicExposure: { conditions: { asthma: true, none: false } },
        'view:hasConditions': false,
      };

      summaryPageConfig().onNavForward({
        formData,
        setFormData,
        goPath,
        pageList: [],
        urlParams: {},
      });

      expect(setFormData.called).to.be.false;
    });
  });
});
