import { expect } from 'chai';
import {
  isExpiredWithin120Days,
  RENEWAL_ELIGIBILITY_WINDOW_DAYS,
} from '../../../util/helpers/isExpiredWithin120Days';
import { dispStatusObj, dispStatusObjV2 } from '../../../util/constants';

describe('isExpiredWithin120Days', () => {
  const createPrescription = (
    dispStatus,
    expirationDate = new Date().toISOString(),
  ) => ({
    dispStatus,
    expirationDate,
  });

  it('exports the renewal eligibility window constant', () => {
    expect(RENEWAL_ELIGIBILITY_WINDOW_DAYS).to.equal(120);
  });

  describe('when status is expired/inactive (V1 statuses)', () => {
    const v1ExpiredStatuses = [
      { status: dispStatusObj.expired, label: 'dispStatusObj.expired' },
      {
        status: dispStatusObj.discontinued,
        label: 'dispStatusObj.discontinued',
      },
    ];

    v1ExpiredStatuses.forEach(({ status, label }) => {
      it(`returns true when dispStatus is ${label} and expired within 120 days`, () => {
        const expirationDate = new Date(
          Date.now() - 60 * 24 * 60 * 60 * 1000,
        ).toISOString(); // 60 days ago
        const prescription = createPrescription(status, expirationDate);
        expect(isExpiredWithin120Days(prescription)).to.be.true;
      });

      it(`returns false when dispStatus is ${label} and expired over 120 days ago`, () => {
        const expirationDate = new Date(
          Date.now() - 150 * 24 * 60 * 60 * 1000,
        ).toISOString(); // 150 days ago
        const prescription = createPrescription(status, expirationDate);
        expect(isExpiredWithin120Days(prescription)).to.be.false;
      });
    });
  });

  describe('when status is expired/inactive (V2 statuses)', () => {
    const v2ExpiredStatuses = [
      { status: dispStatusObjV2.expired, label: 'dispStatusObjV2.expired' },
      { status: dispStatusObjV2.inactive, label: 'dispStatusObjV2.inactive' },
    ];

    v2ExpiredStatuses.forEach(({ status, label }) => {
      it(`returns true when dispStatus is ${label} and expired within 120 days`, () => {
        const expirationDate = new Date(
          Date.now() - 60 * 24 * 60 * 60 * 1000,
        ).toISOString(); // 60 days ago
        const prescription = createPrescription(status, expirationDate);
        expect(isExpiredWithin120Days(prescription)).to.be.true;
      });

      it(`returns false when dispStatus is ${label} and expired over 120 days ago`, () => {
        const expirationDate = new Date(
          Date.now() - 150 * 24 * 60 * 60 * 1000,
        ).toISOString(); // 150 days ago
        const prescription = createPrescription(status, expirationDate);
        expect(isExpiredWithin120Days(prescription)).to.be.false;
      });
    });
  });

  describe('when status is not expired/inactive', () => {
    const nonExpiredStatuses = [
      dispStatusObj.active,
      dispStatusObj.refillinprocess,
      dispStatusObj.submitted,
    ];

    nonExpiredStatuses.forEach(status => {
      it(`returns false when dispStatus is "${status}"`, () => {
        const expirationDate = new Date(
          Date.now() - 60 * 24 * 60 * 60 * 1000,
        ).toISOString();
        const prescription = createPrescription(status, expirationDate);
        expect(isExpiredWithin120Days(prescription)).to.be.false;
      });
    });
  });

  describe('edge cases', () => {
    it('returns false when expirationDate is null', () => {
      const prescription = createPrescription(dispStatusObj.expired, null);
      expect(isExpiredWithin120Days(prescription)).to.be.false;
    });

    it('returns false when expirationDate is undefined', () => {
      const prescription = { dispStatus: dispStatusObj.expired };
      expect(isExpiredWithin120Days(prescription)).to.be.false;
    });

    it('returns true when expired exactly 119 days ago', () => {
      const expirationDate = new Date(
        Date.now() - 119 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const prescription = createPrescription(
        dispStatusObj.expired,
        expirationDate,
      );
      expect(isExpiredWithin120Days(prescription)).to.be.true;
    });

    it('returns true when expired exactly 120 days ago (boundary)', () => {
      const expirationDate = new Date(
        Date.now() - 120 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const prescription = createPrescription(
        dispStatusObj.expired,
        expirationDate,
      );
      expect(isExpiredWithin120Days(prescription)).to.be.true;
    });

    it('returns false when expired exactly 121 days ago', () => {
      const expirationDate = new Date(
        Date.now() - 121 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const prescription = createPrescription(
        dispStatusObj.expired,
        expirationDate,
      );
      expect(isExpiredWithin120Days(prescription)).to.be.false;
    });

    it('returns false when expirationDate is an invalid string', () => {
      const prescription = createPrescription(
        dispStatusObj.expired,
        'invalid-date-string',
      );
      expect(isExpiredWithin120Days(prescription)).to.be.false;
    });

    it('returns false when expirationDate is in the future', () => {
      const futureDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(); // 30 days from now
      const prescription = createPrescription(
        dispStatusObj.expired,
        futureDate,
      );
      expect(isExpiredWithin120Days(prescription)).to.be.false;
    });
  });
});
