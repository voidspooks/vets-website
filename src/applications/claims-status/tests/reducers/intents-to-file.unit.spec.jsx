import { expect } from 'chai';

import intentsToFileReducer from '../../reducers/intents-to-file';
import {
  FETCH_INTENTS_TO_FILE_ERROR,
  FETCH_INTENTS_TO_FILE_PENDING,
  FETCH_INTENTS_TO_FILE_SUCCESS,
} from '../../actions/types';

describe('intentsToFileReducer', () => {
  it('returns the initial state', () => {
    const state = intentsToFileReducer(undefined, { type: '@@INIT' });
    expect(state).to.deep.equal({ data: [], loading: true, error: null });
  });

  it('handles FETCH_INTENTS_TO_FILE_PENDING', () => {
    const state = intentsToFileReducer(
      { data: [{ id: '1' }], loading: false, error: true },
      { type: FETCH_INTENTS_TO_FILE_PENDING },
    );
    expect(state).to.deep.equal({ data: [], loading: true, error: null });
  });

  it('handles FETCH_INTENTS_TO_FILE_SUCCESS', () => {
    const mockData = [{ id: '1' }, { id: '2' }];
    const state = intentsToFileReducer(
      { data: [], loading: true, error: null },
      { type: FETCH_INTENTS_TO_FILE_SUCCESS, data: mockData },
    );
    expect(state).to.deep.equal({
      data: mockData,
      loading: false,
      error: null,
    });
  });

  it('handles FETCH_INTENTS_TO_FILE_ERROR', () => {
    const state = intentsToFileReducer(
      { data: [{ id: '1' }], loading: true, error: null },
      { type: FETCH_INTENTS_TO_FILE_ERROR },
    );
    expect(state).to.deep.equal({ data: [], loading: false, error: true });
  });
});
