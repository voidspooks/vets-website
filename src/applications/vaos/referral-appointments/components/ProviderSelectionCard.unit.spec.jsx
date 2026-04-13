import React from 'react';
import { expect } from 'chai';
import ProviderSelectionCard from './ProviderSelectionCard';
import { mockProviderDetails } from '../utils/mocks';
import { renderWithStoreAndRouter } from '../../tests/mocks/setup';

describe('VAOS Component: ProviderSelectionCard', () => {
  const initialState = {
    featureToggles: {
      vaOnlineSchedulingCCDirectScheduling: true,
    },
  };

  const defaultProps = {
    provider: mockProviderDetails,
    index: 0,
    referralId: 'ref-1',
  };

  it('should return null when provider is falsy', () => {
    const screen = renderWithStoreAndRouter(
      <ProviderSelectionCard provider={null} index={0} referralId="ref-1" />,
      { initialState },
    );
    expect(screen.container.innerHTML).to.equal('');
  });

  it('should render ListItem component', () => {
    const screen = renderWithStoreAndRouter(
      <ProviderSelectionCard {...defaultProps} />,
      { initialState },
    );
    expect(screen.getByTestId('appointment-list-item')).to.exist;
  });

  it('should apply borderTop class when index is 0', () => {
    const screen = renderWithStoreAndRouter(
      <ProviderSelectionCard {...defaultProps} />,
      { initialState },
    );
    const listItem = screen.getByTestId('appointment-list-item');
    expect(listItem.className).to.contain('vads-u-border-top--1px');
  });

  it('should not apply borderTop class when index is not 0', () => {
    const screen = renderWithStoreAndRouter(
      <ProviderSelectionCard {...defaultProps} index={1} />,
      { initialState },
    );
    const listItem = screen.getByTestId('appointment-list-item');
    expect(listItem.className).to.not.contain('vads-u-border-top--1px');
  });

  it('should render provider name', () => {
    const screen = renderWithStoreAndRouter(
      <ProviderSelectionCard {...defaultProps} />,
      { initialState },
    );
    expect(screen.getByTestId('provider-name')).to.exist;
    expect(screen.getByTestId('provider-name').textContent).to.equal(
      'Dr. Kristina Jones',
    );
  });

  it('should render care type as title case', () => {
    const screen = renderWithStoreAndRouter(
      <ProviderSelectionCard {...defaultProps} />,
      { initialState },
    );
    expect(screen.getByTestId('provider-care-type')).to.exist;
    expect(screen.getByTestId('provider-care-type').textContent).to.equal(
      'Community care',
    );
  });

  it('should render VA care type correctly', () => {
    const screen = renderWithStoreAndRouter(
      <ProviderSelectionCard
        {...defaultProps}
        provider={{ ...mockProviderDetails, careType: 'VA' }}
      />,
      { initialState },
    );
    expect(screen.getByTestId('provider-care-type').textContent).to.equal(
      'VA care',
    );
  });

  it('should render facility name', () => {
    const screen = renderWithStoreAndRouter(
      <ProviderSelectionCard {...defaultProps} />,
      { initialState },
    );
    expect(screen.getByTestId('facility-name')).to.exist;
    expect(screen.getByTestId('facility-name').textContent).to.equal(
      'Facility Name',
    );
  });

  it('should render drive time with distance', () => {
    const screen = renderWithStoreAndRouter(
      <ProviderSelectionCard {...defaultProps} />,
      { initialState },
    );
    expect(screen.getByTestId('drive-time')).to.exist;
    expect(screen.getByTestId('drive-time').textContent).to.equal(
      '7 min (2 miles)',
    );
  });

  it('should render next available label and formatted date', () => {
    const screen = renderWithStoreAndRouter(
      <ProviderSelectionCard {...defaultProps} />,
      { initialState },
    );
    expect(screen.getByTestId('next-available-label')).to.exist;
    expect(screen.getByTestId('next-available-label').textContent).to.equal(
      'Next available:',
    );
    expect(screen.getByTestId('next-available-date')).to.exist;
    expect(screen.getByTestId('next-available-date').textContent).to.equal(
      'Thursday, March 26, 2026',
    );
  });

  it('should render va-link with correct href using referralId and provider id', () => {
    const screen = renderWithStoreAndRouter(
      <ProviderSelectionCard {...defaultProps} />,
      { initialState },
    );
    const link = screen.container.querySelector('va-link');
    expect(link).to.exist;
    expect(link.getAttribute('href')).to.equal(
      'date-time?id=ref-1&providerId=9mN718pH',
    );
  });

  it('should render va-link with correct text', () => {
    const screen = renderWithStoreAndRouter(
      <ProviderSelectionCard {...defaultProps} />,
      { initialState },
    );
    const link = screen.container.querySelector('va-link');
    expect(link).to.exist;
    expect(link.getAttribute('text')).to.equal('Review available appointments');
  });
});
