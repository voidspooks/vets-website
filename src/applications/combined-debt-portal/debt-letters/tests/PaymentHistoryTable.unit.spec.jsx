import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { I18nextProvider } from 'react-i18next';
import i18nCombinedDebtPortal from '../../i18n';
import PaymentHistoryTable from '../components/PaymentHistoryTable';

const renderComponent = (props = {}) => {
  const defaultProps = {
    sortedFiscal: [],
    sortedHistory: [],
    currentDebt: {
      originalAr: '1000.00',
      deductionCode: '30',
      benefitType: 'Comp & Pen',
    },
  };

  return render(
    <I18nextProvider i18n={i18nCombinedDebtPortal}>
      <PaymentHistoryTable {...defaultProps} {...props} />
    </I18nextProvider>,
  );
};

describe('PaymentHistoryTable Component', () => {
  it('renders table headers', () => {
    const { getByText } = renderComponent();

    expect(getByText('Date')).to.exist;
    expect(getByText('Description')).to.exist;
    expect(getByText('Amount')).to.exist;
  });

  it('renders initial debt row', () => {
    const { getByText } = renderComponent({
      sortedHistory: [{ date: '2022-12-01' }],
    });

    expect(getByText('December 1, 2022')).to.exist;
    expect(getByText('Disability compensation and pension overpayment')).to
      .exist;
    expect(getByText('$1,000.00')).to.exist;
  });

  it('renders fiscal transactions', () => {
    const { getByText } = renderComponent({
      sortedFiscal: [
        {
          transactionDate: '2023-01-15',
          transactionDescription: 'Increase to AR',
          transactionTotalAmount: 500,
        },
      ],
    });

    expect(getByText('January 15, 2023')).to.exist;
    expect(getByText('Balance increase')).to.exist;
    expect(getByText('$500.00')).to.exist;
  });

  it('handles undefined originalAr gracefully', () => {
    const { getByText } = renderComponent({
      currentDebt: {
        deductionCode: '30',
        benefitType: 'Comp & Pen',
        originalAr: undefined,
      },
    });

    expect(getByText('$0.00')).to.exist;
  });

  it('renders row when no history is provided', () => {
    const { getByText } = renderComponent({
      sortedHistory: [],
    });

    expect(getByText('Disability compensation and pension overpayment')).to
      .exist;
    expect(getByText('$1,000.00')).to.exist;
  });

  it('falls back to benefitType when deduction code is unavailable', () => {
    const { getByText, queryByText } = renderComponent({
      currentDebt: {
        originalAr: '1000',
        deductionCode: '100',
        benefitType: 'Comp & Pen',
      },
    });

    expect(getByText('Comp & Pen')).to.exist;
    expect(queryByText('Notice of Proposed Offset')).to.not.exist;
  });

  it('renders pagination when total rows exceed one page', () => {
    const sortedFiscal = Array.from({ length: 11 }, (_, index) => ({
      transactionDate: `2023-01-${String(index + 1).padStart(2, '0')}`,
      transactionDescription: 'Increase to AR',
      transactionTotalAmount: 10 + index,
    }));

    const { container } = renderComponent({ sortedFiscal });

    expect(container.querySelector('va-pagination')).to.exist;
  });
});
