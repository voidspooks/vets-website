import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { expect } from 'chai';
import sinon from 'sinon';
import { externalServices } from '@department-of-veterans-affairs/platform-monitoring/DowntimeNotification';
import { createServiceMap } from '@department-of-veterans-affairs/platform-monitoring';
import { addHours } from 'date-fns';
import * as RoutedSavableAppModule from 'platform/forms/save-in-progress/RoutedSavableApp';
import App from '../../containers/App';
import formConfig from '../../config/form';

describe('26-4555 App', () => {
  let routedSavableAppStub;

  const defaultLocation = { pathname: '/introduction' };
  const defaultChildren = <div>Test Children</div>;

  const createTestStore = (downtimeState = {}) => {
    const initialState = {
      scheduledDowntime: {
        globalDowntime: null,
        isReady: true,
        isPending: false,
        serviceMap: createServiceMap([]),
        dismissedDowntimeWarnings: [],
        ...downtimeState,
      },
    };
    return configureStore({
      reducer: {
        scheduledDowntime: () => initialState.scheduledDowntime,
      },
      preloadedState: initialState,
    });
  };

  const makeProps = (overrides = {}) => ({
    location: defaultLocation,
    children: defaultChildren,
    ...overrides,
  });

  beforeEach(() => {
    routedSavableAppStub = sinon
      .stub(RoutedSavableAppModule, 'default')
      .callsFake(({ children }) => (
        <div data-testid="routed-savable-app">{children}</div>
      ));
  });

  afterEach(() => {
    routedSavableAppStub.restore();
  });

  describe('form configuration', () => {
    it('uses correct form config', () => {
      expect(formConfig.formId).to.include('26-4555');
      expect(formConfig.title).to.exist;
    });

    it('has form configuration with required properties', () => {
      expect(formConfig).to.have.property('formId');
      expect(formConfig).to.have.property('chapters');
      expect(formConfig).to.have.property('title');
      expect(formConfig).to.have.property('prefillEnabled');
    });

    it('uses sahsha external service for downtime notification', () => {
      expect(externalServices).to.have.property('sahsha');
      expect(externalServices.sahsha).to.not.equal(
        externalServices.lighthouseBenefitsIntake,
      );
    });

    it('formConfig specifies sahsha as the downtime dependency', () => {
      const { dependencies } = formConfig.downtime;

      expect(formConfig.downtime).to.exist;
      expect(dependencies)
        .to.be.an('array')
        .with.lengthOf(1);
      expect(dependencies).to.deep.equal([externalServices.sahsha]);
      expect(dependencies).to.not.include(
        externalServices.lighthouseBenefitsIntake,
      );
    });
  });

  describe('component rendering', () => {
    it('should render the App component', () => {
      const store = createTestStore();
      const props = makeProps();

      const { container } = render(
        <Provider store={store}>
          <App {...props} />
        </Provider>,
      );

      expect(container).to.exist;
    });

    it('should render RoutedSavableApp with formConfig', () => {
      const store = createTestStore();
      const props = makeProps();

      render(
        <Provider store={store}>
          <App {...props} />
        </Provider>,
      );

      expect(routedSavableAppStub.calledOnce).to.be.true;
      const stubCallArgs = routedSavableAppStub.firstCall.args[0];
      expect(stubCallArgs.formConfig).to.equal(formConfig);
      expect(stubCallArgs.currentLocation).to.equal(props.location);
    });

    it('should render children within DowntimeNotification', () => {
      const store = createTestStore();
      const props = makeProps({ children: <h1>Test Content</h1> });

      const { getByText } = render(
        <Provider store={store}>
          <App {...props} />
        </Provider>,
      );

      expect(getByText('Test Content')).to.exist;
    });
  });

  describe('downtime notification states', () => {
    const createDowntimeApproaching = () => {
      return createServiceMap([
        {
          attributes: {
            externalService: 'sahsha',
            status: 'downtimeApproaching',
            startTime: addHours(new Date(), 1).toISOString(),
            endTime: addHours(new Date(), 3).toISOString(),
          },
        },
      ]);
    };

    it('should render when downtime is approaching for sahsha', () => {
      const store = createTestStore({
        serviceMap: createDowntimeApproaching(),
      });
      const props = makeProps();

      const { container } = render(
        <Provider store={store}>
          <App {...props} />
        </Provider>,
      );
      expect(container).to.exist;
    });

    it('should render when no downtime is scheduled', () => {
      const store = createTestStore();
      const props = makeProps();

      const { getByText } = render(
        <Provider store={store}>
          <App {...props} />
        </Provider>,
      );
      expect(getByText('Test Children')).to.exist;
    });
  });
});
