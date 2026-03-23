export default function prefillTransformer(pages, formData, metadata) {
  return {
    metadata,
    formData: {
      applicantName: {
        first: formData.applicantName.first,
        middle: formData.applicantName.middle,
        last: formData.applicantName.last,
      },
      ssn: formData.ssn,
      ssnLast4: formData.ssn ? formData.ssn.slice(-4) : null,
      vaFileNumber: formData.vaFileNumber,
      vaFileNumberLast4: formData.vaFileNumber
        ? formData.vaFileNumber.slice(-4)
        : null,
    },
    pages,
  };
}
