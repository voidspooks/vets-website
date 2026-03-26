import { expect } from 'chai';
import previousVehicleApplication from '../../../pages/previousVehicleApplication';
import { applicationInfoFields } from '../../../definitions/constants';

describe('21-4502 previousVehicleApplication page', () => {
  const { schema } = previousVehicleApplication;
  const appSchema = schema.properties[applicationInfoFields.parentObject];

  it('requires previouslyAppliedConveyance', () => {
    expect(appSchema.required).to.include(
      applicationInfoFields.previouslyAppliedConveyance,
    );
  });
});
