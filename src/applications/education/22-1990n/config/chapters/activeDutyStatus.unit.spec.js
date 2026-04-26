import { expect } from 'chai';
import {
  activeDutyStatusUiSchema,
  activeDutyStatusSchema,
} from './activeDutyStatus';

describe('chapters/activeDutyStatus', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(activeDutyStatusUiSchema).to.be.an('object');
    });

    it('has isActiveDuty and isOnTerminalLeave fields', () => {
      const si = activeDutyStatusUiSchema.serviceInformation;
      expect(si.isActiveDuty).to.be.an('object');
      expect(si.isOnTerminalLeave).to.be.an('object');
    });

    it('isActiveDuty has ui:required returning true', () => {
      const si = activeDutyStatusUiSchema.serviceInformation;
      expect(si.isActiveDuty['ui:required']).to.be.a('function');
      expect(si.isActiveDuty['ui:required']()).to.be.true;
    });

    it('isOnTerminalLeave has ui:required returning true', () => {
      const si = activeDutyStatusUiSchema.serviceInformation;
      expect(si.isOnTerminalLeave['ui:required']).to.be.a('function');
      expect(si.isOnTerminalLeave['ui:required']()).to.be.true;
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(activeDutyStatusSchema).to.be.an('object');
    });

    it('serviceInformation is required', () => {
      expect(activeDutyStatusSchema.required).to.include('serviceInformation');
    });

    it('isActiveDuty and isOnTerminalLeave are required', () => {
      const si = activeDutyStatusSchema.properties.serviceInformation;
      expect(si.required).to.include('isActiveDuty');
      expect(si.required).to.include('isOnTerminalLeave');
    });

    it('isActiveDuty is boolean type', () => {
      const isActiveDuty =
        activeDutyStatusSchema.properties.serviceInformation.properties
          .isActiveDuty;
      expect(isActiveDuty.type).to.equal('boolean');
    });
  });
});