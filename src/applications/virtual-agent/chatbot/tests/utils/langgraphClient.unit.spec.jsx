import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { LangGraphClient } from '../../utils/langgraphClient';

describe('LangGraphClient', () => {
  let sandbox;
  let fetchStub;
  let client;
  let url;

  beforeEach(() => {
    url = 'https://test-backend.example.com';
    sandbox = sinon.sandbox.create();
    fetchStub = sandbox.stub(global, 'fetch');
    client = new LangGraphClient(url);
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

  describe('constructor', () => {
    it('throws when url is missing', () => {
      expect(() => new LangGraphClient('')).to.throw(
        'LangGraphClient requires a URL. Set VIRTUAL_AGENT_BACKEND_URL or pass one explicitly.',
      );
    });

    it('throws when url is invalid', () => {
      expect(() => new LangGraphClient('not-a-valid-url')).to.throw(
        'LangGraphClient URL is invalid: not-a-valid-url',
      );
    });
  });

  describe('healthOkGet', () => {
    it('returns parsed data and status on success', async () => {
      fetchStub.resolves(makeResponse(200, { status: 'ok' }));

      const result = await client.healthOkGet();

      expect(result.status).to.equal(200);
      expect(result.data).to.deep.equal({ status: 'ok' });
      sinon.assert.calledWithMatch(fetchStub, '/ok', { method: 'GET' });
    });

    it('returns empty data when server returns 204', async () => {
      fetchStub.resolves(makeResponse(204, null));

      const result = await client.healthOkGet();

      expect(result.status).to.equal(204);
      expect(result.data).to.deep.equal({});
    });
  });

  describe('postCreateThread', () => {
    it('returns parsed thread data on success', async () => {
      const thread = { thread_id: 'abc-123' }; // eslint-disable-line camelcase
      fetchStub.resolves(makeResponse(200, thread));

      const result = await client.postCreateThread();

      expect(result.status).to.equal(200);
      expect(result.data).to.deep.equal(thread);
      sinon.assert.calledWithMatch(fetchStub, '/threads', { method: 'POST' });
    });

    it('returns empty data when server returns 204', async () => {
      fetchStub.resolves(makeResponse(204, null));

      const result = await client.postCreateThread();

      expect(result.status).to.equal(204);
      expect(result.data).to.deep.equal({});
    });
  });

  describe('getThreadState', () => {
    const threadId = 'thread-999';

    it('returns thread state on success', async () => {
      const state = { values: { messages: [] } };
      fetchStub.resolves(makeResponse(200, state));

      const result = await client.getThreadState(threadId);

      expect(result.status).to.equal(200);
      expect(result.data).to.deep.equal(state);
      sinon.assert.calledWithMatch(fetchStub, `/threads/${threadId}/state`, {
        method: 'GET',
      });
    });

    it('returns empty data when server returns 304', async () => {
      fetchStub.resolves(makeResponse(304, null));

      const result = await client.getThreadState(threadId);

      expect(result.status).to.equal(304);
      expect(result.data).to.deep.equal({});
    });
  });

  describe('postRunsStream', () => {
    const threadId = 'thread-555';
    const runPayload = { assistant_id: 'agent-1' }; // eslint-disable-line camelcase

    it('returns streamed run data on success', async () => {
      const responseData = { run_id: 'run-1' }; // eslint-disable-line camelcase
      fetchStub.resolves(makeResponse(200, responseData));

      const result = await client.postRunsStream(threadId, runPayload);

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

      const result = await client.postRunsStream(threadId, runPayload);

      expect(result.status).to.equal(204);
      expect(result.data).to.deep.equal({});
    });
  });
});
