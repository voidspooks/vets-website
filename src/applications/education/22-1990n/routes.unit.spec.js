import { expect } from 'chai';
import route from './routes';

describe('routes', () => {
  it('exports a single route object (not an array)', () => {
    expect(route).to.be.an('object');
    expect(route).not.to.be.an('array');
  });

  it('has path "/"', () => {
    expect(route.path).to.equal('/');
  });

  it('has an indexRoute that redirects to /introduction', () => {
    expect(route.indexRoute).to.be.an('object');
    expect(route.indexRoute.onEnter).to.be.a('function');
    const replaceCalls = [];
    route.indexRoute.onEnter({}, path => replaceCalls.push(path));
    expect(replaceCalls).to.deep.equal(['/introduction']);
  });

  it('has a component property', () => {
    expect(route.component).to.be.a('function');
  });

  it('has childRoutes array', () => {
    expect(route.childRoutes).to.be.an('array');
    expect(route.childRoutes.length).to.be.greaterThan(0);
  });
});