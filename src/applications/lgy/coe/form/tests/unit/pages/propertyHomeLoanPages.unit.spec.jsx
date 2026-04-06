import { expect } from 'chai';
import { propertiesHomeLoansPages } from '../../../pages/propertiesHomeLoansPages';

describe('COE VA home loans array builder pages', () => {
  it('includes summary and item pages', () => {
    expect(propertiesHomeLoansPages).to.have.property(
      'propertiesHomeLoansSummary',
    );
    expect(propertiesHomeLoansPages).to.have.property(
      'propertyHomeLoanAddressPage',
    );
    expect(propertiesHomeLoansPages).to.have.property(
      'propertyHomeLoanDetailsPage',
    );
    expect(propertiesHomeLoansPages).to.have.property(
      'propertyHomeLoanEntitlementRestorationPage',
    );
    expect(propertiesHomeLoansPages).to.have.property(
      'propertyHomeLoanDisasterDamagePage',
    );
  });

  it('uses the rebuild paths', () => {
    expect(propertiesHomeLoansPages.propertiesHomeLoansSummary.path).to.equal(
      'relevant-prior-loans-summary',
    );
    expect(propertiesHomeLoansPages.propertyHomeLoanAddressPage.path).to.equal(
      'relevant-prior-loans/:index/property-address',
    );
    expect(propertiesHomeLoansPages.propertyHomeLoanDetailsPage.path).to.equal(
      'relevant-prior-loans/:index/loan-details',
    );
    expect(
      propertiesHomeLoansPages.propertyHomeLoanEntitlementRestorationPage.path,
    ).to.equal('relevant-prior-loans/:index/entitlement-restoration');
    expect(
      propertiesHomeLoansPages.propertyHomeLoanDisasterDamagePage.path,
    ).to.equal('relevant-prior-loans/:index/disaster-damage');
  });

  const pageKeys = [
    'propertiesHomeLoansSummary',
    'propertyHomeLoanAddressPage',
    'propertyHomeLoanDetailsPage',
    'propertyHomeLoanEntitlementRestorationPage',
    'propertyHomeLoanDisasterDamagePage',
  ];

  it('shows array builder pages when rebuild toggle is on and hadPriorLoans is yes', () => {
    const showLoop = {
      'view:coeFormRebuildCveteam': true,
      loanHistory: {
        hadPriorLoans: true,
      },
    };

    pageKeys.forEach(key => {
      expect(propertiesHomeLoansPages[key].depends(showLoop)).to.equal(true);
    });
  });

  it('skips array builder pages when rebuild toggle is on but hadPriorLoans is no', () => {
    const skipNoPriorLoans = {
      'view:coeFormRebuildCveteam': true,
      loanHistory: { hadPriorLoans: false },
    };

    pageKeys.forEach(key => {
      expect(propertiesHomeLoansPages[key].depends(skipNoPriorLoans)).to.equal(
        false,
      );
    });
  });

  it('skips array builder pages when rebuild toggle is on but hadPriorLoans is unset', () => {
    const skipUnsetPriorLoans = {
      'view:coeFormRebuildCveteam': true,
      loanHistory: {},
    };

    pageKeys.forEach(key => {
      // `true && undefined` is undefined; depends treats any non-true value as skip
      expect(propertiesHomeLoansPages[key].depends(skipUnsetPriorLoans)).to.not
        .ok;
    });
  });

  it('skips array builder pages when the rebuild toggle is off', () => {
    const skipLoopFlagOff = {
      'view:coeFormRebuildCveteam': false,
      loanHistory: { hadPriorLoans: true },
    };

    pageKeys.forEach(key => {
      expect(propertiesHomeLoansPages[key].depends(skipLoopFlagOff)).to.equal(
        false,
      );
    });
  });
});
