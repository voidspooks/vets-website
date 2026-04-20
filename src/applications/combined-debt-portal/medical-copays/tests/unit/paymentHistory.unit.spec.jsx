import React from 'react';
import { cleanup, render, within } from '@testing-library/react';
import { expect } from 'chai';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import { showVHAPaymentHistory } from '../../../combined/utils/helpers';
import StatementCharges from '../../components/StatementCharges';
import mockstatements from '../../../combined/utils/mocks/mockStatements.json';

describe('Feature Toggle Data Confirmation', () => {
  afterEach(() => {
    cleanup();
  });

  // Confirms the selector returns true — StatementTable rendering logic is covered
  // in statementTable.unit.spec.jsx
  it('showVHAPaymentHistory is true', () => {
    const mockState = {
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
      },
    };

    const result = showVHAPaymentHistory(mockState);
    expect(result).to.be.true;
  });

  // TODO: to be removed once toggle is fully enabled
  // Confirms the selector returns false and StatementCharges renders correctly —
  // full StatementCharges rendering is covered in statementCharges.unit.spec.jsx
  it('showVHAPaymentHistory is false', () => {
    const mockState = {
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: false,
      },
    };

    const { container } = render(
      <StatementCharges copay={mockstatements[2]} />,
    );

    const firstRow = container.querySelectorAll('va-table-row')[1];

    const result = showVHAPaymentHistory(mockState);
    expect(result).to.be.false;

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
});
