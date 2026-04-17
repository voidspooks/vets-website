import React from 'react';
import { within } from '@testing-library/react';
import { expect } from 'chai';
import { renderWithStoreAndRouterV6 } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import RefillStatusProcessList from '../../../components/RefillStatus/RefillStatusProcessList';
import reducers from '../../../reducers';

describe('RefillStatusProcessList Component', () => {
  const recentDate = new Date().toISOString();

  const defaultProps = {
    submitted: [
      {
        prescriptionId: 1,
        prescriptionName: 'Medication A',
        dispStatus: 'Active: Submitted',
        refillSubmitDate: '2025-01-10T10:00:00Z',
      },
      {
        prescriptionId: 2,
        prescriptionName: 'Medication B',
        dispStatus: 'Active: Submitted',
        refillSubmitDate: '2025-01-11T10:00:00Z',
      },
    ],
    inProgress: [
      {
        prescriptionId: 3,
        prescriptionName: 'Medication C',
        dispStatus: 'Active: Refill in Process',
        refillDate: '2025-01-20T10:00:00Z',
      },
    ],
    shipped: [
      {
        prescriptionId: 4,
        prescriptionName: 'Medication D',
        dispStatus: 'Active',
        trackingList: [{ completeDateTime: recentDate }],
      },
      {
        prescriptionId: 5,
        prescriptionName: 'Medication E',
        dispStatus: 'Active',
        trackingList: [{ completeDateTime: recentDate }],
      },
    ],
    tooEarly: [],
  };

  const setup = (props = defaultProps, initialState = {}) =>
    renderWithStoreAndRouterV6(<RefillStatusProcessList {...props} />, {
      initialState,
      reducers,
    });

  it('renders without errors', () => {
    const screen = setup();
    expect(screen).to.exist;
  });

  it('renders three va-process-list-item elements', () => {
    const { container } = setup();
    const processListItems = container.querySelectorAll('va-process-list-item');
    expect(processListItems.length).to.equal(3);
  });

  it('renders prescriptions in their correct sections when all categories have data', () => {
    const screen = setup();

    const submittedSection = within(
      screen.getByTestId('submitted-prescriptions'),
    );
    expect(submittedSection.getByRole('link', { name: 'Medication A' })).to
      .exist;
    expect(submittedSection.getByRole('link', { name: 'Medication B' })).to
      .exist;

    const inProgressSection = within(
      screen.getByTestId('refill-status-prescriptions'),
    );
    expect(inProgressSection.getByRole('link', { name: 'Medication C' })).to
      .exist;

    const shippedSection = within(screen.getByTestId('shipped-prescriptions'));
    expect(shippedSection.getByRole('link', { name: 'Medication D' })).to.exist;
    expect(shippedSection.getByRole('link', { name: 'Medication E' })).to.exist;
  });

  const emptyProps = {
    submitted: [],
    inProgress: [],
    shipped: [],
    tooEarly: [],
  };

  describe('SubmittedStep', () => {
    it('renders the submitted step with correct header', () => {
      const { container } = setup();
      const processListItems = container.querySelectorAll(
        'va-process-list-item',
      );
      const submittedStep = processListItems[0];
      expect(submittedStep.getAttribute('header')).to.equal(
        'Request submitted',
      );
    });

    it('displays singular text when one prescription is submitted', () => {
      const props = {
        ...emptyProps,
        submitted: [
          {
            prescriptionId: 1,
            prescriptionName: 'Medication A',
            dispStatus: 'Active: Submitted',
            refillSubmitDate: '2025-01-10T10:00:00Z',
          },
        ],
      };
      const screen = setup(props);
      expect(screen.getByText(/this prescription/)).to.exist;
    });

    it('displays plural text when multiple prescriptions are submitted', () => {
      const props = {
        ...emptyProps,
        submitted: [
          {
            prescriptionId: 1,
            prescriptionName: 'Medication A',
            dispStatus: 'Active: Submitted',
            refillSubmitDate: '2025-01-10T10:00:00Z',
          },
          {
            prescriptionId: 2,
            prescriptionName: 'Medication B',
            dispStatus: 'Active: Submitted',
            refillSubmitDate: '2025-01-11T10:00:00Z',
          },
        ],
      };
      const screen = setup(props);
      expect(screen.getByText(/these prescriptions/)).to.exist;
    });

    it('displays the note about medications prescribed in the last 24 hours', () => {
      const screen = setup();
      expect(screen.getByText(/in the last 24 hours may not appear here yet/))
        .to.exist;
    });

    it('renders Prescription components for each submitted prescription', () => {
      const props = {
        ...emptyProps,
        submitted: [
          {
            prescriptionId: 1,
            prescriptionName: 'Medication A',
            dispStatus: 'Active: Submitted',
            refillSubmitDate: '2025-01-10T10:00:00Z',
          },
          {
            prescriptionId: 2,
            prescriptionName: 'Medication B',
            dispStatus: 'Active: Submitted',
            refillSubmitDate: null,
          },
        ],
      };
      const screen = setup(props);
      const submittedSection = within(
        screen.getByTestId('submitted-prescriptions'),
      );

      const linkA = submittedSection.getByRole('link', {
        name: 'Medication A',
      });
      expect(linkA).to.have.attribute('href', '/prescription/1');

      const linkB = submittedSection.getByRole('link', {
        name: 'Medication B',
      });
      expect(linkB).to.have.attribute('href', '/prescription/2');
    });

    it('displays empty state text when no prescriptions are submitted', () => {
      const screen = setup(emptyProps);
      expect(screen.getByText('You don’t have any refill requests.')).to.exist;
    });

    it('does not display the too early section when no tooEarly prescriptions exist', () => {
      const screen = setup();
      expect(screen.queryByText(/Too early to refill/)).to.be.null;
    });

    it('renders TooEarlyToRefillCard when tooEarly has prescriptions', () => {
      const props = {
        ...emptyProps,
        tooEarly: [
          {
            prescriptionId: 1,
            prescriptionName: 'Too Early Med',
            dispStatus: 'Active',
            refillSubmitDate: '2025-01-10T10:00:00Z',
          },
        ],
      };
      const screen = setup(props);
      expect(screen.getByTestId('too-early-section')).to.exist;
    });
  });

  describe('InProgressStep', () => {
    it('renders the submitted step with correct header', () => {
      const { container } = setup();
      const processListItems = container.querySelectorAll(
        'va-process-list-item',
      );
      const inProgressStep = processListItems[1];
      expect(inProgressStep.getAttribute('header')).to.equal(
        'Fill in progress',
      );
    });

    it('displays singular text when one prescription is in progress', () => {
      const props = {
        ...emptyProps,
        inProgress: [
          {
            prescriptionId: 1,
            prescriptionName: 'Medication A',
            dispStatus: 'Active: Refill in Process',
            refillDate: '2025-01-20T10:00:00Z',
          },
        ],
      };
      const screen = setup(props);
      expect(screen.getByText(/this prescription/)).to.exist;
    });

    it('displays plural text when multiple prescriptions are in progress', () => {
      const props = {
        ...emptyProps,
        inProgress: [
          {
            prescriptionId: 1,
            prescriptionName: 'Medication A',
            dispStatus: 'Active: Refill in Process',
            refillDate: '2025-01-20T10:00:00Z',
          },
          {
            prescriptionId: 2,
            prescriptionName: 'Medication B',
            dispStatus: 'Active: Refill in Process',
            refillDate: '2025-01-21T10:00:00Z',
          },
        ],
      };
      const screen = setup(props);
      expect(screen.getByText(/these prescriptions/)).to.exist;
    });

    it('displays empty state text when no prescriptions are in progress', () => {
      const screen = setup(emptyProps);
      expect(screen.getByText('You don’t have any fills in progress.')).to
        .exist;
    });
    it('does not display OH pharmacy text for non-OH users', () => {
      const props = {
        ...emptyProps,
        inProgress: [
          {
            prescriptionId: 1,
            prescriptionName: 'Medication A',
            dispStatus: 'Active: Refill in Process',
            refillDate: '2025-01-20T10:00:00Z',
          },
        ],
      };
      const screen = setup(props);
      expect(screen.queryByText(/call your VA pharmacy/)).to.be.null;
    });

    it('displays OH pharmacy text for OH users when prescriptions are in progress', () => {
      const ohState = {
        drupalStaticData: {
          vamcEhrData: {
            data: {
              cernerFacilities: [{ vhaId: '123' }],
            },
          },
        },
        user: {
          profile: {
            facilities: [{ facilityId: '123' }],
          },
        },
      };
      const props = {
        ...emptyProps,
        inProgress: [
          {
            prescriptionId: 1,
            prescriptionName: 'Medication A',
            dispStatus: 'Active: Refill in Process',
            refillDate: '2025-01-20T10:00:00Z',
          },
        ],
      };
      const screen = setup(props, ohState);
      expect(screen.getByText(/call your VA pharmacy’s automated refill line/))
        .to.exist;
    });
    it('renders Prescription components for each in-progress prescription', () => {
      const props = {
        ...emptyProps,
        inProgress: [
          {
            prescriptionId: 1,
            prescriptionName: 'Medication A',
            dispStatus: 'Active: Refill in Process',
            refillDate: '2025-01-20T10:00:00Z',
          },
          {
            prescriptionId: 2,
            prescriptionName: 'Medication B',
            dispStatus: 'Active: Refill in Process',
            refillDate: null,
          },
        ],
      };
      const screen = setup(props);
      const inProgressSection = within(
        screen.getByTestId('refill-status-prescriptions'),
      );

      const linkA = inProgressSection.getByRole('link', {
        name: 'Medication A',
      });
      expect(linkA).to.have.attribute('href', '/prescription/1');

      const linkB = inProgressSection.getByRole('link', {
        name: 'Medication B',
      });
      expect(linkB).to.have.attribute('href', '/prescription/2');
    });
  });

  describe('ShippedStep', () => {
    it('renders the submitted step with correct header', () => {
      const { container } = setup();
      const processListItems = container.querySelectorAll(
        'va-process-list-item',
      );
      const shippedStep = processListItems[2];
      expect(shippedStep.getAttribute('header')).to.equal(
        'Prescription shipped',
      );
    });

    it('displays singular text when one prescription is shipped', () => {
      const props = {
        ...emptyProps,
        shipped: [
          {
            prescriptionId: 1,
            prescriptionName: 'Medication A',
            dispStatus: 'Active',
            trackingList: [{ completeDateTime: new Date().toISOString() }],
          },
        ],
      };
      const screen = setup(props);
      expect(
        screen.getByText(
          /This prescription is on its way to you or has already arrived./,
        ),
      ).to.exist;
    });

    it('displays plural text when multiple prescriptions are shipped', () => {
      const recentDateTime = new Date().toISOString();
      const props = {
        ...emptyProps,
        shipped: [
          {
            prescriptionId: 1,
            prescriptionName: 'Medication A',
            dispStatus: 'Active',
            trackingList: [{ completeDateTime: recentDateTime }],
          },
          {
            prescriptionId: 2,
            prescriptionName: 'Medication B',
            dispStatus: 'Active',
            trackingList: [{ completeDateTime: recentDateTime }],
          },
        ],
      };
      const screen = setup(props);
      expect(
        screen.getByText(
          /These prescriptions are on their way to you or have already arrived./,
        ),
      ).to.exist;
    });

    it('displays empty state text when no prescriptions are shipped', () => {
      const screen = setup(emptyProps);
      expect(
        screen.getByText(
          'You don’t have any prescriptions shipped within the past 15 days.',
        ),
      ).to.exist;
    });

    it('renders Prescription components for each shipped prescription', () => {
      const recentDateTime = new Date().toISOString();
      const props = {
        ...emptyProps,
        shipped: [
          {
            prescriptionId: 1,
            prescriptionName: 'Medication A',
            dispStatus: 'Active',
            trackingList: [{ completeDateTime: recentDateTime }],
          },
          {
            prescriptionId: 2,
            prescriptionName: 'Medication B',
            dispStatus: 'Active',
            trackingList: [{ completeDateTime: recentDateTime }],
          },
        ],
      };
      const screen = setup(props);
      const shippedSection = within(
        screen.getByTestId('shipped-prescriptions'),
      );

      const linkA = shippedSection.getByRole('link', {
        name: 'Medication A',
      });
      expect(linkA).to.have.attribute('href', '/prescription/1');

      const linkB = shippedSection.getByRole('link', {
        name: 'Medication B',
      });
      expect(linkB).to.have.attribute('href', '/prescription/2');
    });
  });
});
