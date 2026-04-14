import { certifierRoleIs } from './signer';
import { formValue, not } from './form-config';

export const isSponsor = certifierRoleIs('sponsor');
export const isNotSponsor = not(isSponsor);

export const sponsorIsDeceased = formData =>
  isNotSponsor(formData) && Boolean(formValue('sponsorIsDeceased')(formData));

export const sponsorIsNotDeceased = not(sponsorIsDeceased);

export const hasSponsorAddress = formData =>
  Boolean(formValue('sponsorAddress.street')(formData));
