import { expect } from 'chai';
import sinon from 'sinon';
import * as helpers from 'platform/forms-system/src/js/helpers';
import { customCOEsubmit, getLoanIntent } from '../../config/helpers';
import { LOAN_INTENT, serviceStatuses, TOGGLE_KEY } from '../../constants';

const form = {
  data: {
    periodsOfService: [
      { dateRange: { from: '2010-10-10', to: '2012-12-12' } },
      { dateRange: { from: '2020-03-03', to: '2021-XX-XX' } },
      { dateRange: { from: '2020-03-03', to: '' } },
      { dateRange: { from: '2020-03-03', to: '2021' } },
    ],
    relevantPriorLoans: [
      {
        dateRange: { from: '1990-01-XX', to: '1992-XX-XX' },
        vaLoanNumber: '1-2-3456789012',
      },
      {
        dateRange: { from: '1990-01-XX', to: '' },
        vaLoanNumber: '1-2-3456789013',
      },
      {
        dateRange: { from: '1990-01-XX', to: '2020' },
        vaLoanNumber: '1-2-3456789014',
      },
    ],
  },
};

let sandbox;

beforeEach(() => {
  sandbox = sinon.sandbox.create();
});

afterEach(() => {
  sandbox.restore();
});

describe('customCOEsubmit', () => {
  it('should correctly format the form data', () => {
    const res = JSON.parse(customCOEsubmit({}, form));
    const formData = JSON.parse(res.lgyCoeClaim.form);

    // periodsOfService dates should be converted to ISO strings
    expect(formData.periodsOfService[0].dateRange.from).to.equal(
      '2010-10-10T00:00:00.000Z',
    );
    expect(formData.periodsOfService[0].dateRange.to).to.equal(
      '2012-12-12T00:00:00.000Z',
    );
    expect(formData.periodsOfService[2].dateRange.to).to.equal('');
    expect(formData.periodsOfService[3].dateRange.to).to.equal(
      '2021-01-01T00:00:00.000Z',
    );

    // When day and month values are missing from a service "to" date, they should default to 01
    expect(formData.periodsOfService[1].dateRange.to).to.equal(
      '2021-01-01T00:00:00.000Z',
    );

    // When day and month values are missing from a loan "to" date, they should default to 01
    expect(formData.relevantPriorLoans[0].dateRange.to).to.equal(
      '1992-01-01T00:00:00.000Z',
    );
    expect(formData.relevantPriorLoans[1].dateRange.to).to.equal('');
    expect(formData.relevantPriorLoans[2].dateRange.to).to.equal(
      '2020-01-01T00:00:00.000Z',
    );

    // vaLoanNumber with no value should be empty string
    expect(formData.relevantPriorLoans[0].vaLoanNumber).to.equal(
      '123456789012',
    );
  });

  it('sets version to 2 when the toggle view key is truthy', () => {
    const viewKey = `view:${TOGGLE_KEY}`;
    const formWithToggle = {
      data: {
        [viewKey]: true,
        periodsOfService: [],
        relevantPriorLoans: [],
      },
    };

    sandbox
      .stub(helpers, 'transformForSubmit')
      .callsFake((_, formattedForm) => formattedForm);

    const res = customCOEsubmit({}, formWithToggle);
    const outer = JSON.parse(res);
    const inner = outer.lgyCoeClaim.form;

    expect(inner.data.version).to.equal(2);
  });

  it('sets version to 1 when the toggle view key is falsy', () => {
    const viewKey = `view:${TOGGLE_KEY}`;
    const formWithToggle = {
      data: {
        [viewKey]: false,
        periodsOfService: [],
        relevantPriorLoans: [],
      },
    };

    sandbox
      .stub(helpers, 'transformForSubmit')
      .callsFake((_, formattedForm) => formattedForm);

    const res = customCOEsubmit({}, formWithToggle);
    const outer = JSON.parse(res);
    const inner = outer.lgyCoeClaim.form;

    expect(inner.data.version).to.equal(1);
  });

  describe('when the v2 toggle is on', () => {
    const viewKey = `view:${TOGGLE_KEY}`;

    const buildV2Form = (overrides = {}) => ({
      data: {
        [viewKey]: true,
        fullName: { first: 'Jane', middle: 'Q', last: 'Veteran' },
        veteran: {
          mailingAddress: { street1: '1 Main', city: 'Town', state: 'VA' },
          email: {
            emailAddress: 'jane@example.com',
            confirmEmail: 'jane@example.com',
          },
          homePhone: { phoneNumber: '5555555555', phoneNumberExt: '123' },
        },
        identity: serviceStatuses.VETERAN,
        militaryHistory: {
          separatedDueToDisability: true,
          preDischargeClaim: true,
          purpleHeartRecipient: false,
        },
        periodsOfService: [
          {
            serviceBranch: 'ARMY',
            dateRange: { from: '2010-10-10', to: '2012-XX-XX' },
          },
        ],
        loanHistory: {
          certificateUse: 'HOME_PURCHASE',
          hadPriorLoans: true,
        },
        relevantPriorLoans: [
          {
            propertyAddress: { street1: '2 Oak', city: 'City', state: 'VA' },
            loanDate: '2001-05-XX',
            vaLoanNumber: '12-3456-7890-12',
            entitlementRestoration: 'CASH_OUT_REFINANCE',
            naturalDisaster: { affected: true, dateOfLoss: '2005-08-XX' },
          },
        ],
        files2: [{ name: 'dd214.pdf', size: 1024 }],
        ...overrides,
      },
    });

    beforeEach(() => {
      sandbox
        .stub(helpers, 'transformForSubmit')
        .callsFake((_, formattedForm) => formattedForm);
    });

    const submitV2 = overrides => {
      const res = customCOEsubmit({}, buildV2Form(overrides));
      return JSON.parse(res).lgyCoeClaim.form.data;
    };

    it('whitelists only v2 top-level keys', () => {
      const data = submitV2();

      expect(Object.keys(data).sort()).to.deep.equal(
        [
          'files2',
          'fullName',
          'identity',
          'loanHistory',
          'militaryHistory',
          'periodsOfService',
          'relevantPriorLoans',
          'veteran',
          'version',
          `view:${TOGGLE_KEY}`,
        ].sort(),
      );
    });

    it('keeps the outer envelope and sets version to 2', () => {
      const res = customCOEsubmit({}, buildV2Form());
      const outer = JSON.parse(res);

      expect(outer).to.have.all.keys('lgyCoeClaim');
      expect(outer.lgyCoeClaim.form.data.version).to.equal(2);
    });

    it('passes the veteran object through as-is', () => {
      const data = submitV2();

      expect(data.veteran.email.confirmEmail).to.equal('jane@example.com');
      expect(data.veteran.homePhone.phoneNumberExt).to.equal('123');
    });

    it('omits preDischargeClaim and purpleHeartRecipient when identity is not ADSM', () => {
      const data = submitV2();

      expect(data.militaryHistory.separatedDueToDisability).to.equal(true);
      expect(data.militaryHistory).to.not.have.property('preDischargeClaim');
      expect(data.militaryHistory).to.not.have.property('purpleHeartRecipient');
    });

    it('includes preDischargeClaim and purpleHeartRecipient when identity is ADSM', () => {
      const data = submitV2({ identity: serviceStatuses.ADSM });

      expect(data.militaryHistory.preDischargeClaim).to.equal(true);
      expect(data.militaryHistory.purpleHeartRecipient).to.equal(false);
    });

    it('ISO-transforms periodsOfService dates including XX placeholders', () => {
      const data = submitV2();

      expect(data.periodsOfService[0].dateRange.from).to.equal(
        '2010-10-10T00:00:00.000Z',
      );
      expect(data.periodsOfService[0].dateRange.to).to.equal(
        '2012-01-01T00:00:00.000Z',
      );
    });

    it('transforms relevantPriorLoans: ISO loanDate, stripped vaLoanNumber, ISO dateOfLoss when affected', () => {
      const data = submitV2();
      const loan = data.relevantPriorLoans[0];

      expect(loan.loanDate).to.equal('2001-05-01T00:00:00.000Z');
      expect(loan.vaLoanNumber).to.equal('123456789012');
      expect(loan.naturalDisaster.affected).to.equal(true);
      expect(loan.naturalDisaster.dateOfLoss).to.equal(
        '2005-08-01T00:00:00.000Z',
      );
      expect(loan).to.not.have.property('dateRange');
      expect(loan).to.not.have.property('intent');
    });

    it('omits dateOfLoss when naturalDisaster.affected is false', () => {
      const data = submitV2({
        relevantPriorLoans: [
          {
            propertyAddress: { street1: '2 Oak' },
            loanDate: '2001-05-XX',
            vaLoanNumber: '123456789012',
            entitlementRestoration: 'REGULAR_RESTORATION',
            naturalDisaster: { affected: false, dateOfLoss: '2005-08-XX' },
          },
        ],
      });

      expect(data.relevantPriorLoans[0].naturalDisaster.affected).to.equal(
        false,
      );
      expect(data.relevantPriorLoans[0].naturalDisaster).to.not.have.property(
        'dateOfLoss',
      );
    });

    it('returns an empty relevantPriorLoans array when hadPriorLoans is false, even with stale items', () => {
      const data = submitV2({
        loanHistory: { certificateUse: 'HOME_PURCHASE', hadPriorLoans: false },
        relevantPriorLoans: [
          {
            propertyAddress: { street1: 'stale' },
            loanDate: '1999-01-XX',
            vaLoanNumber: '999999999999',
          },
        ],
      });

      expect(data.relevantPriorLoans).to.deep.equal([]);
    });

    it('passes files2 through unchanged', () => {
      const data = submitV2();
      expect(data.files2).to.deep.equal([{ name: 'dd214.pdf', size: 1024 }]);
    });
  });
});

describe('getLoanIntent', () => {
  it('should return the loan intent object based on the value', () => {
    Object.keys(LOAN_INTENT).forEach(type => {
      const obj = getLoanIntent(LOAN_INTENT[type].value);
      expect(obj).to.deep.equal(LOAN_INTENT[type]);
    });
  });
});
