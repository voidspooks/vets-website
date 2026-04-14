import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import { Provider } from 'react-redux';
import CCServiceTypeAhead from '../../../../components/search-form/service-type/CCServiceTypeAhead';
import { SR_ANNOUNCE_DELAY_MS } from '../../../../constants';

const mockSpecialties = [
  { specialtyCode: '101Y00000X', name: 'Counselor' },
  { specialtyCode: '103T00000X', name: 'Psychologist' },
  { specialtyCode: '1041C0700X', name: 'Clinical Social Worker' },
];

const createMockStore = (overrides = {}) => ({
  getState: () => ({
    searchQuery: {
      serviceType: '',
      specialties: null,
      fetchSvcsInProgress: false,
      fetchSvcsRawData: mockSpecialties,
      ...overrides,
    },
  }),
  subscribe: () => {},
  dispatch: () => {},
});

const defaultProps = {
  getProviderSpecialties: () => Promise.resolve(mockSpecialties),
  handleServiceTypeChange: () => {},
  initialSelectedServiceType: null,
  showError: false,
  useProgressiveDisclosure: true,
};

const getStatusDiv = container =>
  container.querySelector('.usa-combo-box__status');

describe('CCServiceTypeAhead SR status announcement', () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('announces result count after delay when typing matches services', () => {
    const store = createMockStore();
    const { container, getByRole } = render(
      <Provider store={store}>
        <CCServiceTypeAhead {...defaultProps} />
      </Provider>,
    );
    const input = getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Cou' } });
    fireEvent.focus(input);

    clock.tick(SR_ANNOUNCE_DELAY_MS);

    expect(getStatusDiv(container).textContent).to.equal('1 result for Cou');
  });

  it('clears status message on selection', () => {
    const store = createMockStore();
    const { container, getByRole, getByText } = render(
      <Provider store={store}>
        <CCServiceTypeAhead {...defaultProps} />
      </Provider>,
    );
    const input = getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Cou' } });
    fireEvent.focus(input);
    clock.tick(SR_ANNOUNCE_DELAY_MS);

    expect(getStatusDiv(container).textContent).to.equal('1 result for Cou');

    fireEvent.click(getByText('Counselor'));

    expect(getStatusDiv(container).textContent).to.equal('');
  });

  it('does not announce when input is below minimum characters', () => {
    const store = createMockStore();
    const { container, getByRole } = render(
      <Provider store={store}>
        <CCServiceTypeAhead {...defaultProps} />
      </Provider>,
    );
    const input = getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Co' } });

    clock.tick(SR_ANNOUNCE_DELAY_MS);

    expect(getStatusDiv(container).textContent).to.equal('');
  });

  it('cleans up timer on unmount', () => {
    const clearTimeoutSpy = sinon.spy(global, 'clearTimeout');
    const store = createMockStore();
    const { unmount } = render(
      <Provider store={store}>
        <CCServiceTypeAhead {...defaultProps} />
      </Provider>,
    );
    const input = document.getElementById('service-type-ahead-input');

    fireEvent.change(input, { target: { value: 'Cou' } });
    fireEvent.focus(input);

    unmount();

    expect(clearTimeoutSpy.called).to.be.true;
    clearTimeoutSpy.restore();
  });

  it('announces "No results available." when typing yields zero matches', () => {
    const store = createMockStore();
    const { container, getByRole } = render(
      <Provider store={store}>
        <CCServiceTypeAhead {...defaultProps} />
      </Provider>,
    );
    const input = getByRole('combobox');

    fireEvent.change(input, { target: { value: 'zzz' } });
    fireEvent.focus(input);

    clock.tick(SR_ANNOUNCE_DELAY_MS);

    expect(getStatusDiv(container).textContent).to.equal(
      'No results available.',
    );
  });

  it('has empty status when no input is provided', () => {
    const store = createMockStore();
    const { container, getByRole } = render(
      <Provider store={store}>
        <CCServiceTypeAhead {...defaultProps} />
      </Provider>,
    );

    expect(getStatusDiv(container).textContent).to.equal('');

    const input = getByRole('combobox');
    fireEvent.change(input, { target: { value: '' } });

    expect(getStatusDiv(container).textContent).to.equal('');
  });
});
