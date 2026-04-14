import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PreviousStatements from '../../components/PreviousStatements';

const copayIds = {
  jan: 'f4385298-08a6-42f8-a86f-50e97033fb85',
  feb: '4-1abZUKu7xIvIw6',
  mar: '4-1abZUKu7xIv1t4',
  apr: '4-1abZUKu7xIukq2',
  legacyA: '648-stmt-2024-03',
  legacyB: '648-stmt-2024-02',
};

const vhaStatement = (id, invoiceDate) => ({ id, invoiceDate });

const legacyStatement = (id, date) => ({
  id,
  pSStatementDateOutput: date,
});

const renderWithRouter = component =>
  render(<MemoryRouter>{component}</MemoryRouter>);

describe('PreviousStatements', () => {
  describe('when shouldUseLighthouseCopays is true', () => {
    it('should render when recentStatements exist', () => {
      const { getByTestId } = renderWithRouter(
        <PreviousStatements
          previousStatements={[
            vhaStatement(copayIds.jan, '2024-01-01'),
            vhaStatement(copayIds.feb, '2024-02-01'),
            vhaStatement(copayIds.mar, '2024-03-01'),
          ]}
          shouldUseLighthouseCopays
        />,
      );

      expect(getByTestId('view-statements')).to.exist;
      expect(getByTestId(`balance-details-${copayIds.jan}-statement-view`)).to
        .exist;
      expect(getByTestId(`balance-details-${copayIds.feb}-statement-view`)).to
        .exist;
      expect(getByTestId(`balance-details-${copayIds.mar}-statement-view`)).to
        .exist;
    });

    it('should return null when recentStatements is empty', () => {
      const { queryByTestId } = renderWithRouter(
        <PreviousStatements
          previousStatements={[]}
          shouldUseLighthouseCopays
        />,
      );

      expect(queryByTestId('view-statements')).to.not.exist;
    });

    it('should not sort statements (render in original order)', () => {
      const { getByTestId } = renderWithRouter(
        <PreviousStatements
          previousStatements={[
            vhaStatement(copayIds.jan, '2024-01-01'),
            vhaStatement(copayIds.mar, '2024-03-01'),
            vhaStatement(copayIds.feb, '2024-02-01'),
            vhaStatement(copayIds.apr, '2024-04-01'),
          ]}
          shouldUseLighthouseCopays
        />,
      );

      const list = getByTestId('otpp-statement-list');
      const items = list.querySelectorAll('li');
      expect(items).to.have.lengthOf(4);

      // Verify order is preserved by checking the full href of each va-link in sequence
      expect(items[0].querySelector('va-link').getAttribute('href')).to.equal(
        `/copay-balances/${copayIds.jan}/statement`,
      );
      expect(items[1].querySelector('va-link').getAttribute('href')).to.equal(
        `/copay-balances/${copayIds.mar}/statement`,
      );
      expect(items[2].querySelector('va-link').getAttribute('href')).to.equal(
        `/copay-balances/${copayIds.feb}/statement`,
      );
      expect(items[3].querySelector('va-link').getAttribute('href')).to.equal(
        `/copay-balances/${copayIds.apr}/statement`,
      );
    });

    it('should render correct heading and description text', () => {
      const { getByRole, getByText } = renderWithRouter(
        <PreviousStatements
          previousStatements={[vhaStatement(copayIds.jan, '2024-01-01')]}
          shouldUseLighthouseCopays
        />,
      );

      expect(getByRole('heading', { level: 2 }).textContent).to.equal(
        'Previous statements',
      );
      expect(
        getByText(content =>
          content.includes(
            'Review your charges and download your mailed statements from the past 6 months',
          ),
        ),
      ).to.exist;
    });
  });

  describe('when shouldUseLighthouseCopays is false', () => {
    it('should render when previous statements exist', () => {
      const { getByTestId } = renderWithRouter(
        <PreviousStatements
          previousStatements={[
            legacyStatement(copayIds.legacyA, '01/01/2024'),
            legacyStatement(copayIds.legacyB, '03/01/2024'),
          ]}
        />,
      );

      expect(getByTestId('view-statements')).to.exist;
      expect(getByTestId(`balance-details-${copayIds.legacyA}-statement-view`))
        .to.to.exist;
      expect(getByTestId(`balance-details-${copayIds.legacyB}-statement-view`))
        .to.to.exist;
    });

    it('should return null when previousStatements is empty', () => {
      const { queryByTestId } = renderWithRouter(
        <PreviousStatements previousStatements={[]} />,
      );

      expect(queryByTestId('view-statements')).to.not.exist;
    });

    it('should render statements in the order provided', () => {
      const { getByTestId } = renderWithRouter(
        <PreviousStatements
          previousStatements={[
            legacyStatement(copayIds.legacyA, '03/01/2024'),
            legacyStatement(copayIds.legacyB, '02/01/2024'),
          ]}
          shouldUseLighthouseCopays={false}
        />,
      );

      const list = getByTestId('otpp-statement-list');
      const items = list.querySelectorAll('li');
      expect(items).to.have.lengthOf(2);
      expect(items[0].querySelector('va-link').getAttribute('href')).to.equal(
        `/copay-balances/${copayIds.legacyA}/statement`,
      );
      expect(items[1].querySelector('va-link').getAttribute('href')).to.equal(
        `/copay-balances/${copayIds.legacyB}/statement`,
      );
    });
  });

  it('should forward copayId to each HTMLStatementLink as router state (links render with correct hrefs)', () => {
    const { getByTestId } = renderWithRouter(
      <PreviousStatements
        previousStatements={[
          vhaStatement(copayIds.jan, '2024-01-01'),
          vhaStatement(copayIds.feb, '2024-02-01'),
        ]}
        isVHA
        copayId="parent-copay-123"
      />,
    );

    // copayId is threaded via history.push state in HTMLStatementLink, not a DOM attribute.
    // We verify both links render and point to the correct copay hrefs.
    expect(getByTestId(`balance-details-${copayIds.jan}-statement-view`)).to
      .exist;

    expect(getByTestId(`balance-details-${copayIds.feb}-statement-view`)).to
      .exist;
    expect(
      getByTestId(
        `balance-details-${copayIds.jan}-statement-view`,
      ).getAttribute('href'),
    ).to.equal(`/copay-balances/${copayIds.jan}/statement`);
    expect(
      getByTestId(
        `balance-details-${copayIds.feb}-statement-view`,
      ).getAttribute('href'),
    ).to.equal(`/copay-balances/${copayIds.feb}/statement`);
  });

  it('should return null when previousStatements is undefined', () => {
    const { queryByTestId } = renderWithRouter(
      <PreviousStatements previousStatements={undefined} />,
    );

    expect(queryByTestId('view-statements')).to.not.exist;
  });

  describe('edge cases', () => {
    it('should handle null previousStatements gracefully', () => {
      const { queryByTestId } = renderWithRouter(
        <PreviousStatements previousStatements={null} />,
      );

      expect(queryByTestId('view-statements')).to.not.exist;
    });
  });
});
