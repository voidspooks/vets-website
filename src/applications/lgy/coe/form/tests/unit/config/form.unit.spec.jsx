import { expect } from 'chai';
import formConfig from '../../../config/form';
import {
  certificateUseOptions,
  serviceStatuses,
  TOGGLE_KEY,
} from '../../../constants';

const viewKey = `view:${TOGGLE_KEY}`;

describe('COE form config Step 1 name page', () => {
  const { pages } = formConfig.chapters.applicantInformationChapter;

  it('shows nameOnCoe page when rebuild flag is enabled', () => {
    expect(pages.nameOnCoe.depends({ [viewKey]: true })).to.equal(true);
  });

  it('hides nameOnCoe page when rebuild flag is disabled', () => {
    expect(pages.nameOnCoe.depends({ [viewKey]: false })).to.equal(false);
  });
});

describe('COE form config Step 2 conditional pages', () => {
  const { pages } = formConfig.chapters.serviceHistoryChapter;

  it('shows pre-discharge and purple heart pages only for ADSM when flag is enabled', () => {
    const formData = {
      'view:coeFormRebuildCveteam': true,
      identity: serviceStatuses.ADSM,
    };
    expect(pages.pendingPredischargeClaimPage.depends(formData)).to.equal(true);
    expect(pages.purpleHeartRecipientPage.depends(formData)).to.equal(true);
  });

  it('skips pre-discharge and purple heart pages for non-ADSM when flag is enabled', () => {
    const formData = {
      'view:coeFormRebuildCveteam': true,
      identity: serviceStatuses.VETERAN,
    };
    expect(pages.pendingPredischargeClaimPage.depends(formData)).to.equal(
      false,
    );
    expect(pages.purpleHeartRecipientPage.depends(formData)).to.equal(false);
  });

  it('skips pre-discharge and purple heart pages when flag is disabled, regardless of identity', () => {
    const formData = {
      'view:coeFormRebuildCveteam': false,
      identity: serviceStatuses.ADSM,
    };
    expect(pages.pendingPredischargeClaimPage.depends(formData)).to.equal(
      false,
    );
    expect(pages.purpleHeartRecipientPage.depends(formData)).to.equal(false);
  });

  it('still shows disability separation page when flag is enabled', () => {
    const formData = {
      'view:coeFormRebuildCveteam': true,
      identity: serviceStatuses.VETERAN,
    };
    expect(pages.disabilitySeparationPage.depends(formData)).to.equal(true);
  });
});

describe('COE form config loans chapter (Step 3 / certificate use)', () => {
  const { pages } = formConfig.chapters.loansChapter;
  const { pages: documentPages } = formConfig.chapters.documentsChapter;

  describe('Step 3 flow (acceptance criteria)', () => {
    it('shows Certificate use only when the rebuild experience is on (not tied to other loan fields)', () => {
      expect(pages.certificateUse.depends({ [viewKey]: true })).to.equal(true);
      expect(pages.certificateUse.depends({ [viewKey]: false })).to.equal(
        false,
      );
    });

    it('always shows Have you used the VA home loan program before next: no depends on certificate use answer', () => {
      const toggleOnly = { [viewKey]: true, loanHistory: {} };
      expect(pages.hadPriorLoans.depends(toggleOnly)).to.equal(true);

      Object.values(certificateUseOptions).forEach(use => {
        const formData = {
          [viewKey]: true,
          loanHistory: { certificateUse: use },
        };
        expect(pages.hadPriorLoans.depends(formData)).to.equal(
          true,
          `expected hadPriorLoans page for certificateUse=${use}`,
        );
      });
    });

    it('after yes to prior VA loans, shows the property-with-VA-loan question (summary page)', () => {
      const formData = {
        [viewKey]: true,
        loanHistory: {
          certificateUse: certificateUseOptions.HOME_PURCHASE,
          hadPriorLoans: true,
        },
      };
      expect(pages.propertiesHomeLoansSummary.depends(formData)).to.equal(true);
    });

    it('after no to prior VA loans, does not show the property loop (user proceeds toward Step 4)', () => {
      const formData = {
        [viewKey]: true,
        loanHistory: {
          certificateUse: certificateUseOptions.HOME_PURCHASE,
          hadPriorLoans: false,
        },
      };
      expect(pages.propertiesHomeLoansSummary.depends(formData)).to.equal(
        false,
      );
    });

    it('does not show the property loop until hadPriorLoans is answered yes', () => {
      const formData = {
        [viewKey]: true,
        loanHistory: {
          certificateUse:
            certificateUseOptions.INTEREST_RATE_REDUCTION_REFINANCE,
        },
      };
      expect(pages.propertiesHomeLoansSummary.depends(formData)).to.not.be.ok;
    });

    it('shows Step 4 upload (rebuild) when rebuild is on, including when user had no prior VA loans', () => {
      const noPriorLoans = {
        [viewKey]: true,
        loanHistory: { hadPriorLoans: false },
      };
      expect(documentPages.upload2.depends(noPriorLoans)).to.equal(true);

      const withPriorLoans = {
        [viewKey]: true,
        loanHistory: { hadPriorLoans: true },
      };
      expect(documentPages.upload2.depends(withPriorLoans)).to.equal(true);
    });
  });

  it('shows Previous VA home loans after certificate use for IRRRL (not only other certificate uses)', () => {
    const formData = {
      [viewKey]: true,
      loanHistory: {
        certificateUse: certificateUseOptions.INTEREST_RATE_REDUCTION_REFINANCE,
      },
    };
    expect(pages.hadPriorLoans.depends(formData)).to.equal(true);
  });

  it('does not show the VA home loan property loop until hadPriorLoans is answered yes', () => {
    const formData = {
      [viewKey]: true,
      loanHistory: {
        certificateUse: certificateUseOptions.INTEREST_RATE_REDUCTION_REFINANCE,
      },
    };
    expect(pages.propertiesHomeLoansSummary.depends(formData)).to.not.be.ok;
  });
});
