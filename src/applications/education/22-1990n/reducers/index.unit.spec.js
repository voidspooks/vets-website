import { expect } from 'chai';
import reducers from './index';

describe('reducers/index', () => {
  it('returns an object with a form slice', () => {
    expect(reducers).to.be.an('object');
    expect(reducers).to.have.property('form');
  });

  it('form reducer is a function', () => {
    expect(reducers.form).to.be.a('function');
  });

  it('form reducer initializes state without throwing', () => {
    let result;
    expect(() => {
      result = reducers.form(undefined, { type: '@@INIT' });
    }).to.not.throw();
    expect(result).to.be.an('object');
  });
});