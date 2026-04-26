import { expect } from 'chai';
import {
  servicePeriodsUiSchema,
  servicePeriodsSchema,
} from './servicePeriods';

describe('chapters/servicePeriods', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(servicePeriodsUiSchema).to.be.an('object');
    });

    it('has serviceInformation.servicePeriods key', () => {
      expect(servicePeriodsUiSchema.serviceInformation).to.be.an('object');
      expect(
        servicePeriodsUiSchema.serviceInformation.servicePeriods,
      ).to.be.an('object');
    });

    it('servicePeriods items has all four required fields', () => {
      const items =
        servicePeriodsUiSchema.serviceInformation.servicePeriods.items;
      expect(items.dateEnteredService).to.be.an('object');
      expect(items.dateSeparated).to.be.an('object');
      expect(items.serviceComponent).to.be.an('object');
      expect(items.serviceStatus).to.be.an('object');
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(servicePeriodsSchema).to.be.an('object');
    });

    it('servicePeriods has minItems 1', () => {
      const sp =
        servicePeriodsSchema.properties.serviceInformation.properties
          .servicePeriods;
      expect(sp.minItems).to.equal(1);
    });

    it('servicePeriods items require dateEnteredService, serviceComponent, and serviceStatus', () => {
      const items =
        servicePeriodsSchema.properties.serviceInformation.properties
          .servicePeriods.items;
      expect(items.required).to.include('dateEnteredService');
      expect(items.required).to.include('serviceComponent');
      expect(items.required).to.include('serviceStatus');
    });

    it('serviceComponent is one of the known service branches', () => {
      const serviceComponent =
        servicePeriodsSchema.properties.serviceInformation.properties
          .servicePeriods.items.properties.serviceComponent;
      expect(serviceComponent.enum).to.include('USAR');
      expect(serviceComponent.enum).to.include('ARNG');
      expect(serviceComponent.enum).to.include('USN');
    });
  });
});