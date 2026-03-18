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
  let getState;
  let apiRequestStub;
  let getMedicalCenterNameByIDStub;
  let lighthouseCopaysSelectorStub;
  let sentryCaptureMessageStub;
  const errors = {
    notFoundError: { status: '404', detail: 'Not found' },
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    dispatch = sandbox.spy();
    getState = sandbox.stub();
    apiRequestStub = sandbox.stub(apiModule, 'apiRequest');
    getMedicalCenterNameByIDStub = sandbox.stub(
      medicalCentersModule,
      'getMedicalCenterNameByID',
    );
    lighthouseCopaysSelectorStub = sandbox.stub(
      helpersModule,
      'selectVistaLighthouse',
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
      apiRequestStub.resolves({ data: fakeData, isCerner: false });
      getMedicalCenterNameByIDStub.returns('Fake Medical Center');

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
        isCerner: false,
      });
    });

    it('should handle missing station information', async () => {
      const fakeData = [{ id: 1 }]; // Missing station info
      apiRequestStub.resolves({ data: fakeData, isCerner: true });

      await getAllCopayStatements(dispatch);

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_SUCCESS,
        response: [{ id: 1 }],
        isCerner: true,
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
      apiRequestStub.resolves({ data: fakeData, isCerner: false });
      getMedicalCenterNameByIDStub.returns(null);

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
        isCerner: false,
      });
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
      apiRequestStub.resolves({ data: fakeData, isCerner: false });
      getMedicalCenterNameByIDStub.returns('NYC Medical Center');

      await getAllCopayStatements(dispatch);

      expect(dispatch.secondCall.args[0].response[0].station.city).to.equal(
        'New York City',
      );
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
      apiRequestStub.resolves({ data: fakeData, isCerner: false });
      getMedicalCenterNameByIDStub.returns('Some Medical Center');

      await getAllCopayStatements(dispatch);

      expect(dispatch.secondCall.args[0].response[0].station.city).to.equal('');
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
      apiRequestStub.resolves({ data: fakeData, isCerner: false });
      getMedicalCenterNameByIDStub.returns('Washington Medical Center');

      await getAllCopayStatements(dispatch);

      expect(dispatch.secondCall.args[0].response[0].station.city).to.equal(
        'Washington',
      );
    });
  });

  describe('getCopaySummaryStatements', () => {
    it('should dispatch FETCH_INIT and FETCH_SUCCESS with raw response when useLighthouseCopays (selector) is true', async () => {
      const rawResponse = [{ id: 'lh-1', statementId: 's1' }];
      lighthouseCopaysSelectorStub.returns(true);
      apiRequestStub.resolves({ data: rawResponse, isCerner: false });

      const thunk = await getCopaySummaryStatements();
      await thunk(dispatch, getState);

      expect(dispatch.firstCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_INIT,
      });
      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_SUCCESS,
        response: rawResponse,
        isCerner: false,
      });
      expect(lighthouseCopaysSelectorStub.calledOnce).to.be.true;
      expect(getMedicalCenterNameByIDStub.called).to.be.false;
    });

    it('should dispatch FETCH_SUCCESS with transformed response when useLighthouseCopays (selector) is false', async () => {
      const fakeData = [
        {
          station: {
            facilitYNum: '456',
            city: 'BOSTON',
          },
        },
      ];
      lighthouseCopaysSelectorStub.returns(false);
      apiRequestStub.resolves({ data: fakeData, isCerner: true });
      getMedicalCenterNameByIDStub.returns('Boston VAMC');

      const thunk = await getCopaySummaryStatements();
      await thunk(dispatch, getState);

      expect(dispatch.firstCall.args[0].type).to.equal(
        MCP_STATEMENTS_FETCH_INIT,
      );
      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_SUCCESS,
        response: [
          {
            station: {
              facilitYNum: '456',
              city: 'Boston',
              facilityName: 'Boston VAMC',
            },
          },
        ],
        isCerner: true,
      });
      expect(getMedicalCenterNameByIDStub.called).to.be.true;
    });

    it('should dispatch FETCH_FAILURE and report to Sentry on API error', async () => {
      lighthouseCopaysSelectorStub.returns(false);
      apiRequestStub.rejects({ errors: [errors.notFoundError] });

      const thunk = await getCopaySummaryStatements();
      await thunk(dispatch, getState);

      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_STATEMENTS_FETCH_FAILURE,
        error: errors.notFoundError,
      });
      expect(sentryCaptureMessageStub.calledOnce).to.be.true;
    });
  });

  describe('getCopayDetailStatement', () => {
    it('should dispatch DETAIL_FETCH_INIT and DETAIL_FETCH_SUCCESS when fetch succeeds', async () => {
      const copayId = 'copay-123';
      const detailResponse = { id: copayId, amount: 50 };
      apiRequestStub.resolves(detailResponse);

      const thunk = getCopayDetailStatement(copayId);
      await thunk(dispatch);

      expect(dispatch.firstCall.args[0]).to.deep.equal({
        type: MCP_DETAIL_FETCH_INIT,
      });
      expect(dispatch.secondCall.args[0]).to.deep.equal({
        type: MCP_DETAIL_FETCH_SUCCESS,
        response: detailResponse,
      });
    });

    it('should dispatch DETAIL_FETCH_INIT and DETAIL_FETCH_FAILURE when fetch fails', async () => {
      const copayId = 'copay-456';
      apiRequestStub.rejects({ errors: [errors.notFoundError] });

      const thunk = getCopayDetailStatement(copayId);
      await thunk(dispatch);

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
