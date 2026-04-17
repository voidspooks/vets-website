import React from 'react';
import { expect } from 'chai';
import { format } from 'date-fns';
import { waitFor } from '@testing-library/dom';
import ScheduleReferral from './ScheduleReferral';
import {
  createTestStore,
  renderWithStoreAndRouter,
} from '../../tests/mocks/setup';
import {
  createReferralById,
  getReferralSlotKey,
  getReferralProviderKey,
} from '../utils/referrals';

describe('VAOS Component: ScheduleReferral', () => {
  afterEach(() => {
    sessionStorage.clear();
  });
  const referralDate = '2024-09-09';

  it('should render with default data', async () => {
    const referral = createReferralById(referralDate, '111');

    const store = createTestStore();

    const screen = renderWithStoreAndRouter(
      <ScheduleReferral currentReferral={referral} />,
      {
        store,
      },
    );

    const details = await screen.findByTestId('referral-details');
    const link = await screen.findByTestId('referral-community-care-office');

    const expectedDate = format(
      new Date(referral.attributes.expirationDate),
      'MMMM d, yyyy',
    );

    expect(details).to.exist;
    expect(details).to.contain.text(expectedDate);

    expect(link).to.exist;

    const commonQuestionsHeading = screen.getByRole('heading', {
      name: 'Common questions about referrals',
    });
    expect(commonQuestionsHeading).to.exist;

    const accordion = screen.container.querySelector('va-accordion');
    expect(accordion).to.exist;
    const accordionItems = screen.container.querySelectorAll(
      'va-accordion-item',
    );
    expect(accordionItems.length).to.equal(2);
  });
  it('should reset slot selection', async () => {
    const referral = createReferralById(referralDate, '222');
    const selectedSlotKey = getReferralSlotKey(referral.attributes.uuid);
    const selectedProviderKey = getReferralProviderKey(
      referral.attributes.uuid,
    );
    sessionStorage.setItem(selectedSlotKey, '0');
    sessionStorage.setItem(selectedProviderKey, 'prov-1');
    const initialState = {
      featureToggles: {
        vaOnlineSchedulingCCDirectScheduling: true,
      },
      referral: {
        currentPage: 'scheduleAppointment',
        selectedSlot: '0',
      },
    };
    renderWithStoreAndRouter(<ScheduleReferral currentReferral={referral} />, {
      initialState,
    });
    await waitFor(() => {
      expect(sessionStorage.getItem(selectedSlotKey)).to.be.null;
      expect(sessionStorage.getItem(selectedProviderKey)).to.be.null;
    });
  });
  it('should display warning alert when station id is not valid', async () => {
    const referral = createReferralById(referralDate, '444');
    referral.attributes.stationId = '12345';

    const store = createTestStore();

    const screen = renderWithStoreAndRouter(
      <ScheduleReferral currentReferral={referral} />,
      { store },
    );

    const alert = await screen.findByTestId('referral-alert');
    expect(alert).to.exist;
    expect(alert).to.contain.text(
      'Online scheduling isn’t available for this referral right now. Call your community care provider or your facility’s community care office to schedule an appointment.',
    );
    expect(
      screen.queryAllByTestId('referral-community-care-office'),
    ).to.have.length(2);

    // Verify that the schedule appointment button is not rendered
    const scheduleButton = screen.queryByTestId('schedule-appointment-button');
    expect(scheduleButton).to.be.null;
  });
  it('should display warning alert when onlineSchedule is false', async () => {
    const referral = createReferralById(referralDate, '666');
    referral.attributes.onlineSchedule = false;

    const store = createTestStore();

    const screen = renderWithStoreAndRouter(
      <ScheduleReferral currentReferral={referral} />,
      { store },
    );

    const alert = await screen.findByTestId('referral-alert');
    expect(alert).to.exist;
    expect(alert).to.contain.text(
      'Online scheduling isn\u2019t available for this referral right now.',
    );

    const scheduleButton = screen.queryByTestId('schedule-appointment-button');
    expect(scheduleButton).to.be.null;
  });
  it('should display warning alert when onlineSchedule is false', async () => {
    const referral = createReferralById(referralDate, '666');
    referral.attributes.onlineSchedule = false;

    const store = createTestStore();

    const screen = renderWithStoreAndRouter(
      <ScheduleReferral currentReferral={referral} />,
      { store },
    );

    const alert = await screen.findByTestId('referral-alert');
    expect(alert).to.exist;
    expect(alert).to.contain.text(
      'Online scheduling isn\u2019t available for this referral right now.',
    );

    const scheduleButton = screen.queryByTestId('schedule-appointment-button');
    expect(scheduleButton).to.be.null;
  });
  it('should default to schedulable when onlineSchedule is undefined', async () => {
    const referral = createReferralById(referralDate, '1001');
    referral.attributes.onlineSchedule = undefined;

    const store = createTestStore();

    const screen = renderWithStoreAndRouter(
      <ScheduleReferral currentReferral={referral} />,
      { store },
    );

    const scheduleButton = await screen.findByTestId(
      'schedule-appointment-button',
    );
    expect(scheduleButton).to.exist;

    const alert = screen.queryByTestId('referral-alert');
    expect(alert).to.be.null;
  });
  it('should default to schedulable when onlineSchedule is null', async () => {
    const referral = createReferralById(referralDate, '1002');
    referral.attributes.onlineSchedule = null;

    const store = createTestStore();

    const screen = renderWithStoreAndRouter(
      <ScheduleReferral currentReferral={referral} />,
      { store },
    );

    const scheduleButton = await screen.findByTestId(
      'schedule-appointment-button',
    );
    expect(scheduleButton).to.exist;

    const alert = screen.queryByTestId('referral-alert');
    expect(alert).to.be.null;
  });
  it('should allow user to schedule from pilot expansion station', async () => {
    const referral = createReferralById(referralDate, '99999');
    referral.attributes.stationId = '508GE';
    const store = createTestStore();
    const screen = renderWithStoreAndRouter(
      <ScheduleReferral currentReferral={referral} />,
      { store },
    );
    const scheduleButton = await screen.findByTestId(
      'schedule-appointment-button',
    );
    expect(scheduleButton).to.exist;
  });
  it('should display address alert and hide schedule link when veteranAddressPresent is false', async () => {
    const referral = createReferralById(referralDate, '777');
    referral.meta.veteranAddressPresent = false;

    const store = createTestStore();

    const screen = renderWithStoreAndRouter(
      <ScheduleReferral currentReferral={referral} />,
      { store },
    );

    const addressAlert = await screen.findByTestId('address-alert');
    expect(addressAlert).to.exist;
    expect(addressAlert).to.contain.text(
      'Add a home address to schedule an appointment',
    );
    expect(addressAlert).to.contain.text(
      'To schedule an appointment, you need a home address on file.',
    );

    const profileLink = screen.getByTestId('va-profile-link');
    expect(profileLink).to.exist;
    expect(profileLink).to.have.attribute('href', '/profile');
    expect(profileLink).to.have.attribute('target', '_blank');

    const scheduleButton = screen.queryByTestId('schedule-appointment-button');
    expect(scheduleButton).to.be.null;

    const genericAlert = screen.queryByTestId('referral-alert');
    expect(genericAlert).to.be.null;
  });
  it('should show only address alert when veteranAddressPresent is false and other blockers exist', async () => {
    const referral = createReferralById(referralDate, '888');
    referral.meta.veteranAddressPresent = false;
    referral.attributes.onlineSchedule = false;

    const store = createTestStore();

    const screen = renderWithStoreAndRouter(
      <ScheduleReferral currentReferral={referral} />,
      { store },
    );

    const addressAlert = await screen.findByTestId('address-alert');
    expect(addressAlert).to.exist;

    const genericAlert = screen.queryByTestId('referral-alert');
    expect(genericAlert).to.be.null;

    const scheduleButton = screen.queryByTestId('schedule-appointment-button');
    expect(scheduleButton).to.be.null;
  });
  it('should display scheduled appointments content, appointments list link, and community care info when hasAppointments is true', async () => {
    const referral = createReferralById(referralDate, 'has-appts');
    referral.attributes.hasAppointments = true;

    const store = createTestStore();

    const screen = renderWithStoreAndRouter(
      <ScheduleReferral currentReferral={referral} />,
      { store },
    );

    const hasAppointmentsContent = await screen.findByTestId(
      'has-appointments-content',
    );
    expect(hasAppointmentsContent).to.exist;
    expect(hasAppointmentsContent).to.contain.text(
      'You\u2019ve scheduled 1 or more appointments for this referral.',
    );
    expect(hasAppointmentsContent).to.contain.text(
      'If you have other appointments to schedule for this referral, contact your community care office.',
    );

    const appointmentsListLink = screen.getByTestId('appointments-list-link');
    expect(appointmentsListLink).to.exist;
    expect(appointmentsListLink).to.have.attribute(
      'href',
      '/my-health/appointments',
    );

    expect(screen.queryByTestId('referral-alert')).to.be.null;
    expect(screen.queryByTestId('subtitle')).to.be.null;
    expect(screen.queryByTestId('schedule-appointment-button')).to.be.null;
  });
  it('should display the schedule appointment button instead of scheduled appointments content when hasAppointments is false', async () => {
    const referral = createReferralById(referralDate, 'no-appts');

    const store = createTestStore();

    const screen = renderWithStoreAndRouter(
      <ScheduleReferral currentReferral={referral} />,
      { store },
    );

    await screen.findByTestId('schedule-appointment-button');
    expect(screen.queryByTestId('has-appointments-content')).to.be.null;
    expect(screen.queryByTestId('appointments-list-link')).to.be.null;
  });
  it('should display the address alert instead of scheduled appointments content when hasAppointments is true but veteranAddressPresent is false', async () => {
    const referral = createReferralById(referralDate, 'addr-and-appts');
    referral.attributes.hasAppointments = true;
    referral.meta.veteranAddressPresent = false;

    const store = createTestStore();

    const screen = renderWithStoreAndRouter(
      <ScheduleReferral currentReferral={referral} />,
      { store },
    );

    const addressAlert = await screen.findByTestId('address-alert');
    expect(addressAlert).to.exist;
    expect(screen.queryByTestId('has-appointments-content')).to.be.null;
  });
  it('should not display address alert when veteranAddressPresent is true', async () => {
    const referral = createReferralById(referralDate, '999');

    const store = createTestStore();

    const screen = renderWithStoreAndRouter(
      <ScheduleReferral currentReferral={referral} />,
      { store },
    );

    const scheduleButton = await screen.findByTestId(
      'schedule-appointment-button',
    );
    expect(scheduleButton).to.exist;

    const addressAlert = screen.queryByTestId('address-alert');
    expect(addressAlert).to.be.null;
  });
});
