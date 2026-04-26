import { expect } from 'chai';
import {
  servicePeriodsUiSchema,
  servicePeriodsSchema,
} from './servicePeriods';

describe('config/chapters/servicePeriods', () => {
  it('uiSchema has serviceInformation.servicePeriods', () => {
    expect(servicePeriodsUiSchema).to.have.property('serviceInformation');
    expect(servicePeriodsUiSchema.serviceInformation).to.have.property(
      'servicePeriods',
    );
  });

  it('uiSchema servicePeriods has items with required fields', () => {
    const items = servicePeriodsUiSchema.serviceInformation.servicePeriods.items;
    expect(items).to.have.property('dateEnteredService');
    expect(items).to.have.property('dateSeparated');
    expect(items).to.have.property('serviceComponent');
    expect(items).to.have.property('serviceStatus');
  });

  it('schema has servicePeriods as array', () => {
    const spSchema =
      servicePeriodsSchema.properties.serviceInformation.properties
        .servicePeriods;
    expect(spSchema.type).to.equal('array');
    expect(spSchema.minItems).to.equal(1);
    expect(spSchema.maxItems).to.equal(10);
  });

  it('servicePeriods items require dateEnteredService', () => {
    const required =
      servicePeriodsSchema.properties.serviceInformation.properties
        .servicePeriods.items.required;
    expect(required).to.include('dateEnteredService');
    expect(required).to.include('serviceComponent');
    expect(required).to.include('serviceStatus');
  });

  it('serviceComponent schema has valid enum values', () => {
    const enumValues =
      servicePeriodsSchema.properties.serviceInformation.properties
        .servicePeriods.items.properties.serviceComponent.enum;
    expect(enumValues).to.include('USA');
    expect(enumValues).to.include('USAR');
    expect(enumValues).to.include('ARNG');
    expect(enumValues).to.include('USNR');
  });
});