import { expect } from 'chai';
import MockReferralListResponse from '../../../tests/fixtures/MockReferralListResponse';

const referralUtil = require('../../utils/referrals');

describe('VAOS referral generator', () => {
  describe('createReferralById', () => {
    const referral = referralUtil.createReferralById('2024-10-30', '1')
      .attributes;
    it('Create a referral based on specific date', () => {
      expect(referral.expirationDate).to.equal('2025-04-30');
    });
    it('includes onlineSchedule defaulting to true', () => {
      expect(referral.onlineSchedule).to.be.true;
    });
  });
  describe('createReferralListItem', () => {
    it('includes onlineSchedule defaulting to true', () => {
      const referral = MockReferralListResponse.createReferral({
        id: 'test-online',
      });
      expect(referral.attributes.onlineSchedule).to.be.true;
    });
    it('allows onlineSchedule to be set to false', () => {
      const referral = MockReferralListResponse.createReferral({
        id: 'test-offline',
        onlineSchedule: false,
      });
      expect(referral.attributes.onlineSchedule).to.be.false;
    });
  });
  describe('getReferralSlotKey', () => {
    expect(referralUtil.getReferralSlotKey('111')).to.equal(
      'selected-slot-referral-111',
    );
  });

  describe('filterReferrals', () => {
    // Create referrals using the fixture
    const optometryReferral = MockReferralListResponse.createReferral({
      id: 'test-primary-care',
      categoryOfCare: 'PRIMARY CARE',
    });
    const chiropracticReferral = MockReferralListResponse.createReferral({
      id: 'test-chiropractic',
      categoryOfCare: 'CHIROPRACTIC',
    });
    const physicalTherapyReferral = MockReferralListResponse.createReferral({
      id: 'test-physical-therapy',
      categoryOfCare: 'physical-therapy',
    });

    const referrals = [
      physicalTherapyReferral,
      optometryReferral,
      chiropracticReferral,
    ];
    it('Filters out disallowed categories of care', () => {
      const filteredReferrals = referralUtil.filterReferrals(referrals);
      expect(filteredReferrals.length).to.equal(1);
      expect(filteredReferrals[0].attributes.categoryOfCare).to.equal(
        'PRIMARY CARE',
      );
    });
  });
  describe('getAddressString', () => {
    it('Formats the address string', () => {
      const referral = referralUtil.createReferralById('2024-10-30', '111')
        .attributes;
      expect(
        referralUtil.getAddressString(referral.referringFacility.address),
      ).to.equal('222 Richmond Avenue, BATAVIA, 14020');
    });
  });

  describe('buildProviderSlotsQueryParams (unified provider types)', () => {
    const appointmentTypes = [
      { id: 'apt-1', isSelfSchedulable: false },
      { id: 'apt-self', isSelfSchedulable: true },
    ];

    it('builds community_care params when API returns providerType eps', () => {
      const params = referralUtil.buildProviderSlotsQueryParams({
        id: 'svc-123',
        providerType: referralUtil.PROVIDER_TYPE_EPS,
        providerServiceId: 'svc-123',
        appointmentTypes,
        networkId: 'net-1',
      });
      expect(params).to.deep.equal({
        providerType: referralUtil.PROVIDER_TYPE_COMMUNITY_CARE,
        providerServiceId: 'svc-123',
        appointmentTypeId: 'apt-self',
        networkId: 'net-1',
      });
    });

    it('still builds params for legacy community_care providerType', () => {
      const params = referralUtil.buildProviderSlotsQueryParams({
        id: 'svc-456',
        providerType: referralUtil.PROVIDER_TYPE_COMMUNITY_CARE,
        appointmentTypes,
      });
      expect(params.providerType).to.equal(
        referralUtil.PROVIDER_TYPE_COMMUNITY_CARE,
      );
      expect(params.providerServiceId).to.equal('svc-456');
      expect(params.appointmentTypeId).to.equal('apt-self');
    });

    it('returns null for eps row without a self-schedulable appointment type', () => {
      const params = referralUtil.buildProviderSlotsQueryParams({
        id: 'svc-123',
        providerType: referralUtil.PROVIDER_TYPE_EPS,
        appointmentTypes: [{ id: 'apt-1', isSelfSchedulable: false }],
      });
      expect(params).to.be.null;
    });
  });

  describe('pickProviderSnapshotForSlotsMerge', () => {
    const appointmentTypes = [{ id: 'apt-1', isSelfSchedulable: true }];

    it('normalizes eps to community_care in the snapshot', () => {
      const snap = referralUtil.pickProviderSnapshotForSlotsMerge({
        id: '8is2_VVQ',
        name: 'Dr. Example',
        providerType: referralUtil.PROVIDER_TYPE_EPS,
        providerServiceId: '8is2_VVQ',
        appointmentTypes,
        networkId: 'nw',
      });
      expect(snap.providerType).to.equal(
        referralUtil.PROVIDER_TYPE_COMMUNITY_CARE,
      );
      expect(snap.appointmentTypeId).to.equal('apt-1');
    });
  });

  describe('snapshotMatchesProviderSlotsParams', () => {
    it('matches when snapshot used eps and params use community_care', () => {
      const snapshot = {
        providerType: referralUtil.PROVIDER_TYPE_EPS,
        providerServiceId: 'a',
        appointmentTypeId: 't1',
      };
      const params = {
        providerType: referralUtil.PROVIDER_TYPE_COMMUNITY_CARE,
        providerServiceId: 'a',
        appointmentTypeId: 't1',
      };
      expect(referralUtil.snapshotMatchesProviderSlotsParams(snapshot, params))
        .to.be.true;
    });
  });
});
