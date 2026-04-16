import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import MockDate from 'mockdate';
import PendingReferralCard from './PendingReferralCard';
import { createReferralById } from '../utils/referrals';

describe('VAOS Component: PendingReferralCard', () => {
  beforeEach(() => {
    MockDate.set('2025-01-01');
  });
  afterEach(() => {
    MockDate.reset();
  });

  const referral = createReferralById(
    '2025-01-01',
    'add2f0f4-a1ea-4dea-a504-a54ab57c68',
  ).attributes;

  let screen = null;

  it('should render ListItem component', () => {
    screen = render(<PendingReferralCard referral={referral} index={0} />);
    expect(screen.getByTestId('appointment-list-item')).to.exist;
  });

  it('should display the correct type of care name', () => {
    screen = render(<PendingReferralCard referral={referral} index={0} />);
    const link = screen.container.querySelector(
      'va-link[text="Primary Care referral"]',
    );
    expect(link).to.exist;
  });
  it('should display the expiration date', () => {
    screen = render(<PendingReferralCard referral={referral} index={0} />);
    expect(screen.getByText(/July 1, 2025/)).to.exist;
  });

  it('should display schedule link when onlineSchedule is true and hasAppointments is false', () => {
    screen = render(<PendingReferralCard referral={referral} index={0} />);
    expect(screen.getByTestId('schedule-appointment-link')).to.exist;
    expect(screen.queryByTestId('cannot-schedule-online-message')).to.not.exist;
    expect(screen.queryByTestId('has-appointments-message')).to.not.exist;
  });

  it('should display cannot-schedule-online message when onlineSchedule is false and hasAppointments is false', () => {
    const offlineReferral = {
      ...referral,
      onlineSchedule: false,
    };
    screen = render(
      <PendingReferralCard referral={offlineReferral} index={0} />,
    );
    expect(screen.queryByTestId('schedule-appointment-link')).to.not.exist;
    expect(screen.getByTestId('cannot-schedule-online-message')).to.exist;
    expect(screen.queryByTestId('has-appointments-message')).to.not.exist;
  });

  it('should default to schedule link when onlineSchedule is undefined', () => {
    const undefinedReferral = {
      ...referral,
      onlineSchedule: undefined,
    };
    screen = render(
      <PendingReferralCard referral={undefinedReferral} index={0} />,
    );
    expect(screen.getByTestId('schedule-appointment-link')).to.exist;
    expect(screen.queryByTestId('cannot-schedule-online-message')).to.not.exist;
  });

  it('should default to schedule link when onlineSchedule is null', () => {
    const nullReferral = {
      ...referral,
      onlineSchedule: null,
    };
    screen = render(<PendingReferralCard referral={nullReferral} index={0} />);
    expect(screen.getByTestId('schedule-appointment-link')).to.exist;
    expect(screen.queryByTestId('cannot-schedule-online-message')).to.not.exist;
  });

  it('should display has-appointments message when hasAppointments is true', () => {
    const scheduledReferral = {
      ...referral,
      hasAppointments: true,
    };
    screen = render(
      <PendingReferralCard referral={scheduledReferral} index={0} />,
    );
    expect(screen.getByTestId('has-appointments-message')).to.exist;
    expect(
      screen.getByText(
        /You’ve already scheduled 1 or more appointments for this referral/,
      ),
    ).to.exist;
    expect(screen.queryByTestId('schedule-appointment-link')).to.not.exist;
    expect(screen.queryByTestId('cannot-schedule-online-message')).to.not.exist;
  });

  it('should set correct detail href on referral title link', () => {
    screen = render(<PendingReferralCard referral={referral} index={0} />);
    const link = screen.container.querySelector('va-link');
    expect(link.getAttribute('href')).to.equal(
      'schedule-referral?id=add2f0f4-a1ea-4dea-a504-a54ab57c68&referrer=referrals-requests',
    );
  });

  it('should set href on va-link when onlineSchedule is false', () => {
    const offlineReferral = {
      ...referral,
      onlineSchedule: false,
    };
    screen = render(
      <PendingReferralCard referral={offlineReferral} index={0} />,
    );
    const link = screen.container.querySelector('va-link');
    expect(link.getAttribute('href')).to.equal(
      'schedule-referral?id=add2f0f4-a1ea-4dea-a504-a54ab57c68&referrer=referrals-requests',
    );
  });

  it('should apply borderTop class only when index is 0', () => {
    screen = render(<PendingReferralCard referral={referral} index={0} />);
    const listItem = screen.getByTestId('appointment-list-item');
    expect(listItem.className).to.contain('vads-u-border-top--1px');

    screen.unmount();

    screen = render(<PendingReferralCard referral={referral} index={1} />);
    const secondItem = screen.getByTestId('appointment-list-item');
    expect(secondItem.className).to.not.contain('vads-u-border-top--1px');
  });

  it('should set correct provider selection href on schedule action link', () => {
    screen = render(<PendingReferralCard referral={referral} index={0} />);
    const actionLink = screen.getByTestId('schedule-appointment-link');
    expect(actionLink.getAttribute('href')).to.equal(
      'schedule-referral/provider-selection?id=add2f0f4-a1ea-4dea-a504-a54ab57c68&referrer=referrals-requests',
    );
  });

  it('should set correct aria-labelledby on schedule link', () => {
    screen = render(<PendingReferralCard referral={referral} index={0} />);
    const actionLink = screen.getByTestId('schedule-appointment-link');
    expect(actionLink.getAttribute('aria-labelledby')).to.equal(
      'ref-title-0 ref-desc-0',
    );
    const descSpan = screen.container.querySelector('#ref-desc-0');
    expect(descSpan).to.exist;
  });
});
