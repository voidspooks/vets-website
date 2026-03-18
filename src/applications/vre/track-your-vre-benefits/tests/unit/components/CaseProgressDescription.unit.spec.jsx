import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import sinon from 'sinon';
import { MemoryRouter } from 'react-router-dom-v5-compat';

import CaseProgressDescription from '../../../components/CaseProgressDescription';
import * as AppointmentScheduledAlertMod from '../../../components/AppointmentScheduledAlert';
import * as HubCardListMod from '../../../components/HubCardList';
import * as SelectPreferenceViewMod from '../../../components/SelectPreferenceView';

const sandbox = sinon.createSandbox();
let hubCardProps;
let appointmentAlertProps;

const makeStore = state => {
  const dispatch = sandbox.spy();
  return {
    getState: () => state || {},
    subscribe: () => () => {},
    dispatch,
  };
};

const renderWithProviders = (ui, state = {}) =>
  render(
    <Provider store={makeStore(state)}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
  );

describe('CaseProgressDescription', () => {
  beforeEach(() => {
    hubCardProps = null;
    appointmentAlertProps = null;

    sandbox.stub(HubCardListMod, 'default').callsFake(props => {
      hubCardProps = props;
      return <div data-testid="hub-card-list" />;
    });
    sandbox.stub(AppointmentScheduledAlertMod, 'default').callsFake(props => {
      appointmentAlertProps = props;
      return <div data-testid="appointment-scheduled-alert" />;
    });
    sandbox
      .stub(SelectPreferenceViewMod, 'default')
      .callsFake(() => <div data-testid="select-preference-view" />);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('renders step 1 description', () => {
    const { getByText } = renderWithProviders(
      <CaseProgressDescription step={1} />,
    );
    getByText(
      /The section below contains information on steps you can take while waiting to hear back from us/i,
    );
  });

  it('renders step 2 description', () => {
    const { getByText } = renderWithProviders(
      <CaseProgressDescription step={2} />,
    );
    getByText(
      /currently reviewing your application to confirm your VR&E Chapter 31 eligibility/i,
    );
  });

  it('renders step 3 description', () => {
    const { container, getByText } = renderWithProviders(
      <CaseProgressDescription step={3} />,
      { ch31CaseMilestones: undefined },
    );
    getByText(
      /Your next step is to complete the orientation video online or during your initial evaluation counselor meeting/i,
    );
    expect(container.querySelector('va-card')).to.exist;
  });

  it('renders the step 4 scheduling message when the appointment is still pending', () => {
    const { getByText, queryByTestId } = renderWithProviders(
      <CaseProgressDescription step={4} status="PENDING" />,
    );

    getByText(/Check your email to schedule your meeting with your counselor/i);
    expect(queryByTestId('appointment-scheduled-alert')).to.equal(null);
  });

  it('renders the step 4 scheduled message when appointment details are available', () => {
    const { getByText, getByTestId } = renderWithProviders(
      <CaseProgressDescription
        step={4}
        status="COMPLETED"
        attributes={{
          orientationAppointmentDetails: {
            appointmentDateTime: '2026-03-03T10:00:00Z',
            appointmentPlace: 'Regional office',
          },
        }}
      />,
    );

    const scheduledMessage = getByText(
      /Your Initial Evaluation Appointment has been scheduled/i,
    );
    const appointmentAlert = getByTestId('appointment-scheduled-alert');

    expect(scheduledMessage.nextElementSibling).to.equal(appointmentAlert);
    expect(appointmentAlertProps).to.deep.equal({
      appointmentDateTime: '2026-03-03T10:00:00Z',
      appointmentPlace: 'Regional office',
    });
  });

  it('renders hub cards for the later workflow steps when requested', () => {
    const cases = [
      {
        step: 5,
        text: /Entitlement Determination Review/i,
      },
      {
        step: 6,
        text: /establish your Chapter 31 Rehabilitation Plan or Career Track/i,
      },
      {
        step: 7,
        text: /Your Chapter 31 benefits have been initiated/i,
      },
    ];

    cases.forEach(({ step, text }) => {
      const { getByTestId, getByText, unmount } = renderWithProviders(
        <CaseProgressDescription step={step} showHubCards />,
      );

      getByText(text);
      getByTestId('hub-card-list');
      expect(hubCardProps).to.deep.equal({ step });

      unmount();
    });
  });

  it('returns null for unknown step', () => {
    const { container } = renderWithProviders(
      <CaseProgressDescription step={999} />,
    );
    expect(container.innerHTML.trim()).to.equal('');
  });
});
