import { expect } from 'chai';
import { medicalCopaysReducer as reducer } from '../../../combined/reducers';
import copays from '../e2e/fixtures/mocks/copays.json';
import {
  MCP_STATEMENTS_FETCH_INIT,
  MCP_STATEMENTS_FETCH_SUCCESS,
  MCP_STATEMENTS_FETCH_FAILURE,
  MCP_DETAIL_FETCH_INIT,
  MCP_DETAIL_FETCH_SUCCESS,
} from '../../../combined/actions/copays';

describe('Medical Copays Reducer', () => {
  it('initial state has selectedStatement null', () => {
    const reducedState = reducer(undefined, { type: '@@INIT' });
    expect(reducedState.selectedStatement).to.be.null;
  });

  it('MCP_DETAIL_FETCH_INIT clears selectedStatement and sets isCopayDetailLoading', () => {
    const withSelection = reducer(undefined, {
      type: MCP_DETAIL_FETCH_SUCCESS,
      response: { data: { id: 'statement-1' } },
    });
    expect(withSelection.selectedStatement).to.deep.equal({
      id: 'statement-1',
    });

    const afterInit = reducer(withSelection, { type: MCP_DETAIL_FETCH_INIT });
    expect(afterInit.selectedStatement).to.be.null;
    expect(afterInit.isCopayDetailLoading).to.be.true;
  });

  it('MCP_STATEMENTS_FETCH_INIT', () => {
    const action = {
      type: MCP_STATEMENTS_FETCH_INIT,
    };
    const reducedState = reducer(undefined, action);
    expect(reducedState.pending).to.be.true;
  });

  it('MCP_STATEMENTS_FETCH_SUCCESS', () => {
    const action = {
      type: MCP_STATEMENTS_FETCH_SUCCESS,
      response: copays.data,
      meta: { pagination: { currentPage: 2 } },
      shouldUseLighthouseCopays: true,
    };
    const reducedState = reducer(undefined, action);
    expect(reducedState.pending).to.be.false;
    expect(reducedState.statements).to.deep.equal({
      data: copays.data,
      meta: { pagination: { currentPage: 2 } },
    });
    expect(reducedState.shouldUseLighthouseCopays).to.be.true;
  });

  it('MCP_STATEMENTS_FETCH_SUCCESS sets shouldUseLighthouseCopays to false when provided', () => {
    const action = {
      type: MCP_STATEMENTS_FETCH_SUCCESS,
      response: copays.data,
      shouldUseLighthouseCopays: false,
    };
    const reducedState = reducer(undefined, action);
    expect(reducedState.shouldUseLighthouseCopays).to.be.false;
  });

  it('MCP_STATEMENTS_FETCH_FAILURE', () => {
    const errorResponse = {
      title: 'Not found',
      detail: 'There are no routes matching your request: v0/medical_copays',
      code: '411',
      status: '404',
    };
    const action = {
      type: MCP_STATEMENTS_FETCH_FAILURE,
      error: errorResponse,
    };
    const reducedState = reducer(undefined, action);
    expect(reducedState.pending).to.be.false;
    expect(reducedState.error).to.deep.equal(errorResponse);
  });
});
