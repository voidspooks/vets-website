import { expect } from 'chai';
import React from 'react';
import { render } from '@testing-library/react';
import {
  mockLighthouseMedicalCopayStatement,
  createLighthouseLineItems,
} from '../fixtures/lighthouseMedicalCopayStatement';
import StatementTable from '../../components/StatementTable';

const mockFormatCurrency = amount => {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const mockSelectedCopay = {
  attributes: {
    billNumber: 'BILL-001',
    invoiceDate: '2024-05-03',
  },
  statementStartDate: '2024-05-03',
  statementEndDate: '2024-06-03',
};

describe('StatementTable component', () => {
  it('should render statement table with date range when dates are provided', () => {
    const lineItems = createLighthouseLineItems(1);
    const { container } = render(
      <StatementTable
        charges={lineItems}
        formatCurrency={mockFormatCurrency}
        selectedCopay={mockSelectedCopay}
      />,
    );

    const table = container.querySelector('va-table');
    expect(table).to.exist;
    expect(table.getAttribute('table-title')).to.include(
      'This statement shows charges you received between May 3, 2024 and June 3, 2024',
    );
  });

  it('should render fallback text when statement dates are missing', () => {
    const lineItems = createLighthouseLineItems(1);
    const { container } = render(
      <StatementTable
        charges={lineItems}
        formatCurrency={mockFormatCurrency}
        selectedCopay={{
          ...mockSelectedCopay,
          statementStartDate: null,
          statementEndDate: null,
        }}
      />,
    );

    const table = container.querySelector('va-table');
    expect(table).to.exist;
    expect(table.getAttribute('table-title')).to.equal(
      'This statement shows your current charges.',
    );
  });

  it('should NOT render Total Credits row', () => {
    const lineItems = createLighthouseLineItems(1);
    const { container } = render(
      <StatementTable
        charges={lineItems}
        formatCurrency={mockFormatCurrency}
        selectedCopay={mockSelectedCopay}
      />,
    );

    const tableRows = container.querySelectorAll('va-table-row');
    const totalCreditsRow = Array.from(tableRows).find(row =>
      row.textContent.includes('Total Credits'),
    );
    expect(totalCreditsRow).to.not.exist;
  });

  it('displays attributes.billNumber in the reference column', () => {
    const lineItems = createLighthouseLineItems(1);
    lineItems[0].datePosted = '2024-05-15';
    lineItems[0].description = 'VHA charge';
    lineItems[0].priceComponents = [{ amount: 50.0 }];

    const { getByText } = render(
      <StatementTable
        charges={lineItems}
        formatCurrency={mockFormatCurrency}
        selectedCopay={mockLighthouseMedicalCopayStatement}
      />,
    );

    expect(getByText(mockLighthouseMedicalCopayStatement.attributes.billNumber))
      .to.exist;
  });

  it('renders charge date from ISO datePosted via formatISODateToMMDDYYYY', () => {
    const lineItems = createLighthouseLineItems(1);
    lineItems[0].datePosted = '2024-05-15';
    lineItems[0].description = 'VHA charge';
    lineItems[0].priceComponents = [{ amount: 50.0 }];

    const { getAllByTestId } = render(
      <StatementTable
        charges={lineItems}
        formatCurrency={mockFormatCurrency}
        selectedCopay={mockSelectedCopay}
      />,
    );

    const dateCells = getAllByTestId('statement-date');
    expect(dateCells[0]).to.have.text('May 15, 2024');
  });
});
