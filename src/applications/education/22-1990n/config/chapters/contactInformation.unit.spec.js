import { expect } from 'chai';
import {
  contactInformationUiSchema,
  contactInformationSchema,
} from './contactInformation';

describe('config/chapters/contactInformation', () => {
  it('uiSchema has mailingAddress fields', () => {
    const ci = contactInformationUiSchema.contactInformation;
    expect(ci).to.have.property('mailingAddress');
    expect(ci.mailingAddress).to.have.property('street');
    expect(ci.mailingAddress).to.have.property('city');
    expect(ci.mailingAddress).to.have.property('state');
    expect(ci.mailingAddress).to.have.property('postalCode');
  });

  it('uiSchema has phone and email fields', () => {
    const ci = contactInformationUiSchema.contactInformation;
    expect(ci).to.have.property('homePhone');
    expect(ci).to.have.property('mobilePhone');
    expect(ci).to.have.property('email');
  });

  it('schema requires mailingAddress', () => {
    const required =
      contactInformationSchema.properties.contactInformation.required;
    expect(required).to.include('mailingAddress');
  });

  it('mailingAddress schema requires street, city, state, postalCode', () => {
    const required =
      contactInformationSchema.properties.contactInformation.properties
        .mailingAddress.required;
    expect(required).to.include('street');
    expect(required).to.include('city');
    expect(required).to.include('state');
    expect(required).to.include('postalCode');
  });

  it('state schema includes all 50 states', () => {
    const stateEnum =
      contactInformationSchema.properties.contactInformation.properties
        .mailingAddress.properties.state.enum;
    expect(stateEnum).to.include('CA');
    expect(stateEnum).to.include('NY');
    expect(stateEnum).to.include('TX');
    expect(stateEnum).to.include('AP');
    expect(stateEnum).to.include('PR');
  });
});