import React from 'react';
import { renderWithStoreAndRouterV6 } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import sinon from 'sinon';
import { expect } from 'chai';
import { waitFor } from '@testing-library/react';
import * as allergiesApiModule from '../../api/allergiesApi';
import * as prescriptionsApiModule from '../../api/prescriptionsApi';
import { stubAllergiesApi } from '../testing-utils';
import RefillPrescriptionsV2 from '../../containers/RefillPrescriptionsV2';
import reducer from '../../reducers';
import { dateFormat } from '../../util/helpers';

const refillablePrescriptions = require('../fixtures/refillablePrescriptionsList.json');

let sandbox;

const initMockApis = ({
  sinonSandbox,
  prescriptions = refillablePrescriptions,
  isLoading = false,
  isFetching = false,
  refillAlertList = [],
}) => {
  stubAllergiesApi({ sandbox });

  sinonSandbox
    .stub(prescriptionsApiModule, 'useGetRefillablePrescriptionsQuery')
    .returns({
      data: { prescriptions, meta: {}, refillAlertList },
      error: false,
      isLoading,
      isFetching,
    });

  sinonSandbox
    .stub(prescriptionsApiModule, 'useBulkRefillPrescriptionsMutation')
    .returns([
      sinon.stub().resolves({ data: { successfulIds: [], failedIds: [] } }),
      { isLoading: false, error: null },
    ]);
};

describe('Refill Prescriptions V2 Component', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    initMockApis({ sinonSandbox: sandbox });
  });

  afterEach(() => {
    sandbox.restore();
  });

  const initialState = {
    rx: {
      prescriptions: {
        selectedSortOption: 'alphabeticallyByStatus',
      },
      breadcrumbs: {
        list: [
          {
            url: '/my-health/medications/about',
            label: 'About medications',
          },
        ],
      },
    },
    featureToggles: {},
    user: {
      login: {
        currentlyLoggedIn: true,
      },
      profile: {
        userFullName: {
          first: 'Test',
          last: 'User',
        },
        dob: '1990-01-01',
      },
    },
  };

  const setup = (state = initialState) => {
    return renderWithStoreAndRouterV6(<RefillPrescriptionsV2 />, {
      initialState: state,
      reducers: reducer,
      initialEntries: ['/'],
      additionalMiddlewares: [
        allergiesApiModule.allergiesApi.middleware,
        prescriptionsApiModule.prescriptionsApi.middleware,
      ],
    });
  };

  it('renders without errors', () => {
    const screen = setup();
    expect(screen).to.exist;
  });

  it('shows loading indicator when data is loading', async () => {
    sandbox.restore();
    initMockApis({ sinonSandbox: sandbox, isLoading: true });
    const screen = setup();
    expect(screen.getByTestId('loading-indicator')).to.exist;
  });

  describe('when prescriptions are available', () => {
    it('shows h1 with "Medications" text', async () => {
      const screen = setup();
      const title = await screen.findByTestId('refill-page-title');
      expect(title).to.exist;
      expect(title).to.have.text('Medications');
    });

    it('shows h2 with "Medications you can refill now"', async () => {
      const screen = setup();
      const subtitle = await screen.findByTestId('refill-page-subtitle');
      expect(subtitle).to.exist;
      expect(subtitle).to.have.text('Medications you can refill now');
    });

    it('shows the renewal note with correct text', async () => {
      const screen = setup();
      const note = await screen.findByTestId('medications-page-link-note');
      expect(note).to.exist;
      expect(note.textContent).to.include(
        'If you can’t find the medication you’re looking for',
      );
      expect(note.textContent).to.include(
        'you may have already requested a refill',
      );
    });

    it('shows the renewable medications link', async () => {
      const screen = setup();
      const link = await screen.findByTestId('medications-page-link');
      expect(link).to.exist;
      expect(link.textContent).to.include(
        'Go to your list of renewable medications',
      );
    });

    it('shows the refill checkbox group', async () => {
      const screen = setup();
      const checkboxGroup = await screen.findByTestId('refill-checkbox-group');
      expect(checkboxGroup).to.exist;
    });

    it('shows select all checkbox when multiple prescriptions', async () => {
      const screen = setup();
      const selectAll = await screen.findByTestId('select-all-checkbox');
      expect(selectAll).to.exist;
      expect(selectAll).to.have.property(
        'label',
        `Select all ${refillablePrescriptions.length} refills`,
      );
    });

    it('shows the request refill button', async () => {
      const screen = setup();
      const button = await screen.findByTestId('request-refill-button');
      expect(button).to.exist;
    });

    it('shows inner navigation links', async () => {
      const screen = setup();
      const listLink = await screen.findByTestId('list-inner-nav');
      expect(listLink).to.exist;
      const refillStatusLink = await screen.findByTestId(
        'refill-status-inner-nav',
      );
      expect(refillStatusLink).to.exist;
    });

    it('shows prescription checkbox with correct description', async () => {
      const screen = setup();
      const checkbox = await screen.findByTestId(
        'refill-prescription-checkbox-0',
      );
      expect(checkbox).to.exist;
      expect(checkbox).to.have.property('label', 'MELOXICAM 15MG TAB');
      expect(checkbox)
        .to.have.property('checkbox-description')
        .that.includes(
          refillablePrescriptions[0].dispensedDate
            ? `Last filled on ${dateFormat(
                refillablePrescriptions[0].dispensedDate,
              )}`
            : 'Not filled yet',
        );
    });
  });

  describe('when no prescriptions are available', () => {
    beforeEach(() => {
      sandbox.restore();
      initMockApis({
        sinonSandbox: sandbox,
        prescriptions: [],
      });
    });

    it('shows h1 with "Medications" text', async () => {
      const screen = setup();
      const title = await screen.findByTestId('refill-page-title');
      expect(title).to.exist;
      expect(title).to.have.text('Medications');
    });

    it('shows h2 with "You don’t have any available refills"', async () => {
      const screen = setup();
      const subtitle = await screen.findByTestId('refill-page-subtitle');
      expect(subtitle).to.exist;
      expect(subtitle).to.have.text('You don’t have any available refills');
    });

    it('shows the no-refills message with updated text', async () => {
      const screen = setup();
      const message = await screen.findByTestId('no-refills-message');
      expect(message).to.exist;
      expect(message.textContent).to.include(
        'You don’t have any VA medications with available refills',
      );
      expect(message.textContent).to.include('contact your care team');
    });

    it('shows the renewal note', async () => {
      const screen = setup();
      const note = await screen.findByTestId(
        'no-refills-medications-page-link-note',
      );
      expect(note).to.exist;
      expect(note.textContent).to.include(
        'you may have already requested a refill',
      );
    });

    it('shows the renewable medications link', async () => {
      const screen = setup();
      const link = await screen.findByTestId(
        'no-refills-medications-page-link',
      );
      expect(link).to.exist;
      expect(link.textContent).to.include(
        'Go to your list of renewable medications',
      );
    });

    it('does not show the refill checkbox group', async () => {
      const screen = setup();
      await screen.findByTestId('refill-page-title');
      await waitFor(() => {
        expect(screen.queryByTestId('refill-checkbox-group')).to.not.exist;
      });
    });

    it('does not show the request refill button', async () => {
      const screen = setup();
      await screen.findByTestId('refill-page-title');
      await waitFor(() => {
        expect(screen.queryByTestId('request-refill-button')).to.not.exist;
      });
    });
  });
});
