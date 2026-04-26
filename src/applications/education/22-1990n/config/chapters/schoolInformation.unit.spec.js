import { expect } from 'chai';
import {
  schoolInformationUiSchema,
  schoolInformationSchema,
} from './schoolInformation';

describe('chapters/schoolInformation', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(schoolInformationUiSchema).to.be.an('object');
    });

    it('has schoolName and schoolAddress fields', () => {
      const tp = schoolInformationUiSchema.trainingProgram;
      expect(tp.schoolName).to.be.an('object');
      expect(tp.schoolAddress).to.be.an('object');
    });

    it('schoolAddress has street, city, state, postalCode', () => {
      const addr = schoolInformationUiSchema.trainingProgram.schoolAddress;
      expect(addr.street).to.be.an('object');
      expect(addr.city).to.be.an('object');
      expect(addr.state).to.be.an('object');
      expect(addr.postalCode).to.be.an('object');
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(schoolInformationSchema).to.be.an('object');
    });

    it('schoolName is not required (optional field)', () => {
      const tp = schoolInformationSchema.properties.trainingProgram;
      expect(tp.required || []).to.not.include('schoolName');
    });

    it('schoolName has maxLength 100', () => {
      const schoolName =
        schoolInformationSchema.properties.trainingProgram.properties
          .schoolName;
      expect(schoolName.maxLength).to.equal(100);
    });
  });
});