import { expect } from 'chai';
import prefillTransformer from '../../../config/prefill-transformer';

const run = (formData = {}, profile = {}) =>
  prefillTransformer([], formData, { m: 1 }, { user: { profile } });

describe('10-8678 prefillTransformer — branch coverage', () => {
  it('returns empty-string fields and defaults country to USA when state is missing', () => {
    const result = prefillTransformer([], {}, { m: 1 }, undefined);
    expect(result.formData.fullName).to.deep.equal({
      first: '',
      middle: '',
      last: '',
    });
    expect(result.formData.ssn).to.equal('');
    expect(result.formData.phone).to.equal('');
    expect(result.formData.emailAddress).to.equal('');
    expect(result.formData.address).to.deep.equal({
      street: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
    });
    expect(result.metadata).to.deep.equal({ m: 1 });
    expect(result.pages).to.deep.equal([]);
  });

  it('fills every field from profile when formData is empty (truncating middle to 1 char, using mailingAddress country)', () => {
    const result = run(
      {},
      {
        userFullName: { first: 'Jane', middle: 'Quincy', last: 'Doe' },
        ssn: '111-22-3333',
        email: 'profile@example.com',
        vapContactInfo: {
          mailingAddress: {
            addressLine1: '1 Elm',
            addressLine2: 'Apt 2',
            city: 'City',
            stateCode: 'VA',
            zipCode: '00001',
            countryCodeIso3: 'CAN',
          },
          mobilePhone: { areaCode: '555', phoneNumber: '1234567' },
        },
      },
    );
    expect(result.formData.fullName).to.deep.equal({
      first: 'Jane',
      middle: 'Q',
      last: 'Doe',
    });
    expect(result.formData.ssn).to.equal('111-22-3333');
    expect(result.formData.emailAddress).to.equal('profile@example.com');
    expect(result.formData.phone).to.equal('5551234567');
    expect(result.formData.address).to.deep.equal({
      street: '1 Elm',
      street2: 'Apt 2',
      city: 'City',
      state: 'VA',
      postalCode: '00001',
      country: 'CAN',
    });
  });

  it('prefers formData over every profile source', () => {
    const result = run(
      {
        fullName: { first: 'Form', middle: 'Middle', last: 'Name' },
        ssn: 'FORM-SSN',
        phone: '9998887777',
        emailAddress: 'form@example.com',
        address: {
          street: '1 Main',
          street2: 'Apt 2',
          city: 'MyCity',
          state: 'CA',
          postalCode: '94107',
          country: 'USA',
        },
      },
      {
        userFullName: { first: 'Profile', middle: 'P', last: 'X' },
        ssn: 'PROFILE',
        email: 'profile@example.com',
        vapContactInfo: {
          mobilePhone: { areaCode: '111', phoneNumber: '1111111' },
          email: { emailAddress: 'vap@example.com' },
          mailingAddress: {
            addressLine1: 'from-profile',
            countryCodeIso3: 'MEX',
          },
        },
      },
    );
    expect(result.formData.fullName).to.deep.equal({
      first: 'Form',
      middle: 'M',
      last: 'Name',
    });
    expect(result.formData.ssn).to.equal('FORM-SSN');
    expect(result.formData.phone).to.equal('9998887777');
    expect(result.formData.emailAddress).to.equal('form@example.com');
    expect(result.formData.address.street).to.equal('1 Main');
    expect(result.formData.address.country).to.equal('USA');
  });

  it('falls through mobile → home → work phones and supports bare strings / empty objects', () => {
    expect(
      run({}, { vapContactInfo: { mobilePhone: '5550001111' } }).formData.phone,
    ).to.equal('5550001111');

    expect(
      run({}, { vapContactInfo: { homePhone: { phoneNumber: '2222222222' } } })
        .formData.phone,
    ).to.equal('2222222222');

    expect(
      run(
        {},
        {
          vapContactInfo: {
            workPhone: { areaCode: '333', phoneNumber: '3333333' },
          },
        },
      ).formData.phone,
    ).to.equal('3333333333');

    expect(
      run(
        {},
        { vapContactInfo: { mobilePhone: {}, homePhone: {}, workPhone: {} } },
      ).formData.phone,
    ).to.equal('');
  });

  it('falls back to vaProfile.ssn when profile.ssn is absent', () => {
    expect(
      run({}, { vaProfile: { ssn: '444-55-6666' } }).formData.ssn,
    ).to.equal('444-55-6666');
  });

  it('falls back to vapContactInfo.email when profile.email is absent', () => {
    expect(
      run(
        {},
        { vapContactInfo: { email: { emailAddress: 'vap@example.com' } } },
      ).formData.emailAddress,
    ).to.equal('vap@example.com');
  });

  it('returns empty middle when neither formData nor profile provide one', () => {
    const result = run({ fullName: { first: 'A', last: 'B' } });
    expect(result.formData.fullName.middle).to.equal('');
  });
});
