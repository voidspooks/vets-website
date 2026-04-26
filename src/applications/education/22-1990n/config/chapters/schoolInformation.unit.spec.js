import { expect } from 'chai';
import {
  schoolInformationUiSchema,
  schoolInformationSchema,
} from './schoolInformation';

describe('config/chapters/schoolInformation', () => {
  it('uiSchema has trainingProgram.schoolName', () => {
    expect(schoolInformationUiSchema).to.have.property('trainingProgram');
    expect(schoolInformationUiSchema.trainingProgram).to.have.property(
      'schoolName',
    );
  });

  it('uiSchema has trainingProgram.schoolAddress', () => {
    expect(schoolInformationUiSchema.trainingProgram).to.have.property(
      'schoolAddress',
    );
  });

  it('schema has trainingProgram with optional schoolName', () => {
    const props =
      schoolInformationSchema.properties.trainingProgram.properties;
    expect(props).to.have.property('schoolName');
    expect(props).to.have.property('schoolAddress');
  });

  it('schoolName is not required in schema (optional field)', () => {
    const required =
      schoolInformationSchema.properties.trainingProgram.required;
    // schoolName should NOT be in required since it is optional per PDF
    expect(required || []).not.to.include('schoolName');
  });

  it('schoolAddress has street, city, state, postalCode properties', () => {
    const addrProps =
      schoolInformationSchema.properties.trainingProgram.properties
        .schoolAddress.properties;
    expect(addrProps).to.have.property('street');
    expect(addrProps).to.have.property('city');
    expect(addrProps).to.have.property('state');
    expect(addrProps).to.have.property('postalCode');
  });
});