const emptyString = value => value || '';

const singleChar = value => (value ? String(value).slice(0, 1) : '');

const formatPhone = phoneObj => {
  if (!phoneObj) return '';
  if (typeof phoneObj === 'string') return phoneObj;
  const { areaCode, phoneNumber } = phoneObj;
  if (areaCode && phoneNumber) return `${areaCode}${phoneNumber}`;
  return phoneNumber || '';
};

export default function prefillTransformer(pages, formData, metadata, state) {
  const profile = state?.user?.profile || {};
  const vapContactInfo = profile?.vapContactInfo || {};
  const mailingAddress = vapContactInfo?.mailingAddress || {};
  const userFullName = profile?.userFullName || {};
  const vaProfile = profile?.vaProfile || {};

  const resolvedPhone =
    formData?.phone ||
    formatPhone(vapContactInfo?.mobilePhone) ||
    formatPhone(vapContactInfo?.homePhone) ||
    formatPhone(vapContactInfo?.workPhone);

  return {
    pages,
    formData: {
      ...formData,
      fullName: {
        first: emptyString(formData?.fullName?.first || userFullName.first),
        middle: singleChar(formData?.fullName?.middle || userFullName.middle),
        last: emptyString(formData?.fullName?.last || userFullName.last),
      },
      ssn: emptyString(formData?.ssn || profile?.ssn || vaProfile?.ssn),
      address: {
        street: emptyString(
          formData?.address?.street || mailingAddress.addressLine1,
        ),
        street2: emptyString(
          formData?.address?.street2 || mailingAddress.addressLine2,
        ),
        city: emptyString(formData?.address?.city || mailingAddress.city),
        state: emptyString(
          formData?.address?.state || mailingAddress.stateCode,
        ),
        postalCode: emptyString(
          formData?.address?.postalCode || mailingAddress.zipCode,
        ),
        country: emptyString(
          formData?.address?.country || mailingAddress.countryCodeIso3 || 'USA',
        ),
      },
      phone: emptyString(resolvedPhone),
      emailAddress: emptyString(
        formData?.emailAddress ||
          profile?.email ||
          vapContactInfo?.email?.emailAddress,
      ),
    },
    metadata,
  };
}
