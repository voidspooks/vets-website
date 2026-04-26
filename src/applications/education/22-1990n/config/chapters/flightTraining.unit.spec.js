import { expect } from 'chai';
import {
  flightTrainingUiSchema,
  flightTrainingSchema,
} from './flightTraining';

describe('chapters/flightTraining', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(flightTrainingUiSchema).to.be.an('object');
    });

    it('has hasPrivatePilotLicense and isATPCourse fields', () => {
      const ft = flightTrainingUiSchema.trainingProgram.flightTraining;
      expect(ft.hasPrivatePilotLicense).to.be.an('object');
      expect(ft.isATPCourse).to.be.an('object');
    });

    it('hasPrivatePilotLicense has ui:required returning true', () => {
      const ft = flightTrainingUiSchema.trainingProgram.flightTraining;
      expect(ft.hasPrivatePilotLicense['ui:required']).to.be.a('function');
      expect(ft.hasPrivatePilotLicense['ui:required']()).to.be.true;
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(flightTrainingSchema).to.be.an('object');
    });

    it('has flightTraining under trainingProgram', () => {
      const tp = flightTrainingSchema.properties.trainingProgram;
      expect(tp.properties.flightTraining).to.be.an('object');
    });

    it('flightTraining has hasPrivatePilotLicense and isATPCourse', () => {
      const ft =
        flightTrainingSchema.properties.trainingProgram.properties
          .flightTraining;
      expect(ft.properties.hasPrivatePilotLicense).to.be.an('object');
      expect(ft.properties.isATPCourse).to.be.an('object');
    });
  });
});