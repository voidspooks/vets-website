import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { $ } from '@department-of-veterans-affairs/platform-forms-system/ui';
import thunk from 'redux-thunk';
import RepTypeSelector from '../../components/search/RepTypeSelector';

describe('RepTypeSelector component', () => {
  const mockStore = configureMockStore([thunk]);
  const store = mockStore({});
  it('should render', () => {
    const { container } = render(
      <Provider store={store}>
        <RepTypeSelector representativeType="veteran_service_officer" />
      </Provider>,
    );

    expect($('va-radio', container)).to.exist;
  });

  it('should render the first va-radio-option as checked', () => {
    const { container } = render(
      <Provider store={store}>
        <RepTypeSelector representativeType="veteran_service_officer" />
      </Provider>,
    );

    const radioOption = container.querySelector(
      'va-radio-option[label="Accredited VSO representative"]',
    );

    expect(radioOption).to.exist;
    expect(radioOption).to.have.attr('checked', 'true');
  });
});
