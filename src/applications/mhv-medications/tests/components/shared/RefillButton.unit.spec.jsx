import { expect } from 'chai';
import React from 'react';
import sinon from 'sinon';
import { renderWithStoreAndRouterV6 } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import { fireEvent, waitFor } from '@testing-library/dom';
import {
  mockFetch,
  resetFetch,
} from '@department-of-veterans-affairs/platform-testing/helpers';
import { datadogRum } from '@datadog/browser-rum';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import { prescriptionsApi } from '../../../api/prescriptionsApi';
import reducer from '../../../reducers';
import RefillButton from '../../../components/shared/RefillButton';
import { dataDogActionNames } from '../../../util/dataDogConstants';

describe('Refill Button component', () => {
  const rx = {
    cmopDivisionPhone: '1234567890',
    prescriptionId: 1234567890,
    refillRemaining: 1,
    dispStatus: 'Active',
    isRefillable: true,
    stationNumber: '506',
  };
  const setup = (rxOverrides = {}) => {
    return renderWithStoreAndRouterV6(
      <RefillButton {...{ ...rx, ...rxOverrides }} />,
      {
        initialState: {},
        reducers: reducer,
        initialEntries: ['/1234567890'],
        additionalMiddlewares: [prescriptionsApi.middleware],
      },
    );
  };

  let sandbox;

  beforeEach(() => {
    mockFetch();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    resetFetch();
    sandbox.restore();
  });

  it('renders without errors', () => {
    const screen = setup();
    expect(screen);
  });

  it('renders the refill button when prescription is refillable', () => {
    const screen = setup();
    const button = screen.getByTestId('refill-request-button');
    expect(button).to.exist;
    expect(button).to.have.property('text', 'Request a refill');
  });

  it('renders the button with correct attributes', () => {
    const screen = setup();
    const button = screen.getByTestId('refill-request-button');
    expect(button).to.have.attribute('secondary');
    expect(button).to.have.attribute('id', 'refill-button-1234567890');
    expect(button).to.have.attribute(
      'aria-describedby',
      'card-header-1234567890',
    );
  });

  it('calls datadogRum.addAction with facilityId on click', () => {
    const addActionSpy = sandbox.spy(datadogRum, 'addAction');
    const screen = setup();
    const button = screen.getByTestId('refill-request-button');
    fireEvent.click(button);
    expect(addActionSpy.calledOnce).to.be.true;
    expect(
      addActionSpy.calledWith(
        dataDogActionNames.medicationsListPage.REFILL_BUTTON,
        { facilityId: '506' },
      ),
    ).to.be.true;
  });

  it('dispatches refillPrescription action and shows correct loading message', () => {
    const screen = setup();
    const refillButton = screen.getByTestId('refill-request-button');
    fireEvent.click(refillButton);
    expect(refillButton).to.exist;
    waitFor(() => {
      expect(screen.getByTestId('refill-loader')).to.exist;
      expect(screen.getByText('Submitting your request...')).to.exist;
    });
  });

  it('does not render the refill button when the prescription is NOT refillable', () => {
    const screen = setup({ isRefillable: false });
    expect(screen.queryByTestId('refill-request-button')).to.not.exist;
  });

  it('does not render the refill button when isRefillable is undefined', () => {
    const screen = setup({ isRefillable: undefined });
    expect(screen.queryByTestId('refill-request-button')).to.not.exist;
  });

  describe('when mhvMedicationsManagementImprovements flag is enabled', () => {
    it('renders "Request refill"', () => {
      const screen = renderWithStoreAndRouterV6(<RefillButton {...rx} />, {
        initialState: {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
          },
        },
        reducers: reducer,
        initialEntries: ['/1234567890'],
        additionalMiddlewares: [prescriptionsApi.middleware],
      });
      const button = screen.getByTestId('refill-request-button');
      expect(button).to.have.property('text', 'Request refill');
    });
  });
});
