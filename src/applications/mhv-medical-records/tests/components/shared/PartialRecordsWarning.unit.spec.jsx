import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import PartialRecordsWarning from '../../../components/shared/PartialRecordsWarning';

describe('PartialRecordsWarning', () => {
  const mockWarnings = [
    {
      severity: 'warning',
      code: 'informational',
      diagnostics: 'Partial failure',
      source: 'oracle-health',
    },
  ];

  it('renders the warning alert when warnings are present', () => {
    const { getByTestId } = render(
      <PartialRecordsWarning warnings={mockWarnings} />,
    );
    const alert = getByTestId('alert-partial-records-warning');
    expect(alert).to.exist;
    expect(alert.getAttribute('status')).to.equal('warning');
  });

  it('renders the correct headline', () => {
    const { getByText } = render(
      <PartialRecordsWarning warnings={mockWarnings} />,
    );
    expect(getByText('Some of your records may be incomplete')).to.exist;
  });

  it('renders the body text', () => {
    const { getByTestId } = render(
      <PartialRecordsWarning warnings={mockWarnings} />,
    );
    const alert = getByTestId('alert-partial-records-warning');
    expect(alert.textContent).to.include(
      'couldn’t load all of your information',
    );
    expect(alert.textContent).to.include('Please try again later');
  });

  it('does not render when warnings is an empty array', () => {
    const { queryByTestId } = render(<PartialRecordsWarning warnings={[]} />);
    expect(queryByTestId('alert-partial-records-warning')).to.not.exist;
  });

  it('does not render when warnings is undefined', () => {
    const { queryByTestId } = render(<PartialRecordsWarning />);
    expect(queryByTestId('alert-partial-records-warning')).to.not.exist;
  });

  it('does not render when warnings is null', () => {
    const { queryByTestId } = render(<PartialRecordsWarning warnings={null} />);
    expect(queryByTestId('alert-partial-records-warning')).to.not.exist;
  });

  it('has the no-print class for print exclusion', () => {
    const { getByTestId } = render(
      <PartialRecordsWarning warnings={mockWarnings} />,
    );
    const alert = getByTestId('alert-partial-records-warning');
    expect(alert.getAttribute('class')).to.include('no-print');
  });
});
