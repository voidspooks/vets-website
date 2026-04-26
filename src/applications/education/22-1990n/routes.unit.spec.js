import { expect } from 'chai';
import routes from './routes';

describe('routes', () => {
  it('exports a route object, not an array', () => {
    expect(routes).to.be.an('object');
    expect(routes).not.to.be.an('array');
  });

  it('has path set to "/"', () => {
    expect(routes.path).to.equal('/');
  });

  it('has a component property', () => {
    expect(routes.component).to.exist;
  });

  it('has an indexRoute with onEnter that redirects to /introduction', () => {
    expect(routes.indexRoute).to.exist;
    expect(routes.indexRoute.onEnter).to.be.a('function');
    let replaced = null;
    routes.indexRoute.onEnter({}, path => {
      replaced = path;
    });
    expect(replaced).to.equal('/introduction');
  });

  it('has childRoutes array', () => {
    expect(routes.childRoutes).to.be.an('array');
    expect(routes.childRoutes.length).to.be.greaterThan(0);
  });
});