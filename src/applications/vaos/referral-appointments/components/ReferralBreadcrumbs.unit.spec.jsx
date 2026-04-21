import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';

import {
  renderWithStoreAndRouter,
  createTestStore,
} from '../../tests/mocks/setup';

import ReferralBreadcrumbs from './ReferralBreadcrumbs';

import * as flow from '../flow';

const initialState = {
  referral: {
    currentPage: 'appointments',
  },
};

describe('VAOS Component: ReferralBreadcrumbs', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render Breadcrumbs component when breadcrumb does not start with "Back"', () => {
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(<ReferralBreadcrumbs />, {
      store,
    });
    screen.history.push('/');
    const navigation = screen.getByTestId('vaos-breadcrumbs');
    expect(navigation).to.exist;
    const crumb =
      navigation.breadcrumbList[navigation.breadcrumbList.length - 1].label;
    expect(crumb).to.equal('Appointments');
  });

  it('should render back link correctly when breadcrumb starts with "Back"', () => {
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(<ReferralBreadcrumbs />, {
      store,
      path: '/schedule-referral/complete/APPT?id=UUID',
    });

    const navigation = screen.getByRole('navigation', { name: 'backlink' });
    expect(navigation).to.exist;
    const backLink = screen.getByTestId('back-link');
    expect(backLink).to.exist;
    expect(backLink).to.have.attribute('href', '/my-health/appointments');
    expect(backLink).to.have.attribute('text', 'Back to appointments');
  });

  it('should call routeToPreviousReferralPage when back link is clicked', () => {
    const routeToPreviousReferralPage = sandbox.spy(
      flow,
      'routeToPreviousReferralPage',
    );
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(<ReferralBreadcrumbs />, {
      store,
      path: '/schedule-referral/complete/APPT?id=UUID',
    });

    const backLink = screen.getByTestId('back-link');
    backLink.click();
    expect(routeToPreviousReferralPage.called).to.be.true;
  });

  it('should replace history to the previous flow URL when back link is clicked on providerSelection', () => {
    initialState.referral.currentPage = 'providerSelection';
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(<ReferralBreadcrumbs />, {
      store,
      path: '/schedule-referral/provider-selection?id=UUID',
    });

    screen.history.replace.resetHistory();
    screen.getByTestId('back-link').click();

    const replaceCalls = screen.history.replace.args.map(args => args[0]);
    const matched = replaceCalls.some(
      url =>
        typeof url === 'string' &&
        url.includes('/schedule-referral') &&
        url.includes('id=UUID'),
    );
    expect(matched).to.be.true;
  });

  it('should replace history with / when back link is clicked on complete', () => {
    initialState.referral.currentPage = 'complete';
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(<ReferralBreadcrumbs />, {
      store,
      path: '/schedule-referral/complete/APPT?id=UUID',
    });

    screen.history.replace.resetHistory();
    screen.getByTestId('back-link').click();

    const replaceCalls = screen.history.replace.args.map(args => args[0]);
    expect(replaceCalls).to.include('/');
  });

  it('should render back link to referrals and requests on scheduleReferral', () => {
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(<ReferralBreadcrumbs />, {
      store,
      path: '/schedule-referral?id=UUID',
    });

    const backLink = screen.getByTestId('back-link');
    expect(backLink).to.exist;
    expect(backLink).to.have.attribute(
      'text',
      'Back to referrals and requests',
    );
    expect(backLink).to.have.attribute('href', '/referrals-requests');
  });

  it('should replace history with /referrals-requests when back link is clicked on scheduleReferral', () => {
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(<ReferralBreadcrumbs />, {
      store,
      path: '/schedule-referral?id=UUID',
    });

    screen.history.replace.resetHistory();
    screen.getByTestId('back-link').click();

    const replaceCalls = screen.history.replace.args.map(args => args[0]);
    expect(replaceCalls).to.include('/referrals-requests');
  });

  it('should render back-to-list and skip the details page when providerSelection has referrer=referrals-requests', () => {
    initialState.referral.currentPage = 'providerSelection';
    const routeToPreviousReferralPage = sandbox.spy(
      flow,
      'routeToPreviousReferralPage',
    );
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(<ReferralBreadcrumbs />, {
      store,
      path:
        '/schedule-referral/provider-selection?id=UUID&referrer=referrals-requests',
    });

    const backLink = screen.getByTestId('back-link');
    expect(backLink).to.have.attribute('text', 'Back');
    expect(backLink).to.have.attribute('href', '/referrals-requests');

    screen.history.replace.resetHistory();
    backLink.click();

    const replaceCalls = screen.history.replace.args.map(args => args[0]);
    expect(replaceCalls).to.include('/referrals-requests');
    expect(routeToPreviousReferralPage.called).to.be.false;
  });

  it('should keep default back behavior on providerSelection when referrer has a different value', () => {
    initialState.referral.currentPage = 'providerSelection';
    const store = createTestStore(initialState);
    const screen = renderWithStoreAndRouter(<ReferralBreadcrumbs />, {
      store,
      path: '/schedule-referral/provider-selection?id=UUID&referrer=other',
    });

    screen.history.replace.resetHistory();
    screen.getByTestId('back-link').click();

    const replaceCalls = screen.history.replace.args.map(args => args[0]);
    const matched = replaceCalls.some(
      url =>
        typeof url === 'string' &&
        url.includes('/schedule-referral') &&
        url.includes('id=UUID'),
    );
    expect(matched).to.be.true;
    expect(replaceCalls).to.not.include('/referrals-requests');
  });
});
