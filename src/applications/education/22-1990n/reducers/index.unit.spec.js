import { expect } from 'chai';
import reducers from './index';

describe('reducers', () => {
  it('exports an object with a form slice', () => {
    expect(reducers).to.be.an('object');
    expect(reducers.form).to.be.a('function');
  });

  it('returns a non-null state on @@INIT', () => {
    const result = reducers.form(undefined, { type: '@@INIT' });
    expect(result).to.not.be.null;
    expect(result).to.be.an('object');
  });

  it('initializes with expected form state shape', () => {
    const result = reducers.form(undefined, { type: '@@INIT' });
    expect(result).to.have.property('data');
  });
});