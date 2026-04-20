import {
  isEnrollmentSubmission,
  isExistingSubmission,
} from '../../utils/helpers';
import applicantInformation from './applicantInformation';
import applicantMemberNumber from './applicantMemberNumber';
import healthInsurance from './healthInsurance';
import sectionOverview from './sectionOverview';
import sponsorInformation from './sponsorInformation';
import sponsorSsn from './sponsorSsn';
import supportingDocs from './supportingDocs';

export const supplementalPages = {
  supplementalOhi: {
    path: 'additional-health-insurance',
    title: 'Other health insurance information',
    ...healthInsurance,
  },
  supplementalOverview: {
    path: 'update-overview',
    title: 'Supporting information',
    ...sectionOverview,
  },
  supplementalApplicantPersonalInfo: {
    path: 'beneficiary-name-and-date-of-birth',
    title: 'Applicant or beneficiary name and date of birth',
    ...applicantInformation,
  },
  supplementalApplicantMemberNumber: {
    path: 'beneficiary-champva-member-number',
    title: 'Beneficiary’s CHAMPVA information',
    depends: isEnrollmentSubmission,
    ...applicantMemberNumber,
  },
  supplementalSponsorPersonalInfo: {
    path: 'sponsor-name-and-date-of-birth',
    title: `Veteran’s name and date of birth`,
    depends: isExistingSubmission,
    ...sponsorInformation,
  },
  supplementalSponsorIdentityInfo: {
    path: 'sponsor-identification-number',
    title: 'Veteran’s identification information',
    depends: isExistingSubmission,
    ...sponsorSsn,
  },
  supplementalDocsUpload: {
    path: 'supporting-documents',
    title: 'Supporting documents',
    ...supportingDocs,
  },
};
