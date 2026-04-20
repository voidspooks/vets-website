import content from '../locales/en/content.json';
import { isNewSubmission, not, roleIsOther, whenAll } from '../utils/helpers';
import { applicantPages } from './applicant';
import { applicationStatusPages } from './applicationStatus';
import { certifierPages } from './certifier';
import { healthInsurancePages } from './healthInsurance';
import { medicarePages } from './medicare';
import { sponsorPages } from './sponsor';
import { supplementalPages } from './supplementalInfo';

export const chapters = {
  applicationStatus: {
    title: content['eligibility--chapter-title'],
    pages: applicationStatusPages,
  },
  supplementalInformation: {
    title: content['supplemental--chapter-title'],
    pages: supplementalPages,
    depends: not(isNewSubmission),
  },
  sponsorInformation: {
    title: content['sponsor--chapter-title'],
    pages: sponsorPages,
    depends: isNewSubmission,
  },
  applicantInformation: {
    title: content['applicants--chapter-title'],
    pages: applicantPages,
    depends: isNewSubmission,
  },
  medicareInformation: {
    title: content['medicare--chapter-title'],
    pages: medicarePages,
    depends: isNewSubmission,
  },
  healthInsuranceInformation: {
    title: content['health-insurance--chapter-title'],
    pages: healthInsurancePages,
    depends: isNewSubmission,
  },
  certifierInformation: {
    title: content['certifier--chapter-title'],
    pages: certifierPages,
    depends: whenAll(isNewSubmission, roleIsOther),
  },
};
