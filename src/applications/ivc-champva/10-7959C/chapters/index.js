import { applicantPages } from './applicant';
import { certifierPages } from './certifier';
import { medicarePages } from './medicare';
import { healthInsurancePages } from './healthInsurance';

export const chapters = {
  certifierInformation: {
    title: 'Signer information',
    pages: certifierPages,
  },
  beneficiaryInformation: {
    title: 'Beneficiary information',
    pages: applicantPages,
  },
  medicareInformation: {
    title: 'Medicare information',
    pages: medicarePages,
  },
  healthcareInformation: {
    title: 'Health insurance information',
    pages: healthInsurancePages,
  },
};
