import { expect } from 'chai';
import prefillTransformer from '../../../config/prefill-transformer';

describe('21-4502 prefill transformer', () => {
  it('maps the supported profile fields into the nested veteran object', () => {
    const pages = { intro: { path: 'introduction' } };
    const metadata = { version: 1 };

    const result = prefillTransformer(pages, {}, metadata, {
      user: {
        profile: {
          userFullName: {
            first: 'Test',
            middle: 'Q',
            last: 'User',
          },
          dob: '1985-03-15',
          email: 'test.user@example.com',
          vapContactInfo: {
            mobilePhone: '5551234567',
            workPhone: '5557654321',
            mailingAddress: {
              addressLine1: '123 Main St',
              addressLine2: 'Apt 4',
              city: 'Springfield',
              stateCode: 'VA',
              zipCode: '22150',
              countryCodeIso3: 'USA',
            },
          },
        },
      },
    });

    expect(result.pages).to.equal(pages);
    expect(result.metadata).to.equal(metadata);
    expect(result.formData.veteran.fullName).to.eql({
      first: 'Test',
      middle: 'Q',
      last: 'User',
    });
    expect(result.formData.veteran.dateOfBirth).to.equal('1985-03-15');
    expect(result.formData.veteran.ssn).to.equal('');
    expect(result.formData.veteran.email).to.equal('test.user@example.com');
    expect(result.formData.veteran.homePhone.contact).to.equal('5551234567');
    expect(result.formData.veteran.alternatePhone.contact).to.equal(
      '5557654321',
    );
    expect(result.formData.veteran.address).to.eql({
      street: '123 Main St',
      street2: 'Apt 4',
      city: 'Springfield',
      state: 'VA',
      postalCode: '22150',
      country: 'USA',
    });
  });

  it('falls back to secondary contact info phone and email fields', () => {
    const result = prefillTransformer(
      {},
      {},
      {},
      {
        user: {
          profile: {
            userFullName: {
              first: 'Casey',
              middle: '',
              last: 'Smith',
            },
            birthDate: '1984-02-20',
            vaProfile: {
              birthDate: '1984-01-01',
            },
            email: '',
            vapContactInfo: {
              workPhone: '5552223333',
              email: 'casey.smith@example.com',
              mailingAddress: {
                addressLine1: '456 Elm St',
                city: 'Denver',
                stateCode: 'CO',
                zipCode: '80202',
                countryCodeIso3: 'USA',
              },
            },
          },
        },
      },
    );

    expect(result.formData.veteran.fullName).to.eql({
      first: 'Casey',
      middle: '',
      last: 'Smith',
    });
    expect(result.formData.veteran.dateOfBirth).to.equal('1984-02-20');
    expect(result.formData.veteran.homePhone.contact).to.equal('5552223333');
    expect(result.formData.veteran.alternatePhone.contact).to.equal(
      '5552223333',
    );
    expect(result.formData.veteran.email).to.equal('casey.smith@example.com');
    expect(result.formData.veteran.address.street).to.equal('456 Elm St');
  });

  it('returns empty veteran prefill values when the supported profile fields are absent', () => {
    const result = prefillTransformer(
      {},
      {},
      { source: 'unit-test' },
      {
        user: {
          profile: {},
        },
      },
    );

    expect(result.metadata).to.eql({ source: 'unit-test' });
    expect(result.formData.veteran.fullName).to.eql({
      first: '',
      middle: '',
      last: '',
    });
    expect(result.formData.veteran.dateOfBirth).to.equal('');
    expect(result.formData.veteran.ssn).to.equal('');
    expect(result.formData.veteran.address).to.eql({
      street: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    });
    expect(result.formData.veteran.homePhone).to.equal(undefined);
    expect(result.formData.veteran.alternatePhone).to.equal(undefined);
    expect(result.formData.veteran.email).to.equal('');
  });

  it('preserves existing veteran form data instead of overwriting it', () => {
    const result = prefillTransformer(
      {},
      {
        veteran: {
          fullName: { first: 'Jane', middle: '', last: 'Doe' },
          email: 'jane@example.com',
          address: {
            street: 'Existing St',
            street2: 'Unit 9',
            city: 'Austin',
            state: 'TX',
            postalCode: '78701',
            country: 'USA',
          },
          homePhone: {
            callingCode: '1',
            contact: '5559991212',
            countryCode: 'US',
          },
        },
      },
      {},
      {
        user: {
          profile: {
            userFullName: {
              first: 'Test',
              middle: 'Q',
              last: 'User',
            },
            dob: '1985-03-15',
            email: 'test.user@example.com',
            vapContactInfo: {
              mobilePhone: '5551234567',
              mailingAddress: {
                addressLine1: '123 Main St',
                city: 'Springfield',
                stateCode: 'VA',
                zipCode: '22150',
                countryCodeIso3: 'USA',
              },
            },
          },
        },
      },
    );

    expect(result.formData.veteran.fullName.first).to.equal('Jane');
    expect(result.formData.veteran.fullName.last).to.equal('Doe');
    expect(result.formData.veteran.email).to.equal('jane@example.com');
    expect(result.formData.veteran.address.street).to.equal('Existing St');
    expect(result.formData.veteran.address.city).to.equal('Austin');
    expect(result.formData.veteran.homePhone.contact).to.equal('5559991212');
    expect(result.formData.veteran.dateOfBirth).to.equal('1985-03-15');
    expect(result.formData.veteran.ssn).to.equal('');
  });
});
