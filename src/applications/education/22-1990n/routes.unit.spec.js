import { expect } from 'chai';
import route from './routes';

describe('routes', () => {
  it('exports a single route object, not an array', () => {
    expect(route).to.be.an('object');
    expect(Array.isArray(route)).to.be.false;
  });

  it('has path "/"', () => {
    expect(route.path).to.equal('/');
  });

  it('has an indexRoute that redirects to /introduction', () => {
    expect(route.indexRoute).to.be.an('object');
    expect(route.indexRoute.onEnter).to.be.a('function');
    const replaceCalls = [];
    route.indexRoute.onEnter({}, val => replaceCalls.push(val));
    expect(replaceCalls).to.deep.equal(['/introduction']);
  });

  it('has childRoutes array', () => {
    expect(route.childRoutes).to.be.an('array');
    expect(route.childRoutes.length).to.be.greaterThan(0);
  });

  it('has component property', () => {
    expect(route.component).to.be.a('function');
  });
});