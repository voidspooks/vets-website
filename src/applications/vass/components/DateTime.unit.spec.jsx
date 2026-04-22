import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';

import DateTime from './DateTime';

describe('VASS Component: DateTime', () => {
  const mockDateTime = '2025-11-17T20:00:00Z';

  it('should render all content', () => {
    const { getByTestId } = render(<DateTime dateTime={mockDateTime} />);

    expect(getByTestId('date-time-description')).to.exist;
  });

  it('should format date in correct format', () => {
    const { getByTestId } = render(<DateTime dateTime={mockDateTime} />);

    const dateTimeElement = getByTestId('date-time-description');
    const [dateLine, timeLine] = dateTimeElement.innerHTML.split(/<br\s*\/?>/);

    // Check for weekday, month, day, year format (e.g., "Monday, November 17, 2025")
    expect(dateLine).to.match(/^\w+,\s\w+\s\d{1,2},\s\d{4}$/);
    // Check for time format with no leading zero, lowercase a.m./p.m., and
    // short timezone abbreviation (e.g., "3:15 p.m. ET")
    expect(timeLine).to.match(/^(?:1[0-2]|[1-9]):\d{2}\s(?:a|p)\.m\.\s\S+$/);
  });
});
