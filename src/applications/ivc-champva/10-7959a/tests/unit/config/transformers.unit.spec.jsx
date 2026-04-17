import { expect } from 'chai';
import sinon from 'sinon-v20';
import * as recordEventModule from 'platform/monitoring/record-event';
import { ID_NUMBER_OPTIONS } from '../../../chapters/resubmission/claimIdNumber';
import formConfig from '../../../config/form';
import mockData from '../../e2e/fixtures/data/medical-claim.json';
import transformForSubmit from '../../../config/submitTransformer';
import { ATTACHMENT_IDS } from '../../../utils/constants';

describe('Submit transformer', () => {
  it('should add the file type to submitted files', () => {
    const result = JSON.parse(transformForSubmit(formConfig, mockData));
    const attachmentIds = result.supportingDocs.map(o => o.attachmentId);
    expect(attachmentIds.length).to.eq(2);
    expect(attachmentIds.includes(ATTACHMENT_IDS.meddoc)).to.be.true;
    expect(attachmentIds.includes(ATTACHMENT_IDS.eob)).to.be.true;
  });

  it('should set primaryContact name to false if none present', () => {
    const result = JSON.parse(
      transformForSubmit(formConfig, {
        data: {
          applicantAddress: { street: '' },
          certifierAddress: { street: '' },
        },
      }),
    );
    expect(result.primaryContactInfo.name).to.be.false;
  });

  it('should set primaryContact name to sponsor if certifierRole is `sponsor`', () => {
    const result = JSON.parse(
      transformForSubmit(formConfig, {
        data: {
          certifierRole: 'sponsor',
          sponsorName: { first: 'Jim' },
          applicantAddress: { street: '' },
          certifierAddress: { street: '' },
        },
      }),
    );
    expect(result.primaryContactInfo.name.first).to.equal('Jim');
  });

  context('Claim status event tracking', () => {
    let recordEventStub;

    beforeEach(() => {
      recordEventStub = sinon.stub(recordEventModule, 'default');
    });

    afterEach(() => recordEventStub.restore());

    const submitForm = ({ overrides = {}, disableAnalytics = false } = {}) => {
      const baseData = {
        applicantAddress: { street: '' },
        certifierAddress: { street: '' },
      };
      transformForSubmit(
        formConfig,
        { data: { ...baseData, ...overrides } },
        disableAnalytics,
      );
    };

    it('should fire recordEvent with new claim event when claimStatus is new', () => {
      submitForm({ overrides: { claimStatus: 'new' } });
      sinon.assert.calledOnceWithExactly(recordEventStub, {
        event: '10-7959a_new_claim',
      });
    });

    it('should fire recordEvent with reopen claim event when pdiOrClaimNumber matches control option', () => {
      submitForm({
        overrides: {
          claimStatus: 'resubmission',
          pdiOrClaimNumber: ID_NUMBER_OPTIONS[1],
        },
      });
      sinon.assert.calledOnceWithExactly(recordEventStub, {
        event: '10-7959a_reopen_claim_control_number',
      });
    });

    it('should fire recordEvent with resubmission event when claimStatus is resubmission with PDI', () => {
      submitForm({
        overrides: {
          claimStatus: 'resubmission',
          pdiOrClaimNumber: ID_NUMBER_OPTIONS[0],
        },
      });
      sinon.assert.calledOnceWithExactly(recordEventStub, {
        event: '10-7959a_resubmission_pdi_number',
      });
    });

    it('should fire duty to assist event when claim is resubmission and no claim docs are available', () => {
      submitForm({
        overrides: {
          claimStatus: 'resubmission',
          pdiOrClaimNumber: ID_NUMBER_OPTIONS[0],
          'view:champvaEnableClaimResubmitQuestion': true,
          hasClaimDocs: false,
        },
      });
      sinon.assert.calledWithExactly(recordEventStub.firstCall, {
        event: '10-7959a_duty_to_assist',
      });
    });

    it('should not fire recordEvent when disableAnalytics is true', () => {
      submitForm({ overrides: { claimStatus: 'new' }, disableAnalytics: true });
      sinon.assert.notCalled(recordEventStub);
    });
  });

  // TODO: remove post-launch of 2026 PDF
  context('Insurance policy field mapping', () => {
    const submitWithPolicies = (policies = []) => {
      const result = JSON.parse(
        transformForSubmit(formConfig, {
          data: {
            'view:champvaClaimsInsuranceDates': true,
            claimStatus: 'new',
            hasOhi: true,
            policies,
          },
        }),
      );
      return result.policies;
    };

    it('should map policyNumber to policyNum in policies array', () => {
      const policies = submitWithPolicies([
        { name: 'Provider A', policyNumber: '12345' },
        { name: 'Provider B', policyNumber: '67890' },
      ]);
      expect(policies[0].policyNum).to.equal('12345');
      expect(policies[1].policyNum).to.equal('67890');
    });

    it('should map providerPhoneNumber to providerPhone in policies array', () => {
      const policies = submitWithPolicies([
        { name: 'Provider A', providerPhoneNumber: '555-1234' },
        { name: 'Provider B', providerPhoneNumber: '555-5678' },
      ]);
      expect(policies[0].providerPhone).to.equal('555-1234');
      expect(policies[1].providerPhone).to.equal('555-5678');
    });

    it('should preserve existing policyNum and providerPhone values', () => {
      const policies = submitWithPolicies([
        { policyNum: 'OLD123', providerPhone: '555-0000' },
      ]);
      expect(policies[0].policyNum).to.equal('OLD123');
      expect(policies[0].providerPhone).to.equal('555-0000');
    });
  });
});
