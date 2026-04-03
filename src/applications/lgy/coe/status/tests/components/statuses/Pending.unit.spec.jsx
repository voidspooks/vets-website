import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { $ } from 'platform/forms-system/src/js/utilities/ui';

import Pending from '../../../components/statuses/Pending';

const mockStore = state => createStore(() => state);

const defaultProps = {
  referenceNumber: '18959346',
  requestDate: 1722543158000,
  status: 'pending',
};

const buildStore = ({ loading = false, enableCveStatus = false } = {}) =>
  mockStore({
    featureToggles: {
      loading,
      // eslint-disable-next-line camelcase
      coe_enable_cve_status: enableCveStatus,
    },
  });

describe('Pending', () => {
  it('should render loading indicator while feature toggles are loading', () => {
    const store = buildStore({ loading: true });
    const { container } = render(
      <Provider store={store}>
        <Pending {...defaultProps} />
      </Provider>,
    );
    expect($('va-loading-indicator', container)).to.exist;
  });

  it('should render legacy StatusAlert when feature toggle is disabled', () => {
    const store = buildStore({ enableCveStatus: false });
    const { container } = render(
      <Provider store={store}>
        <Pending {...defaultProps} />
      </Provider>,
    );
    expect($('va-alert', container)).to.exist;
    expect($('h2', container)).to.exist;
  });

  it('should render document uploader when feature toggle is disabled and uploadsNeeded', () => {
    const store = buildStore({ enableCveStatus: false });
    const { container } = render(
      <Provider store={store}>
        <Pending {...defaultProps} uploadsNeeded />
      </Provider>,
    );
    expect($('va-alert', container)).to.exist;
    expect($('va-file-input', container)).to.exist;
  });

  it('should render PendingAlert when feature toggle is enabled and no uploads needed', () => {
    const store = buildStore({ enableCveStatus: true });
    const { container } = render(
      <Provider store={store}>
        <Pending {...defaultProps} />
      </Provider>,
    );
    const alert = $('va-alert', container);
    expect(alert).to.exist;
    expect(alert.getAttribute('status')).to.equal('info');
    expect(container.textContent).to.contain('We’re reviewing your request');
  });

  it('should render PendingUploadAlert when feature toggle is enabled and uploadsNeeded', () => {
    const store = buildStore({ enableCveStatus: true });
    const { container } = render(
      <Provider store={store}>
        <Pending {...defaultProps} uploadsNeeded />
      </Provider>,
    );
    const alert = $('va-alert', container);
    expect(alert).to.exist;
    expect(alert.getAttribute('status')).to.equal('warning');
    expect(container.textContent).to.contain(
      'We need more information from you',
    );
    expect($('va-file-input', container)).to.exist;
  });

  it('should always render the static content sections', () => {
    const store = buildStore({ enableCveStatus: false });
    const { container } = render(
      <Provider store={store}>
        <Pending {...defaultProps} />
      </Provider>,
    );
    expect(container.textContent).to.contain('Should I request a COE again?');
  });
});
