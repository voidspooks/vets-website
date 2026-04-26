import { expect } from 'chai';
import {
  flightTrainingRequirementsUiSchema,
  flightTrainingRequirementsSchema,
} from './flightTrainingRequirements';

describe('config/chapters/flightTrainingRequirements', () => {
  it('uiSchema has flightTraining with hasPrivatePilotLicense', () => {
    expect(flightTrainingRequirementsUiSchema).to.have.property(
      'flightTraining',
    );
    expect(
      flightTrainingRequirementsUiSchema.flightTraining,
    ).to.have.property('hasPrivatePilotLicense');
  });

  it('uiSchema has isATPCourse field', () => {
    expect(
      flightTrainingRequirementsUiSchema.flightTraining,
    ).to.have.property('isATPCourse');
  });

  it('schema has flightTraining with hasPrivatePilotLicense', () => {
    expect(flightTrainingRequirementsSchema.properties).to.have.property(
      'flightTraining',
    );
    expect(
      flightTrainingRequirementsSchema.properties.flightTraining.properties,
    ).to.have.property('hasPrivatePilotLicense');
  });

  it('hasPrivatePilotLicense schema is boolean', () => {
    const schema =
      flightTrainingRequirementsSchema.properties.flightTraining.properties
        .hasPrivatePilotLicense;
    expect(schema.type).to.equal('boolean');
  });

  it('isATPCourse schema has enum with Y and N', () => {
    const schema =
      flightTrainingRequirementsSchema.properties.flightTraining.properties
        .isATPCourse;
    expect(schema.enum).to.include('Y');
    expect(schema.enum).to.include('N');
  });

  it('isATPCourse required function checks hasPrivatePilotLicense', () => {
    const reqFn =
      flightTrainingRequirementsUiSchema.flightTraining.isATPCourse[
        'ui:required'
      ];
    if (reqFn) {
      expect(
        reqFn({ flightTraining: { hasPrivatePilotLicense: true } }),
      ).to.equal(true);
      expect(
        reqFn({ flightTraining: { hasPrivatePilotLicense: false } }),
      ).to.equal(false);
    }
  });
});