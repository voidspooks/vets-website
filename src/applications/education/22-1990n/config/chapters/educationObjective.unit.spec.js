import { expect } from 'chai';
import {
  educationObjectiveUiSchema,
  educationObjectiveSchema,
} from './educationObjective';

describe('config/chapters/educationObjective', () => {
  it('uiSchema has trainingProgram.educationObjective', () => {
    expect(educationObjectiveUiSchema).to.have.property('trainingProgram');
    expect(educationObjectiveUiSchema.trainingProgram).to.have.property(
      'educationObjective',
    );
  });

  it('uiSchema has highestRateAuthorizationGroup', () => {
    expect(
      educationObjectiveUiSchema.trainingProgram,
    ).to.have.property('highestRateAuthorizationGroup');
  });

  it('schema has educationObjective with maxLength 500', () => {
    const eoSchema =
      educationObjectiveSchema.properties.trainingProgram.properties
        .educationObjective;
    expect(eoSchema.maxLength).to.equal(500);
  });

  it('educationObjective is not required', () => {
    const required =
      educationObjectiveSchema.properties.trainingProgram.required;
    expect(required || []).not.to.include('educationObjective');
  });

  it('highestRateAuthorizationGroup schema has the authorization key', () => {
    const hraSchema =
      educationObjectiveSchema.properties.trainingProgram.properties
        .highestRateAuthorizationGroup;
    expect(hraSchema).to.exist;
    expect(hraSchema.type).to.equal('object');
    expect(hraSchema.properties).to.have.property(
      'highestRateAuthorization',
    );
  });
});