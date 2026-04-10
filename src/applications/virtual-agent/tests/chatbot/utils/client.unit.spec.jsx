import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import {
  createThreadThreadsPost,
  healthOkGet,
  runsStreamThreadsThreadIdRunsStreamPost,
  threadStateThreadsThreadIdStateGet,
} from '../../../chatbot/utils/client';

describe('client', () => {
  let sandbox;
  let fetchStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    fetchStub = sandbox.stub(global, 'fetch');
  });

  afterEach(() => {
    sandbox.restore();
  });

  const makeResponse = (status, body) =>
    Promise.resolve({
      status,
      headers: new Headers(),
      text: () => Promise.resolve(body ? JSON.stringify(body) : null),
    });

  describe('healthOkGet', () => {
    it('returns parsed data and status on success', async () => {
      fetchStub.resolves(makeResponse(200, { status: 'ok' }));

      const result = await healthOkGet();

      expect(result.status).to.equal(200);
      expect(result.data).to.deep.equal({ status: 'ok' });
      sinon.assert.calledWithMatch(fetchStub, '/ok', { method: 'GET' });
    });

    it('returns empty data when server returns 204', async () => {
      fetchStub.resolves(makeResponse(204, null));

      const result = await healthOkGet();

      expect(result.status).to.equal(204);
      expect(result.data).to.deep.equal({});
    });
  });

  describe('createThreadThreadsPost', () => {
    it('returns parsed thread data on success', async () => {
      const thread = { thread_id: 'abc-123' }; // eslint-disable-line camelcase
      fetchStub.resolves(makeResponse(200, thread));

      const result = await createThreadThreadsPost();

      expect(result.status).to.equal(200);
      expect(result.data).to.deep.equal(thread);
      sinon.assert.calledWithMatch(fetchStub, '/threads', { method: 'POST' });
    });

    it('returns empty data when server returns 204', async () => {
      fetchStub.resolves(makeResponse(204, null));

      const result = await createThreadThreadsPost();

      expect(result.status).to.equal(204);
      expect(result.data).to.deep.equal({});
    });
  });

  describe('threadStateThreadsThreadIdStateGet', () => {
    const threadId = 'thread-999';

    it('returns thread state on success', async () => {
      const state = { values: { messages: [] } };
      fetchStub.resolves(makeResponse(200, state));

      const result = await threadStateThreadsThreadIdStateGet(threadId);

      expect(result.status).to.equal(200);
      expect(result.data).to.deep.equal(state);
      sinon.assert.calledWithMatch(fetchStub, `/threads/${threadId}/state`, {
        method: 'GET',
      });
    });

    it('returns empty data when server returns 304', async () => {
      fetchStub.resolves(makeResponse(304, null));

      const result = await threadStateThreadsThreadIdStateGet(threadId);

      expect(result.status).to.equal(304);
      expect(result.data).to.deep.equal({});
    });
  });

  describe('runsStreamThreadsThreadIdRunsStreamPost', () => {
    const threadId = 'thread-555';
    const runPayload = { assistant_id: 'agent-1' }; // eslint-disable-line camelcase

    it('returns streamed run data on success', async () => {
      const responseData = { run_id: 'run-1' }; // eslint-disable-line camelcase
      fetchStub.resolves(makeResponse(200, responseData));

      const result = await runsStreamThreadsThreadIdRunsStreamPost(
        threadId,
        runPayload,
      );

      expect(result.status).to.equal(200);
      expect(result.data).to.deep.equal(responseData);
      sinon.assert.calledWithMatch(
        fetchStub,
        `/threads/${threadId}/runs/stream`,
        {
          method: 'POST',
          body: JSON.stringify(runPayload),
        },
      );
    });

    it('returns empty data when server returns 204', async () => {
      fetchStub.resolves(makeResponse(204, null));

      const result = await runsStreamThreadsThreadIdRunsStreamPost(
        threadId,
        runPayload,
      );

      expect(result.status).to.equal(204);
      expect(result.data).to.deep.equal({});
    });
  });
});
