import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { $ } from 'platform/forms-system/src/js/utilities/ui';

import EstimatedReimbursementCard from '../../components/EstimatedReimbursementCard';

const defaultExpenses = [
  { id: 'expense1', expenseType: 'Mileage', costRequested: 50.25 },
  { id: 'expense2', expenseType: 'Parking', costRequested: 15.0 },
  { id: 'expense3', expenseType: 'Toll', costRequested: 5.5 },
];

describe('EstimatedReimbursementCard', () => {
  it('renders the card with the correct test id', () => {
    const { getByTestId } = render(
      <EstimatedReimbursementCard
        expenses={defaultExpenses}
        totalCostRequested={70.75}
      />,
    );

    expect(getByTestId('estimated-reimbursement-card')).to.exist;
  });

  it('renders the "Estimated reimbursement" heading', () => {
    const { getByRole } = render(
      <EstimatedReimbursementCard
        expenses={defaultExpenses}
        totalCostRequested={70.75}
      />,
    );

    expect(getByRole('heading', { name: 'Estimated reimbursement' })).to.exist;
  });

  it('renders a list item for each expense type with a positive total', () => {
    const { getByTestId } = render(
      <EstimatedReimbursementCard
        expenses={defaultExpenses}
        totalCostRequested={70.75}
      />,
    );

    const card = getByTestId('estimated-reimbursement-card');
    const items = card.querySelectorAll('ul li');
    expect(items).to.have.lengthOf(3);
    expect(card.textContent).to.include('Mileage');
    expect(card.textContent).to.include('$50.25');
    expect(card.textContent).to.include('Parking');
    expect(card.textContent).to.include('$15.00');
    expect(card.textContent).to.include('Tolls');
    expect(card.textContent).to.include('$5.50');
  });

  it('filters out expense types with a zero total', () => {
    const expensesWithZero = [
      { id: 'expense1', expenseType: 'Mileage', costRequested: 50.0 },
      { id: 'expense2', expenseType: 'Parking', costRequested: 0 },
    ];

    const { getByTestId } = render(
      <EstimatedReimbursementCard
        expenses={expensesWithZero}
        totalCostRequested={50.0}
      />,
    );

    const card = getByTestId('estimated-reimbursement-card');
    const items = card.querySelectorAll('ul li');
    expect(items).to.have.lengthOf(1);
    expect(card.textContent).to.include('Mileage');
    expect(card.textContent).to.not.include('Parking');
  });

  it('renders the total cost requested', () => {
    const { getByTestId } = render(
      <EstimatedReimbursementCard
        expenses={defaultExpenses}
        totalCostRequested={70.75}
      />,
    );

    const card = getByTestId('estimated-reimbursement-card');
    expect(card.textContent).to.include('Total: $70.75');
  });

  it('renders $0.00 total when totalCostRequested is not provided', () => {
    const { getByTestId } = render(
      <EstimatedReimbursementCard expenses={defaultExpenses} />,
    );

    const card = getByTestId('estimated-reimbursement-card');
    expect(card.textContent).to.include('Total: $0.00');
  });

  it('renders $0.00 total and no list items when expenses are empty', () => {
    const { getByTestId } = render(
      <EstimatedReimbursementCard expenses={[]} totalCostRequested={0} />,
    );

    const card = getByTestId('estimated-reimbursement-card');
    expect(card.querySelectorAll('ul li')).to.have.lengthOf(0);
    expect(card.textContent).to.include('Total: $0.00');
  });

  it('renders expense types in the canonical EXPENSE_TYPES order', () => {
    const unorderedExpenses = [
      { id: 'expense1', expenseType: 'Toll', costRequested: 5.5 },
      { id: 'expense2', expenseType: 'Mileage', costRequested: 50.25 },
      { id: 'expense3', expenseType: 'Parking', costRequested: 15.0 },
    ];

    const { getByTestId } = render(
      <EstimatedReimbursementCard
        expenses={unorderedExpenses}
        totalCostRequested={70.75}
      />,
    );

    const items = getByTestId('estimated-reimbursement-card').querySelectorAll(
      'ul li',
    );
    expect(items[0].textContent).to.include('Mileage');
    expect(items[1].textContent).to.include('Parking');
    expect(items[2].textContent).to.include('Tolls');
  });

  it('sums costs for multiple expenses of the same type', () => {
    const repeatedTypeExpenses = [
      { id: 'expense1', expenseType: 'Parking', costRequested: 10.0 },
      { id: 'expense2', expenseType: 'Parking', costRequested: 5.0 },
    ];

    const { getByTestId } = render(
      <EstimatedReimbursementCard
        expenses={repeatedTypeExpenses}
        totalCostRequested={15.0}
      />,
    );

    const card = getByTestId('estimated-reimbursement-card');
    const items = card.querySelectorAll('ul li');
    expect(items).to.have.lengthOf(1);
    expect(card.textContent).to.include('$15.00');
  });

  it('renders the deductible information', () => {
    const { getByTestId } = render(
      <EstimatedReimbursementCard
        expenses={defaultExpenses}
        totalCostRequested={70.75}
      />,
    );

    const card = getByTestId('estimated-reimbursement-card');
    expect(card.textContent).to.include(
      'Before we can pay you back for expenses, you must pay a deductible.',
    );
    expect(card.textContent).to.include('$3');
    expect(card.textContent).to.include('$6');
    expect(card.textContent).to.include('$18');
  });

  it('renders the deductibles link', () => {
    render(
      <EstimatedReimbursementCard
        expenses={defaultExpenses}
        totalCostRequested={70.75}
      />,
    );

    const link = $(
      'va-link[href="/resources/reimbursed-va-travel-expenses-and-mileage-rate/#monthlydeductible"]',
    );
    expect(link).to.exist;
    expect(link.getAttribute('text')).to.equal(
      'Learn more about deductibles for VA travel claims',
    );
    expect(link.getAttribute('external')).to.not.be.null;
  });
});
