import applicantInformation from './applicantInformation';
import applicantMemberNumber from './applicantMemberNumber';
import healthInsurance from './healthInsurance';
import sectionOverview from './sectionOverview';
import sponsorInformation from './sponsorInformation';
import sponsorSsn from './sponsorSsn';
import supportingDocs from './supportingDocs';

export const supplementalPages = {
  supplementalOhi: {
    path: 'supporting-insurance-information',
    title: 'Other health insurance information',
    ...healthInsurance,
  },
  supplementalOverview: {
    path: 'supporting-information-overview',
    title: 'Supporting information',
    ...sectionOverview,
  },
  supplementalApplicantPersonalInfo: {
    path: 'supporting-applicant-or-beneficiary-personal-information',
    title: 'Applicant or beneficiary’s name and date of birth',
    ...applicantInformation,
  },
  supplementalApplicantMemberNumber: {
    path: 'supporting-beneficiary-champva-information',
    title: 'Beneficiary’s CHAMPVA information',
    ...applicantMemberNumber,
  },
  supplementalSponsorPersonalInfo: {
    path: 'supporting-sponsor-personal-information',
    title: `Veteran’s name and date of birth`,
    ...sponsorInformation,
  },
  supplementalSponsorIdentityInfo: {
    path: 'supporting-sponsor-identity-information',
    title: 'Veteran’s identification information',
    ...sponsorSsn,
  },
  supplementalDocsUpload: {
    path: 'supporting-documents-upload',
    title: 'Supporting documents',
    ...supportingDocs,
  },
};
