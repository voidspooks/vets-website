import { expect } from 'chai';
import { isUnfilledOhPrescription } from '../../../util/helpers/isUnfilledOhPrescription';

describe('isUnfilledOhPrescription', () => {
  const cernerFacilityIds = ['506', '668'];

  const baseOhRx = {
    sourceEhr: 'OH',
    dispStatus: 'Active',
    dispensedDate: null,
    sortedDispensedDate: null,
    isRefillable: false,
    rxRfRecords: [],
  };

  it('returns false when rx is null', () => {
    expect(isUnfilledOhPrescription(null, cernerFacilityIds)).to.be.false;
  });

  it('returns false when isRefillable is true', () => {
    const rx = { ...baseOhRx, isRefillable: true };
    expect(isUnfilledOhPrescription(rx, cernerFacilityIds)).to.be.false;
  });

  it('returns false for a non-Oracle Health prescription', () => {
    const rx = { ...baseOhRx, sourceEhr: 'vista' };
    expect(isUnfilledOhPrescription(rx, cernerFacilityIds)).to.be.false;
  });

  it('returns false when dispStatus is not Active', () => {
    const rx = { ...baseOhRx, dispStatus: 'Expired' };
    expect(isUnfilledOhPrescription(rx, cernerFacilityIds)).to.be.false;
  });

  it('returns true for an active OH rx with no dispense history', () => {
    expect(isUnfilledOhPrescription(baseOhRx, cernerFacilityIds)).to.be.true;
  });

  it('returns false when dispensedDate is present', () => {
    const rx = { ...baseOhRx, dispensedDate: '2025-10-03T04:00:00.000Z' };
    expect(isUnfilledOhPrescription(rx, cernerFacilityIds)).to.be.false;
  });

  it('returns false when sortedDispensedDate is present', () => {
    const rx = { ...baseOhRx, sortedDispensedDate: '2025-10-03' };
    expect(isUnfilledOhPrescription(rx, cernerFacilityIds)).to.be.false;
  });

  it('returns false when an rxRfRecord has dispensedDate', () => {
    const rx = {
      ...baseOhRx,
      rxRfRecords: [{ dispensedDate: '2025-10-03T04:00:00.000Z' }],
    };
    expect(isUnfilledOhPrescription(rx, cernerFacilityIds)).to.be.false;
  });

  it('returns false when an rxRfRecord has whenHandedOver', () => {
    const rx = {
      ...baseOhRx,
      rxRfRecords: [{ whenHandedOver: '2025-10-03T04:00:00.000Z' }],
    };
    expect(isUnfilledOhPrescription(rx, cernerFacilityIds)).to.be.false;
  });

  it('returns true when rxRfRecords exist but none have dispense dates', () => {
    const rx = {
      ...baseOhRx,
      rxRfRecords: [
        { status: 'completed', dispensedDate: null, whenHandedOver: null },
      ],
    };
    expect(isUnfilledOhPrescription(rx, cernerFacilityIds)).to.be.true;
  });
});
