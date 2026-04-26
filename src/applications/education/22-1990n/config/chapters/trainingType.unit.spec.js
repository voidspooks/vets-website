import { expect } from 'chai';
import {
  trainingTypeUiSchema,
  trainingTypeSchema,
} from './trainingType';

describe('config/chapters/trainingType', () => {
  it('uiSchema has trainingProgram.trainingType', () => {
    expect(trainingTypeUiSchema).to.have.property('trainingProgram');
    expect(trainingTypeUiSchema.trainingProgram).to.have.property(
      'trainingType',
    );
  });

  it('schema has trainingProgram with trainingType', () => {
    expect(trainingTypeSchema.properties).to.have.property(
      'trainingProgram',
    );
    expect(
      trainingTypeSchema.properties.trainingProgram.properties,
    ).to.have.property('trainingType');
  });

  it('trainingType schema is an object type for checkboxGroup', () => {
    const tt =
      trainingTypeSchema.properties.trainingProgram.properties.trainingType;
    expect(tt.type).to.equal('object');
  });

  it('trainingType schema has vocationalFlightTraining property', () => {
    const props =
      trainingTypeSchema.properties.trainingProgram.properties.trainingType
        .properties;
    expect(props).to.have.property('vocationalFlightTraining');
  });

  it('trainingProgram is in schema required array', () => {
    expect(trainingTypeSchema.required).to.include('trainingProgram');
  });
});