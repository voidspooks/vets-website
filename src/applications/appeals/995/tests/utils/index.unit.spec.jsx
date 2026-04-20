import { expect } from 'chai';
import sinon from 'sinon-v20';
import { onFormLoaded } from '../../utils';

describe('onFormLoaded', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should direct to the correct returnUrl', () => {
    const routerSpy = { push: sinon.spy() };
    onFormLoaded({ returnUrl: '/housing-risk', router: routerSpy });
    expect(routerSpy.push.firstCall.args[0]).to.eq('/housing-risk');
  });

  it('should not push if returnUrl is undefined', () => {
    const routerSpy = { push: sinon.spy() };
    onFormLoaded({ returnUrl: undefined, router: routerSpy });
    expect(routerSpy.push.called).to.be.false;
  });

  describe('pre-redesign saved forms (showArrayBuilder undefined)', () => {
    const formData = {};

    it('should migrate old VA details URL to the renamed path', () => {
      const routerSpy = { push: sinon.spy() };
      onFormLoaded({
        returnUrl: '/supporting-evidence/va-medical-records',
        formData,
        router: routerSpy,
      });
      expect(routerSpy.push.firstCall.args[0]).to.eq(
        '/supporting-evidence/va-medical-records-v0',
      );
    });

    it('should migrate old private prompt URL to the renamed path', () => {
      const routerSpy = { push: sinon.spy() };
      onFormLoaded({
        returnUrl: '/supporting-evidence/request-private-medical-records',
        formData,
        router: routerSpy,
      });
      expect(routerSpy.push.firstCall.args[0]).to.eq(
        '/supporting-evidence/private-medical-records',
      );
    });

    it('should migrate old private details URL to the renamed path', () => {
      const routerSpy = { push: sinon.spy() };
      onFormLoaded({
        returnUrl: '/supporting-evidence/private-medical-records',
        formData,
        router: routerSpy,
      });
      expect(routerSpy.push.firstCall.args[0]).to.eq(
        '/supporting-evidence/private-medical-records-v0',
      );
    });
  });

  describe('post-redesign saved forms (showArrayBuilder defined)', () => {
    it('should not migrate URLs when showArrayBuilder is false', () => {
      const routerSpy = { push: sinon.spy() };
      onFormLoaded({
        returnUrl: '/supporting-evidence/private-medical-records',
        formData: { showArrayBuilder: false },
        router: routerSpy,
      });
      expect(routerSpy.push.firstCall.args[0]).to.eq(
        '/supporting-evidence/private-medical-records',
      );
    });

    it('should not migrate URLs when showArrayBuilder is true', () => {
      const routerSpy = { push: sinon.spy() };
      onFormLoaded({
        returnUrl: '/supporting-evidence/va-medical-records',
        formData: { showArrayBuilder: true },
        router: routerSpy,
      });
      expect(routerSpy.push.firstCall.args[0]).to.eq(
        '/supporting-evidence/va-medical-records',
      );
    });

    it('should pass through non-migrated URLs unchanged', () => {
      const routerSpy = { push: sinon.spy() };
      onFormLoaded({
        returnUrl: '/housing-risk',
        formData: { showArrayBuilder: false },
        router: routerSpy,
      });
      expect(routerSpy.push.firstCall.args[0]).to.eq('/housing-risk');
    });
  });
});
