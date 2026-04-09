import { expect } from 'chai';
import nameOnCoe from '../../../pages/nameOnCoe';

describe('nameOnCoe page', () => {
  it('has the fullName field in the UI schema', () => {
    expect(nameOnCoe.uiSchema).to.have.property('fullName');
  });

  it('has the fullName field in the schema', () => {
    expect(nameOnCoe.schema.properties).to.have.property('fullName');
  });

  it('requires first and last name in the fullName schema', () => {
    expect(nameOnCoe.schema.properties.fullName.required).to.deep.equal([
      'first',
      'last',
    ]);
  });

  it('includes first, middle, last, and suffix fields', () => {
    const { properties } = nameOnCoe.schema.properties.fullName;
    expect(properties).to.have.property('first');
    expect(properties).to.have.property('middle');
    expect(properties).to.have.property('last');
    expect(properties).to.have.property('suffix');
  });
});
