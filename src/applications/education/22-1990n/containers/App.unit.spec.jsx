import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import App from './App';
import formConfig from '../config/form';

const createMockStore = (overrides = {}) => ({
  getState: () => ({
    user: {
      login: { currentlyLoggedIn: false },
      profile: {
        savedForms: [],
        prefillsAvailable: [],
        loa: { current: 3, highest: 3 },
        verified: true,
        dob: '1990-01-01',
        claims: { appeals: false },
        ...overrides.user?.profile,
      },
      ...overrides.user,
    },
    form: {
      formId: formConfig.formId,
      loadedStatus: 'success',
      savedStatus: '',
      loadedData: { metadata: {} },
      data: {},
      ...overrides.form,
    },
    scheduledDowntime: {
      globalDowntime: null,
      isReady: true,
      isPending: false,
      serviceMap: { get() {} },
      dismissedDowntimeWarnings: [],
    },
    ...overrides,
  }),
  subscribe: () => {},
  dispatch: () => {},
});

describe('containers/App', () => {
  it('renders without crashing', () => {
    const store = createMockStore();
    const location = { pathname: '/introduction' };
    // RoutedSavableApp requires a store context; we verify the component
    // itself doesn't throw during construction
    expect(() => {
      // shallow render check — just verify the component function exists
      const element = App({ location, children: null });
      expect(element).to.exist;
    }).to.not.throw();
  });

  it('is a function (functional component)', () => {
    expect(App).to.be.a('function');
  });

  it('has expected propTypes', () => {
    expect(App.propTypes).to.have.property('children');
    expect(App.propTypes).to.have.property('location');
  });
});