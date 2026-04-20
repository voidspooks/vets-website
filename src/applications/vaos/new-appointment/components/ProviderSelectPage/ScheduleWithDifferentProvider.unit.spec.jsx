import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import userEvent from '@testing-library/user-event';
import ScheduleWithDifferentProvider from './ScheduleWithDifferentProvider';
import {
  createTestStore,
  renderWithStoreAndRouter,
} from '../../../tests/mocks/setup';

const defaultState = {
  featureToggles: {
    vaOnlineSchedulingUseVpg: true,
  },
};

describe('ScheduleWithDifferentProvider', () => {
  it('should display both options when user is eligible', () => {
    const store = createTestStore(defaultState);
    const selectedFacility = {
      id: '692',
      name: 'White City VA Medical Center',
    };

    const screen = renderWithStoreAndRouter(
      <ScheduleWithDifferentProvider
        isEligibleForRequest
        overRequestLimit={false}
        selectedFacility={selectedFacility}
      />,
      { store },
    );

    expect(screen.getByText(/Option 2: Call the facility/i)).to.exist;
    expect(
      screen.getByText(
        /Option 1: Request your preferred date and time online/i,
      ),
    ).to.exist;

    // Use getByTestId to find the va-link component
    expect(screen.getByTestId('request-appointment-link')).to.exist;
  });

  it('should only display Call and ask to schedule with provider option when over request limit', () => {
    const store = createTestStore(defaultState);
    const selectedFacility = {
      id: '692',
      name: 'White City VA Medical Center',
      telecom: [
        {
          system: 'phone',
          value: '541-123-4567',
        },
      ],
    };

    const screen = renderWithStoreAndRouter(
      <ScheduleWithDifferentProvider
        isEligibleForRequest
        overRequestLimit
        selectedFacility={selectedFacility}
      />,
      { store },
    );

    // Should display the call-only option
    expect(
      screen.getByText(
        /Call the facility and ask to schedule with that provider:/i,
      ),
    ).to.exist;
    expect(
      screen.getByText('If you want to schedule with a different provider'),
    ).to.exist;

    // Options to request not available since not eligible due to over limit
    expect(screen.queryByText(/Option 2: Call the facility/i)).to.not.exist;
    expect(
      screen.queryByText(
        /Option 1: Request your preferred date and time online/i,
      ),
    ).to.not.exist;
    expect(screen.queryByTestId('request-appointment-link')).to.not.exist;
  });

  it('should only display call option when user is not eligible for requests', () => {
    const store = createTestStore(defaultState);
    const selectedFacility = {
      id: '692',
      name: 'White City VA Medical Center',
      telecom: [
        {
          system: 'phone',
          value: '541-123-4567',
        },
      ],
    };

    const screen = renderWithStoreAndRouter(
      <ScheduleWithDifferentProvider
        isEligibleForRequest={false}
        overRequestLimit={false}
        selectedFacility={selectedFacility}
      />,
      { store },
    );

    // Should display the call-only option
    expect(
      screen.getByText(
        /Call the facility and ask to schedule with that provider:/i,
      ),
    ).to.exist;

    // Should NOT display the online request options
    expect(screen.queryByText(/Option 2: Call the facility/i)).to.not.exist;
    expect(
      screen.queryByText(
        /Option 1: Request your preferred date and time online/i,
      ),
    ).to.not.exist;
    expect(screen.queryByTestId('request-appointment-link')).to.not.exist;
  });

  it('should render nothing when patientRelationshipsError is true', () => {
    const store = createTestStore(defaultState);
    const selectedFacility = {
      id: '692',
      name: 'White City VA Medical Center',
    };

    const screen = renderWithStoreAndRouter(
      <ScheduleWithDifferentProvider
        isEligibleForRequest
        overRequestLimit={false}
        selectedFacility={selectedFacility}
        patientRelationshipsError
      />,
      { store },
    );

    expect(
      screen.queryByText(/If you want to schedule with a different provider/i),
    ).to.not.exist;
    expect(screen.queryByText(/How to schedule/i)).to.not.exist;
    expect(screen.queryByText(/Call the facility/i)).to.not.exist;
    expect(screen.queryByText(/Option 1/i)).to.not.exist;
    expect(screen.queryByText(/Option 2/i)).to.not.exist;
  });

  it('should display "How to schedule" title when hasProviders is false and eligible', () => {
    const store = createTestStore(defaultState);
    const selectedFacility = {
      id: '692',
      name: 'White City VA Medical Center',
    };

    const screen = renderWithStoreAndRouter(
      <ScheduleWithDifferentProvider
        isEligibleForRequest
        overRequestLimit={false}
        selectedFacility={selectedFacility}
        hasProviders={false}
      />,
      { store },
    );

    // Should display "How to schedule" instead of "If you want to schedule with a different provider"
    expect(screen.getByText('How to schedule')).to.exist;
    expect(
      screen.queryByText(/If you want to schedule with a different provider/i),
    ).to.not.exist;

    // Should still show both options
    expect(
      screen.getByText(
        /Option 1: Request your preferred date and time online/i,
      ),
    ).to.exist;
    expect(screen.getByText(/Option 2: Call the facility/i)).to.exist;
    expect(screen.getByTestId('request-appointment-link')).to.exist;
  });

  it('should only display call option under provider list when requestEligibilityError is true', () => {
    const store = createTestStore(defaultState);
    const selectedFacility = {
      id: '692',
      name: 'White City VA Medical Center',
      telecom: [
        {
          system: 'phone',
          value: '541-123-4567',
        },
      ],
    };

    const screen = renderWithStoreAndRouter(
      <ScheduleWithDifferentProvider
        isEligibleForRequest
        selectedFacility={selectedFacility}
        requestEligibilityError
      />,
      { store },
    );

    // Should display the title
    expect(
      screen.getByText('If you want to schedule with a different provider'),
    ).to.exist;

    // Should display call to schedule text with facility phone
    expect(
      screen.getByText(
        /Call the facility and ask to schedule with that provider:/i,
      ),
    ).to.exist;

    const phoneEl = screen.getByTestId('facility-telephone');
    expect(phoneEl).to.exist;
    expect(phoneEl.getAttribute('contact')).to.equal('541-123-4567');

    // Should NOT display the online request options
    expect(screen.queryByText(/Option 2: Call the facility/i)).to.not.exist;
    expect(
      screen.queryByText(
        /Option 1: Request your preferred date and time online/i,
      ),
    ).to.not.exist;
    expect(screen.queryByTestId('request-appointment-link')).to.not.exist;
  });

  // currently using both facility configurations and eligibility endpoints as source of truth for request eligibility
  // TODO: once we switch to using only eligibility endpoint, we can remove this test

  /* Commenting out for now to unblock OH request test in staging
  it('should only display Call and ask to schedule with provider option when patient is not eligible for requests', () => {
    const store = createTestStore(defaultState);
    const eligibility = {
      request: false,
      requestReasons: ['overRequestLimit'],
    };
    const selectedFacility = {
      id: '692',
      name: 'White City VA Medical Center',
    };

    const screen = renderWithStoreAndRouter(
      <ScheduleWithDifferentProvider
        isEligibleForRequest
        selectedFacility={selectedFacility}
      />,
      { store },
    );

    expect(screen.getByText(/Call and ask to schedule with that provider/i)).to
      .exist;
    expect(screen.queryByText(/Option 2: Call the facility/i)).to.not.exist;
    expect(
      screen.queryByText(
        /Option 1: Request your preferred date and time online/i,
      ),
    ).to.not.exist;
    expect(screen.queryByText(/Request an appointment/i)).to.not.exist;
  });
  */

  it('should render correct facility phone number', () => {
    const store = createTestStore(defaultState);
    const selectedFacility = {
      id: '692',
      name: 'White City VA Medical Center',
      telecom: [
        {
          system: 'phone',
          value: '541-123-4567',
        },
      ],
    };

    const screen = renderWithStoreAndRouter(
      <ScheduleWithDifferentProvider
        isEligibleForRequest
        overRequestLimit={false}
        selectedFacility={selectedFacility}
      />,
      { store },
    );

    const phoneEl = screen.getByTestId('facility-telephone');
    expect(phoneEl).to.exist;
    expect(phoneEl.getAttribute('contact')).to.equal('541-123-4567');

    const ttyEl = screen.getByTestId('tty-telephone');
    expect(ttyEl.getAttribute('contact')).to.equal('711');
  });
  it('should route to request appointment URL when link clicked', async () => {
    const store = createTestStore(defaultState);
    const selectedFacility = {
      id: '692',
      name: 'White City VA Medical Center',
    };

    // Spy on dispatch to ensure our routing action is dispatched
    const dispatchSpy = sinon.spy(store, 'dispatch');

    const screen = renderWithStoreAndRouter(
      <ScheduleWithDifferentProvider
        isEligibleForRequest
        selectedFacility={selectedFacility}
      />,
      { store },
    );

    const link = screen.getByTestId('request-appointment-link');
    expect(link).to.exist;

    await userEvent.click(link);

    // Assert dispatch was called (routing action dispatched)
    expect(dispatchSpy.called).to.be.true;

    // If renderWithStoreAndRouter returns history, assert path
    if (screen.history) {
      expect(screen.history.location.pathname).to.equal('/va-request/');
    }

    dispatchSpy.restore();
  });

  it('should display both options with "How to schedule" title when requestEligibilityError is true and hasProviders is false', () => {
    const store = createTestStore(defaultState);
    const selectedFacility = {
      id: '692',
      name: 'White City VA Medical Center',
      telecom: [
        {
          system: 'phone',
          value: '541-987-6543',
        },
      ],
    };

    const screen = renderWithStoreAndRouter(
      <ScheduleWithDifferentProvider
        isEligibleForRequest
        overRequestLimit={false}
        selectedFacility={selectedFacility}
        hasProviders={false}
        requestEligibilityError
      />,
      { store },
    );

    // requestEligibilityError && !hasProviders does not trigger call-only path
    // Falls through to default: both options with "How to schedule" title
    expect(screen.getByText('How to schedule')).to.exist;
    expect(
      screen.queryByText(/If you want to schedule with a different provider/i),
    ).to.not.exist;

    // Should not display the call-only text
    expect(
      screen.queryByText(
        /Call the facility and ask to schedule with that provider:/i,
      ),
    ).to.not.exist;

    // Should display both options
    expect(
      screen.getByText(
        /Option 1: Request your preferred date and time online/i,
      ),
    ).to.exist;
    expect(screen.getByText(/Option 2: Call the facility/i)).to.exist;
    expect(screen.getByTestId('request-appointment-link')).to.exist;
  });
});
