import { veteranFields } from '../definitions/constants';

const buildPhoneValue = phoneNum =>
  phoneNum
    ? {
        callingCode: '',
        contact: phoneNum,
        countryCode: '',
      }
    : undefined;

export default function prefillTransformer(pages, formData, metadata, state) {
  const profile = state?.user?.profile || {};
  const vaProfile = profile?.vaProfile || {};
  const existingVeteran = formData?.[veteranFields.parentObject] || {};

  let fullName = {};
  if (existingVeteran?.[veteranFields.fullName]) {
    fullName = existingVeteran[veteranFields.fullName];
  } else {
    fullName.first = profile?.userFullName?.first || '';
    fullName.middle = profile?.userFullName?.middle || '';
    fullName.last = profile?.userFullName?.last || '';
  }

  const dateOfBirth =
    existingVeteran?.[veteranFields.dateOfBirth] ||
    profile.dob ||
    profile.birthDate ||
    vaProfile.birthDate ||
    '';

  const ssn = existingVeteran?.[veteranFields.ssn] || '';

  const phoneNum =
    existingVeteran?.[veteranFields.homePhone]?.contact ||
    profile?.vapContactInfo?.mobilePhone ||
    profile?.vapContactInfo?.workPhone ||
    '';
  const homePhone = buildPhoneValue(phoneNum);

  const alternatePhoneNum =
    existingVeteran?.[veteranFields.alternatePhone]?.contact ||
    profile?.vapContactInfo?.workPhone ||
    '';
  const alternatePhone = buildPhoneValue(alternatePhoneNum);

  const email =
    existingVeteran?.[veteranFields.email] ||
    profile?.email ||
    profile?.vapContactInfo?.email ||
    '';

  let address = {};
  if (existingVeteran?.[veteranFields.address]) {
    address = existingVeteran[veteranFields.address];
  } else {
    address.street =
      profile?.vapContactInfo?.mailingAddress?.addressLine1 || '';
    address.street2 =
      profile?.vapContactInfo?.mailingAddress?.addressLine2 || '';
    address.city = profile?.vapContactInfo?.mailingAddress?.city || '';
    address.state = profile?.vapContactInfo?.mailingAddress?.stateCode || '';
    address.country =
      profile?.vapContactInfo?.mailingAddress?.countryCodeIso3 || '';
    address.postalCode = profile?.vapContactInfo?.mailingAddress?.zipCode || '';
  }

  return {
    pages,
    formData: {
      ...formData,
      [veteranFields.parentObject]: {
        ...existingVeteran,
        [veteranFields.fullName]: fullName,
        [veteranFields.dateOfBirth]: dateOfBirth,
        [veteranFields.ssn]: ssn,
        [veteranFields.address]: address,
        [veteranFields.homePhone]: homePhone,
        [veteranFields.alternatePhone]: alternatePhone,
        [veteranFields.email]: email,
      },
    },
    metadata,
  };
}
