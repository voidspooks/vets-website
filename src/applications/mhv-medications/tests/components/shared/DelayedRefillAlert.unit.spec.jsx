import { expect } from 'chai';
import sinon from 'sinon';
import React from 'react';
import { renderWithStoreAndRouterV6 } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import DelayedRefillAlert from '../../../components/shared/DelayedRefillAlert';
import reducer from '../../../reducers';

const refillAlertList = [
  {
    prescriptionId: 123456,
    prescriptionName: 'Test name 1',
  },
  {
    prescriptionId: 234567,
    prescriptionName: 'Test name 2',
  },
];

// Test data for V2 API response format where only `id` is available
// TODO: Remove this test data after vets-api PR #26244 is deployed
const refillAlertListWithIdOnly = [
  {
    id: '345678',
    prescriptionName: 'V2 API Test name 1',
  },
  {
    id: '456789',
    prescriptionName: 'V2 API Test name 2',
  },
];

const setup = (alertList = refillAlertList) => {
  return renderWithStoreAndRouterV6(
    <DelayedRefillAlert refillAlertList={alertList} />,
    {
      initialState: {
        rx: {
          refillAlertList: alertList,
          showRefillProgressContent: true,
        },
      },
      reducers: reducer,
    },
  );
};

let sandbox;

describe('Alert if refill is taking longer than expected', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('renders without errors', () => {
    const screen = setup();
    expect(screen);
    screen.getByTestId('rxDelay-alert-message');
  });

  it('lists prescriptions that are running late', () => {
    const screen = setup();

    expect(
      screen.getByTestId(
        `refill-alert-link-${refillAlertList[0].prescriptionId}`,
      ),
    );
    expect(
      screen.getByTestId(
        `refill-alert-link-${refillAlertList[1].prescriptionId}`,
      ),
    );
  });

  // Test for V2 API fallback where only `id` is available (not `prescriptionId`)
  // TODO: Remove this test after vets-api PR #26244 is deployed
  it('falls back to id when prescriptionId is not available (V2 API workaround)', () => {
    const screen = setup(refillAlertListWithIdOnly);

    expect(
      screen.getByTestId(
        `refill-alert-link-${refillAlertListWithIdOnly[0].id}`,
      ),
    );
    expect(
      screen.getByTestId(
        `refill-alert-link-${refillAlertListWithIdOnly[1].id}`,
      ),
    );
  });

  it('generates correct link href using prescriptionId (V1 API)', () => {
    const screen = setup();

    const link = screen.getByTestId(
      `refill-alert-link-${refillAlertList[0].prescriptionId}`,
    );
    expect(link.closest('a').getAttribute('href')).to.contain(
      `/prescription/${refillAlertList[0].prescriptionId}`,
    );
  });

  it('generates correct link href when only id is available (V2 API)', () => {
    const screen = setup(refillAlertListWithIdOnly);

    const link = screen.getByTestId(
      `refill-alert-link-${refillAlertListWithIdOnly[0].id}`,
    );
    expect(link.closest('a').getAttribute('href')).to.contain(
      `/prescription/${refillAlertListWithIdOnly[0].id}`,
    );
  });

  it('generates correct link href with stationNumber', () => {
    const alertListWithStation = [
      {
        prescriptionId: 111222,
        prescriptionName: 'Test with station',
        stationNumber: '688',
      },
    ];
    const screen = setup(alertListWithStation);

    const link = screen.getByTestId(`refill-alert-link-111222`);
    const href = link.closest('a').getAttribute('href');
    expect(href).to.contain('/prescription/111222');
    expect(href).to.contain('station_number=688');
  });

  it('prefers prescriptionId over id when both are present', () => {
    const alertListWithBoth = [
      {
        prescriptionId: 999888,
        id: 'should-not-use',
        prescriptionName: 'Both IDs present',
      },
    ];
    const screen = setup(alertListWithBoth);

    const link = screen.getByTestId('refill-alert-link-999888');
    expect(link.closest('a').getAttribute('href')).to.contain(
      '/prescription/999888',
    );
  });

  it('sorts prescriptions alphabetically by name', () => {
    const unsortedList = [
      { prescriptionId: 1, prescriptionName: 'Zoloft' },
      { prescriptionId: 2, prescriptionName: 'Amoxicillin' },
      { prescriptionId: 3, prescriptionName: 'Metformin' },
    ];
    const screen = setup(unsortedList);

    const links = screen.getAllByRole('link');
    expect(links[0].textContent).to.equal('Amoxicillin');
    expect(links[1].textContent).to.equal('Metformin');
    expect(links[2].textContent).to.equal('Zoloft');
  });
});
