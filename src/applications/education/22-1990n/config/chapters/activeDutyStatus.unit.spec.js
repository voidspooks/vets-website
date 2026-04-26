import { expect } from 'chai';
import {
  activeDutyStatusUiSchema,
  activeDutyStatusSchema,
} from './activeDutyStatus';

describe('config/chapters/activeDutyStatus', () => {
  it('uiSchema has serviceInformation.isActiveDuty', () => {
    expect(activeDutyStatusUiSchema).to.have.property('serviceInformation');
    expect(
      activeDutyStatusUiSchema.serviceInformation,
    ).to.have.property('isActiveDuty');
  });

  it('uiSchema has serviceInformation.isOnTerminalLeave', () => {
    expect(
      activeDutyStatusUiSchema.serviceInformation,
    ).to.have.property('isOnTerminalLeave');
  });

  it('schema has boolean types for both fields', () => {
    const props =
      activeDutyStatusSchema.properties.serviceInformation.properties;
    expect(props.isActiveDuty.type).to.equal('boolean');
    expect(props.isOnTerminalLeave.type).to.equal('boolean');
  });

  it('schema requires both isActiveDuty and isOnTerminalLeave', () => {
    const required =
      activeDutyStatusSchema.properties.serviceInformation.required;
    expect(required).to.include('isActiveDuty');
    expect(required).to.include('isOnTerminalLeave');
  });
});