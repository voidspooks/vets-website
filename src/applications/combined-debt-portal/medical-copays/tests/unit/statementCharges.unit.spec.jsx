import React from 'react';
import { cleanup, render, waitFor, within } from '@testing-library/react';
import { expect } from 'chai';
import StatementCharges from '../../components/StatementCharges';
import mockstatements from '../../../combined/utils/mocks/mockStatements.json';

// Build a copay with 15 valid details for pagination testing,
// using the real item shape from mockstatements[1]
const createCopayWithDetails = count => ({
  ...mockstatements[1],
  details: Array.from({ length: count }, (_, i) => ({
    pDDatePostedOutput: '12/01/2021',
    pDTransDescOutput: `COPAY RX#${i + 1} FILL DATE: 12/01/2021`,
    pDTransAmtOutput: '8.00&nbsp;&nbsp;',
    pDRefNo: `618-REF${i + 1}`,
  })),
});

describe('StatementCharges component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders heading as "Statement Charges" by default', () => {
    const { getByTestId } = render(
      <StatementCharges copay={mockstatements[2]} />,
    );
    expect(getByTestId('statement-charges-head')).to.have.text(
      'Statement Charges',
    );
  });

  it('renders heading as "Most recent statement charges" when showCurrentStatementHeader is true', () => {
    const { getByTestId } = render(
      <StatementCharges copay={mockstatements[2]} showCurrentStatementHeader />,
    );
    expect(getByTestId('statement-charges-head')).to.have.text(
      'Most recent statement charges',
    );
  });

  it('renders the table', () => {
    const { getByTestId } = render(
      <StatementCharges copay={mockstatements[2]} />,
    );
    expect(getByTestId('statement-charges-table')).to.exist;
  });

  it('renders description, reference, and amount from pD* fields', () => {
    const { container } = render(
      <StatementCharges copay={mockstatements[2]} />,
    );

    const firstRow = container.querySelectorAll('va-table-row')[1];
    expect(firstRow).to.exist;
    expect(
      within(firstRow).getByTestId('statement-charges-description'),
    ).to.have.text('PAYMENT POSTED ON 04/29/2020');
    expect(
      within(firstRow).getByTestId('statement-charges-reference'),
    ).to.have.text('618-K00K9ZK');
    expect(
      within(firstRow).getByTestId('statement-charges-transaction-amount'),
    ).to.have.text('$24.00');
  });

  it('filters out details where pDTransDescOutput is only &nbsp;', () => {
    // mockstatements[0] has details with &nbsp; only descriptions
    const { container } = render(
      <StatementCharges copay={mockstatements[0]} />,
    );

    const rows = container.querySelectorAll('va-table-row');
    // Only the header row — all details filtered out
    expect(rows.length).to.equal(2);
  });

  it('renders date range title from pSStatementDateOutput', () => {
    // mockstatements[2] pSStatementDateOutput is 11/05/2021
    // so range should be October 6, 2021 to November 5, 2021
    const { container } = render(
      <StatementCharges copay={mockstatements[2]} />,
    );
    const table = container.querySelector('va-table');
    expect(table.getAttribute('table-title')).to.equal(
      'This statement shows charges you received between October 6, 2021 and November 5, 2021.',
    );
  });

  it('shows no pagination summary text when items are 10 or fewer', () => {
    // mockstatements[2] has 11 details but only valid ones matter —
    // all 11 are valid so pagination kicks in, use a smaller slice
    const copay = createCopayWithDetails(3);
    const { container } = render(<StatementCharges copay={copay} />);
    const table = container.querySelector('va-table');
    expect(table.getAttribute('table-title-summary')).to.equal('');
  });

  it('shows pagination summary text when items exceed 10', () => {
    const copay = createCopayWithDetails(15);
    const { container } = render(<StatementCharges copay={copay} />);
    const table = container.querySelector('va-table');
    expect(table.getAttribute('table-title-summary')).to.equal(
      'Showing 1-10 of 15 charges',
    );
  });

  it('navigates to page 2 and displays remaining items', async () => {
    const copay = createCopayWithDetails(15);
    const { container } = render(<StatementCharges copay={copay} />);

    // Verify page 1 first row before navigation
    const firstRowBefore = container.querySelectorAll('va-table-row')[1];
    expect(
      within(firstRowBefore).getByTestId('statement-charges-description'),
    ).to.have.text('COPAY RX#1 FILL DATE: 12/01/2021');

    const pagination = container.querySelector('va-pagination');
    pagination.dispatchEvent(
      new CustomEvent('pageSelect', {
        detail: { page: 2 },
        bubbles: true,
      }),
    );

    await waitFor(() => {
      const rows = container.querySelectorAll('va-table-row');
      // 1 header row + 5 remaining rows on page 2
      expect(rows.length).to.equal(6);

      // Verify page 2 first row is item 11, not item 1
      const firstRowAfter = rows[1];
      expect(
        within(firstRowAfter).getByTestId('statement-charges-description'),
      ).to.have.text('COPAY RX#11 FILL DATE: 12/01/2021');
    });
  });

  it('after pagination click, va-table is the focus target', async () => {
    const copay = createCopayWithDetails(15);
    const { container } = render(<StatementCharges copay={copay} />);

    const table = container.querySelector('va-table');
    expect(table.getAttribute('table-title-summary')).to.equal(
      'Showing 1-10 of 15 charges',
    );

    const pagination = container.querySelector('va-pagination');
    pagination.dispatchEvent(
      new CustomEvent('pageSelect', {
        detail: { page: 2 },
        bubbles: true,
      }),
    );

    await waitFor(() => {
      const updatedTable = container.querySelector('va-table');
      expect(updatedTable.getAttribute('table-title-summary')).to.equal(
        'Showing 11-15 of 15 charges',
      );
    });

    const tableAfterUpdate = container.querySelector('va-table');
    expect(tableAfterUpdate).to.exist;
    expect(tableAfterUpdate.getAttribute('tabindex')).to.equal('-1');
  });
});
