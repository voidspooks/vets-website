import { expect } from 'chai';
import {
  educationObjectiveUiSchema,
  educationObjectiveSchema,
} from './educationObjective';

describe('chapters/educationObjective', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(educationObjectiveUiSchema).to.be.an('object');
    });

    it('has educationObjective textarea field', () => {
      const tp = educationObjectiveUiSchema.trainingProgram;
      expect(tp.educationObjective).to.be.an('object');
    });

    it('has highestRateAuthorization checkbox field', () => {
      const tp = educationObjectiveUiSchema.trainingProgram;
      expect(tp.highestRateAuthorization).to.be.an('object');
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(educationObjectiveSchema).to.be.an('object');
    });

    it('educationObjective has maxLength 500', () => {
      const eo =
        educationObjectiveSchema.properties.trainingProgram.properties
          .educationObjective;
      expect(eo.maxLength).to.equal(500);
    });

    it('educationObjective is not required (optional field)', () => {
      const tp = educationObjectiveSchema.properties.trainingProgram;
      expect(tp.required || []).to.not.include('educationObjective');
    });
  });
});