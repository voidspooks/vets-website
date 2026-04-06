import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { addDays, subDays, formatISO } from 'date-fns';

import { buildDateFormatter } from '../../utils/helpers';

import IntentToFileCard from '../../components/IntentToFileCard';

const today = new Date();

const buildItf = (overrides = {}) => ({
  id: '100',
  type: 'compensation',
  creationDate: '2025-06-01T12:00:00.000+00:00',
  expirationDate: formatISO(addDays(today, 200)),
  status: 'active',
  ...overrides,
});

describe('<IntentToFileCard>', () => {
  it('renders the correct type label for compensation', () => {
    const screen = render(<IntentToFileCard itf={buildItf()} />);
    screen.getByText('Disability compensation');
  });

  it('renders the correct type label for pension', () => {
    const screen = render(
      <IntentToFileCard itf={buildItf({ type: 'pension' })} />,
    );
    screen.getByText('Veteran’s Pension');
  });

  it('renders the correct type label for survivor (DIC)', () => {
    const screen = render(
      <IntentToFileCard itf={buildItf({ type: 'survivor' })} />,
    );
    screen.getByText('Dependency and Indemnity Compensation (DIC)');
  });

  it('renders the recorded date', () => {
    const screen = render(<IntentToFileCard itf={buildItf()} />);
    screen.getByText(/Intent to file recorded on June 1, 2025/);
  });

  it('does not show the Expiring badge when expiration is more than 60 days away', () => {
    const itf = buildItf({ expirationDate: formatISO(addDays(today, 90)) });
    const screen = render(<IntentToFileCard itf={itf} />);
    expect(screen.container.querySelector('va-tag-status')).to.not.exist;
  });

  it('shows the Expiring badge with date when expiration is within 60 days', () => {
    const expirationDate = addDays(today, 30);
    const itf = buildItf({ expirationDate: formatISO(expirationDate) });
    const screen = render(<IntentToFileCard itf={itf} />);
    const tag = screen.container.querySelector('va-tag-status');
    expect(tag).to.exist;
    const formatShortDate = buildDateFormatter('MM/dd/yyyy');
    expect(tag).to.have.attr(
      'text',
      `Expires on ${formatShortDate(formatISO(expirationDate))}`,
    );
    expect(tag).to.have.attr('status', 'warning');
  });

  it('renders non-expiring body text', () => {
    const itf = buildItf({ expirationDate: formatISO(addDays(today, 200)) });
    const screen = render(<IntentToFileCard itf={itf} />);
    screen.getByText(
      /We’ll apply this intent to file to a disability compensation claim you submit before/,
    );
  });

  it('renders expiring body text', () => {
    const itf = buildItf({ expirationDate: formatISO(addDays(today, 10)) });
    const screen = render(<IntentToFileCard itf={itf} />);
    screen.getByText(
      /This intent to file will expire on .+\. If you haven’t submitted a disability compensation claim yet/,
    );
  });

  it('does not show the Expiring badge for already-expired ITFs', () => {
    const itf = buildItf({ expirationDate: formatISO(subDays(today, 5)) });
    const screen = render(<IntentToFileCard itf={itf} />);
    expect(screen.container.querySelector('va-tag-status')).to.not.exist;
  });

  it('renders the CTA link', () => {
    const screen = render(<IntentToFileCard itf={buildItf()} />);
    const link = screen.container.querySelector('va-link[active]');
    expect(link).to.exist;
    expect(link).to.have.attr('href', '/track-claims/your-claims');
    expect(link).to.have.attr('text', 'Check if you have an in-progress claim');
  });

  it('sets the correct data-testid based on type', () => {
    const screen = render(
      <IntentToFileCard itf={buildItf({ type: 'pension' })} />,
    );
    expect(screen.getByTestId('itf-card-pension')).to.exist;
  });
});
