import { expect } from 'chai';
import reducers from './index';

describe('reducers/index', () => {
  it('exports an object with a form key', () => {
    expect(reducers).to.be.an('object');
    expect(reducers).to.have.property('form');
  });

  it('form reducer is a function', () => {
    expect(reducers.form).to.be.a('function');
  });

  it('form reducer returns a non-null object when called with undefined state', () => {
    const result = reducers.form(undefined, { type: '@@INIT' });
    expect(result).to.be.an('object');
    expect(result).to.not.be.null;
  });

  it('form reducer returns state with data property', () => {
    const result = reducers.form(undefined, { type: '@@INIT' });
    expect(result).to.have.property('data');
  });
});