import { expect } from 'chai';
import sinon from 'sinon';
import * as Sentry from '@sentry/browser';
import * as apiModule from 'platform/utilities/api';
import * as medicalCentersModule from 'platform/utilities/medical-centers/medical-centers';
import * as helpersModule from '../../utils/helpers';
import {
  MCP_STATEMENTS_FETCH_INIT,
  MCP_STATEMENTS_FETCH_SUCCESS,
  MCP_STATEMENTS_FETCH_FAILURE,
  MCP_DETAIL_FETCH_INIT,
  MCP_DETAIL_FETCH_SUCCESS,
  MCP_DETAIL_FETCH_FAILURE,
  mcpStatementsFetchInit,
  getAllCopayStatements,
  getCopaySummaryStatements,
  getCopayDetailStatement,
} from '../../actions/copays';

describe('copays actions', () => {
  let sandbox;
  let dispatch;
  let apiRequestStub;
  let getMedicalCenterNameByIDStub;
  let sentryCaptureMessageStub;
  let showVHAPaymentHistoryStub;
  const errors = {
    notFoundError: { status: '404', detail: 'Not found' },
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    dispatch = sandbox.spy();
    apiRequestStub = sandbox.stub(apiModule, 'apiRequest');
    getMedicalCenterNameByIDStub = sandbox.stub(
      medicalCentersModule,
      'getMedicalCenterNameByID',
    );
    showVHAPaymentHistoryStub = sandbox.stub(
      helpersModule,
      'showVHAPaymentHistory',
    );
    sentryCaptureMessageStub = sandbox.stub(Sentry, 'captureMessage');
    sandbox
      .stub(Sentry, 'withScope')
      .callsFake(cb => cb({ setExtra: sandbox.stub() }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('mcpStatementsFetchInit', () => {
    it('should create an action to initiate fetching statements', () => {
      const expectedAction = {
        type: MCP_STATEMENTS_FETCH_INIT,
      };
      expect(mcpStatementsFetchInit()).to.deep.equal(expectedAction);
    });
  });

  describe('getAllCopayStatements', () => {
    it('should dispatch FETCH_INIT and FETCH_SUCCESS actions when fetch succeeds', async () => {
      const fakeData = [
        {
          station: {
            facilitYNum: '123',
            city: 'NEW YORK',
          },
        },
      ];
      apiRequestStub.resolves({ data: fakeData });
      getMedicalCenterNameByIDStub.returns('Fake Medical Center');
      showVHAPaymentHistoryStub.returns(true);

      await getAllCopayStatements(dispatch);

      expect(dispatch.firstCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_INIT,
      });
      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_SUCCESS,
        response: [
          {
            station: {
              facilitYNum: '123',
              city: 'New York',
              facilityName: 'Fake Medical Center',
            },
          },
        ],
        shouldUseLighthouseCopays: false,
      });
    });

    it('should handle missing station information', async () => {
      const fakeData = [{ id: 1 }]; // Missing station info
      apiRequestStub.resolves({ data: fakeData });
      showVHAPaymentHistoryStub.returns(false);

      await getAllCopayStatements(dispatch);

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_SUCCESS,
        response: [{ id: 1 }],
        shouldUseLighthouseCopays: false,
      });
    });

    it('should handle null values in station information', async () => {
      const fakeData = [
        {
          id: 1,
          station: {
            facilitYNum: null,
            city: null,
          },
        },
      ];
      apiRequestStub.resolves({ data: fakeData });
      getMedicalCenterNameByIDStub.returns(null);
      showVHAPaymentHistoryStub.returns(true);

      await getAllCopayStatements(dispatch);

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_SUCCESS,
        response: [
          {
            id: 1,
            station: {
              facilitYNum: null,
              city: '',
              facilityName: null,
            },
          },
        ],
        shouldUseLighthouseCopays: false,
      });
    });

    it('always dispatches shouldUseLighthouseCopays false (v0 path)', async () => {
      const fakeData = [{ id: 1 }];
      apiRequestStub.resolves({ data: fakeData, isCerner: true });
      showVHAPaymentHistoryStub.returns(true);

      await getAllCopayStatements(dispatch);

      expect(dispatch.secondCall.args[0].shouldUseLighthouseCopays).to.be.false;
    });

    it('should handle network errors', async () => {
      apiRequestStub.rejects({ errors: [errors.notFoundError] });

      await getAllCopayStatements(dispatch);

      expect(dispatch.firstCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_INIT,
      });
      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_FAILURE,
        error: errors.notFoundError,
      });
      expect(sentryCaptureMessageStub.calledOnce).to.be.true;
      expect(sentryCaptureMessageStub.firstCall.args[0]).to.equal(
        'medical_copays failed: Not found',
      );
    });
  });

  describe('getAllCopayStatements with various inputs', () => {
    it('should correctly transform city names', async () => {
      const fakeData = [
        {
          station: {
            facilitYNum: '123',
            city: 'NEW YORK CITY',
          },
        },
      ];
      apiRequestStub.resolves({ data: fakeData });
      getMedicalCenterNameByIDStub.returns('NYC Medical Center');
      showVHAPaymentHistoryStub.returns(true);

      await getAllCopayStatements(dispatch);

      expect(dispatch.secondCall.args[0].response[0].station.city).to.equal(
        'New York City',
      );
      expect(dispatch.secondCall.args[0].shouldUseLighthouseCopays).to.be.false;
    });

    it('should handle empty city names', async () => {
      const fakeData = [
        {
          station: {
            facilitYNum: '123',
            city: '',
          },
        },
      ];
      apiRequestStub.resolves({ data: fakeData });
      getMedicalCenterNameByIDStub.returns('Some Medical Center');
      showVHAPaymentHistoryStub.returns(false);

      await getAllCopayStatements(dispatch);

      expect(dispatch.secondCall.args[0].response[0].station.city).to.equal('');
      expect(dispatch.secondCall.args[0].shouldUseLighthouseCopays).to.be.false;
    });

    it('should handle single word city names', async () => {
      const fakeData = [
        {
          station: {
            facilitYNum: '123',
            city: 'WASHINGTON',
          },
        },
      ];
      apiRequestStub.resolves({ data: fakeData });
      getMedicalCenterNameByIDStub.returns('Washington Medical Center');
      showVHAPaymentHistoryStub.returns(true);

      await getAllCopayStatements(dispatch);

      expect(dispatch.secondCall.args[0].response[0].station.city).to.equal(
        'Washington',
      );
      expect(dispatch.secondCall.args[0].shouldUseLighthouseCopays).to.be.false;
    });
  });

  describe('getCopaySummaryStatements', () => {
    it('should dispatch FETCH_INIT and FETCH_SUCCESS with raw response.data when lighthouse copays (flag on, not Cerner)', async () => {
      const fakeResponse = {
        data: [
          { id: '1', attributes: { facility: 'Test VAMC', city: 'LYONS' } },
        ],
        meta: { pagination: { currentPage: 1 } },
        isCerner: false,
      };

      apiRequestStub.resolves(fakeResponse);
      showVHAPaymentHistoryStub.returns(true);

      await getCopaySummaryStatements()(dispatch, () => ({}));

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_SUCCESS,
        fullResponse: fakeResponse,
        response: fakeResponse.data,
        meta: fakeResponse.meta,
        shouldUseLighthouseCopays: true,
      });
    });

    it('should disable lighthouse copays when user is Cerner and transform VBS-shaped data', async () => {
      const fakeResponse = {
        data: [
          {
            id: '1',
            station: {
              facilitYNum: '123',
              city: 'NEW YORK',
            },
          },
        ],
        meta: { pagination: { currentPage: 1 } },
        isCerner: true,
      };

      apiRequestStub.resolves(fakeResponse);
      getMedicalCenterNameByIDStub.returns('Fake Medical Center');
      showVHAPaymentHistoryStub.returns(true);

      await getCopaySummaryStatements()(dispatch, () => ({}));

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_SUCCESS,
        fullResponse: fakeResponse,
        response: [
          {
            id: '1',
            station: {
              facilitYNum: '123',
              city: 'New York',
              facilityName: 'Fake Medical Center',
            },
          },
        ],
        meta: fakeResponse.meta,
        shouldUseLighthouseCopays: false,
      });
    });

    it('should not use lighthouse copays when feature flag disabled and transform VBS-shaped data', async () => {
      const fakeResponse = {
        data: [
          {
            id: '1',
            station: {
              facilitYNum: '456',
              city: 'BOSTON',
            },
          },
        ],
        meta: { pagination: { currentPage: 1 } },
        isCerner: false,
      };

      apiRequestStub.resolves(fakeResponse);
      getMedicalCenterNameByIDStub.returns('Boston Medical Center');
      showVHAPaymentHistoryStub.returns(false);

      await getCopaySummaryStatements()(dispatch, () => ({}));

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_SUCCESS,
        fullResponse: fakeResponse,
        response: [
          {
            id: '1',
            station: {
              facilitYNum: '456',
              city: 'Boston',
              facilityName: 'Boston Medical Center',
            },
          },
        ],
        meta: fakeResponse.meta,
        shouldUseLighthouseCopays: false,
      });
    });

    it('should not use lighthouse copays when feature flag disabled and user is Cerner', async () => {
      const fakeResponse = {
        data: [{ id: '1' }],
        meta: { pagination: { currentPage: 1 } },
        isCerner: true,
      };

      apiRequestStub.resolves(fakeResponse);
      showVHAPaymentHistoryStub.returns(false);

      await getCopaySummaryStatements()(dispatch, () => ({}));

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_SUCCESS,
        fullResponse: fakeResponse,
        response: [{ id: '1' }],
        meta: fakeResponse.meta,
        shouldUseLighthouseCopays: false,
      });
    });

    it('should dispatch FETCH_FAILURE and capture Sentry error on failure', async () => {
      apiRequestStub.rejects({ errors: [errors.notFoundError] });

      await getCopaySummaryStatements()(dispatch, () => ({}));

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_FAILURE,
        error: errors.notFoundError,
      });
      expect(sentryCaptureMessageStub.calledOnce).to.be.true;
      expect(sentryCaptureMessageStub.firstCall.args[0]).to.equal(
        'medical_copays failed: Not found',
      );
    });
  });

  describe('getCopayDetailStatement', () => {
    it('should dispatch DETAIL_FETCH_INIT and DETAIL_FETCH_SUCCESS with raw data when lighthouse', async () => {
      const fakeResponse = {
        data: {
          id: '1',
          attributes: { facility: 'Test VAMC', city: 'LYONS' },
        },
        isCerner: false,
      };
      apiRequestStub.resolves(fakeResponse);
      showVHAPaymentHistoryStub.returns(true);

      await getCopayDetailStatement('copay-id')(dispatch, () => ({}));

      expect(dispatch.firstCall.args[0]).to.deep.equal({
        type: MCP_DETAIL_FETCH_INIT,
      });
      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_DETAIL_FETCH_SUCCESS,
        response: fakeResponse,
        shouldUseLighthouseCopays: true,
      });
    });

    it('should transform VBS-shaped detail when user is Cerner', async () => {
      const fakeResponse = {
        data: {
          id: '1',
          station: {
            facilitYNum: '123',
            city: 'NEW YORK',
          },
        },
        isCerner: true,
      };
      apiRequestStub.resolves(fakeResponse);
      getMedicalCenterNameByIDStub.returns('Fake Medical Center');
      showVHAPaymentHistoryStub.returns(true);

      await getCopayDetailStatement('copay-id')(dispatch, () => ({}));

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_DETAIL_FETCH_SUCCESS,
        response: {
          isCerner: true,
          data: {
            id: '1',
            station: {
              facilitYNum: '123',
              city: 'New York',
              facilityName: 'Fake Medical Center',
            },
          },
        },
        shouldUseLighthouseCopays: false,
      });
    });

    it('should dispatch DETAIL_FETCH_FAILURE on error', async () => {
      apiRequestStub.rejects({ errors: [errors.notFoundError] });

      await getCopayDetailStatement('missing-id')(dispatch, () => ({}));

      expect(dispatch.firstCall.args[0]).to.deep.equal({
        type: MCP_DETAIL_FETCH_INIT,
      });
      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_DETAIL_FETCH_FAILURE,
        error: errors.notFoundError,
      });
    });
  });
});
