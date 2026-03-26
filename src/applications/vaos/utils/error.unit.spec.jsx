import { expect } from 'chai';
import sinon from 'sinon';
import { datadogRum } from '@datadog/browser-rum';
import { captureError, getErrorCodes } from './error';

describe('VAOS Utils: error', () => {
  let sandbox;
  let addErrorStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    addErrorStub = sandbox.stub(datadogRum, 'addError');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getErrorCodes', () => {
    it('should return array of error codes', () => {
      const error = {
        errors: [{ code: 'VAOS_400' }, { code: 'code1' }],
      };

      expect(getErrorCodes(error)).to.deep.equal(['VAOS_400', 'code1']);
    });
  });

  describe('captureError', () => {
    it('should send Error instances to Datadog with title and vaos_exception kind', () => {
      const err = new Error('boom');
      captureError(err, true, 'facility page');

      expect(addErrorStub.calledOnce).to.be.true;
      expect(addErrorStub.firstCall.args[0]).to.equal(err);
      expect(addErrorStub.firstCall.args[1]).to.deep.include({
        app: 'VAOS',
        title: 'facility page',
        kind: 'vaos_exception',
      });

      addErrorStub.resetHistory();
      captureError(err, true);

      expect(addErrorStub.firstCall.args[1]).to.deep.include({
        kind: 'vaos_exception',
      });
      expect(addErrorStub.firstCall.args[1].title).to.be.undefined;
    });

    it('should pass original err to Datadog for server-style payloads with full message as context title', () => {
      const err = {
        errors: [{ code: 'VAOS_400', title: 'Bad request' }],
      };
      captureError(err, true, 'context');

      expect(addErrorStub.calledOnce).to.be.true;
      expect(addErrorStub.firstCall.args[0]).to.equal(err);
      expect(addErrorStub.firstCall.args[1]).to.deep.include({
        app: 'VAOS',
        title: 'vaos_server_error: context',
        kind: 'vaos_server_error',
      });
    });

    it('should use 401-specific title for unauthorized server errors', () => {
      const err = {
        errors: [{ code: '401', title: 'Unauthorized' }],
      };
      captureError(err, true);

      expect(addErrorStub.firstCall.args[0]).to.equal(err);
      expect(addErrorStub.firstCall.args[1]).to.deep.include({
        kind: 'vaos_server_error',
        title: 'vaos_server_error: Unauthorized',
      });
    });

    it('should pass original err to Datadog for client-style values with full message as context title', () => {
      const payload = { foo: 'bar' };
      captureError(payload, true, 'my flow');

      expect(addErrorStub.calledOnce).to.be.true;
      expect(addErrorStub.firstCall.args[0]).to.equal(payload);
      expect(addErrorStub.firstCall.args[1]).to.deep.include({
        app: 'VAOS',
        title: 'vaos_client_error: my flow',
        kind: 'vaos_client_error',
      });
    });

    it('should pass data to Datadog context', () => {
      const err = { errors: [{ code: 'X' }] };
      const data = {
        facilities: [{ id: '1' }, { id: '2' }],
        vaFacility: '442',
      };
      captureError(err, true, null, data);

      expect(addErrorStub.firstCall.args[0]).to.equal(err);
      expect(addErrorStub.firstCall.args[1]).to.deep.include({
        kind: 'vaos_server_error',
        title: 'vaos_server_error: X',
      });
      expect(addErrorStub.firstCall.args[1].data).to.deep.equal(data);
    });
  });
});
