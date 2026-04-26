import { expect } from 'chai';
import {
  trainingTypeUiSchema,
  trainingTypeSchema,
} from './trainingType';

describe('chapters/trainingType', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(trainingTypeUiSchema).to.be.an('object');
    });

    it('has trainingProgram.trainingType key', () => {
      expect(trainingTypeUiSchema.trainingProgram).to.be.an('object');
      expect(trainingTypeUiSchema.trainingProgram.trainingType).to.be.an(
        'object',
      );
    });

    it('trainingType has all six options', () => {
      const trainingType =
        trainingTypeUiSchema.trainingProgram.trainingType;
      const labels = trainingType['ui:options']?.labels || {};
      expect(labels).to.have.property('collegeOrSchool');
      expect(labels).to.have.property('apprenticeshipOJT');
      expect(labels).to.have.property('vocationalFlightTraining');
      expect(labels).to.have.property('correspondence');
      expect(labels).to.have.property('nationalTestReimbursement');
      expect(labels).to.have.property('licensingCertificationTest');
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(trainingTypeSchema).to.be.an('object');
    });

    it('trainingProgram is required', () => {
      expect(trainingTypeSchema.required).to.include('trainingProgram');
    });

    it('trainingType is required inside trainingProgram', () => {
      const tp = trainingTypeSchema.properties.trainingProgram;
      expect(tp.required).to.include('trainingType');
    });

    it('trainingType schema is an object type', () => {
      const trainingType =
        trainingTypeSchema.properties.trainingProgram.properties.trainingType;
      expect(trainingType).to.be.an('object');
      expect(trainingType.type).to.equal('object');
    });
  });
});