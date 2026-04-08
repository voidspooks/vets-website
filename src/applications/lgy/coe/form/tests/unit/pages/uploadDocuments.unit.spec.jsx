import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { DocumentTypeSelect } from '../../../pages/uploadDocuments';
import {
  entitlementRestorationOptions,
  serviceStatuses,
} from '../../../constants';

const mockStore = configureStore([]);

const renderWithStore = formData => {
  const store = mockStore({
    form: {
      data: formData,
    },
  });
  return render(
    <Provider store={store}>
      <DocumentTypeSelect />
    </Provider>,
  );
};

describe('DocumentTypeSelect component', () => {
  it('should show Discharge papers for VETERAN', () => {
    const { container } = renderWithStore({
      identity: serviceStatuses.VETERAN,
    });

    const options = container.querySelectorAll('option');
    expect(options).to.have.length(1);
    expect(options[0].textContent).to.equal('Discharge papers (DD214)');
  });

  it('should show Discharge papers and Loan evidence for VETERAN with prior loans', () => {
    const { container } = renderWithStore({
      identity: serviceStatuses.VETERAN,
      loanHistory: {
        hadPriorLoans: true,
      },
    });

    const options = container.querySelectorAll('option');
    expect(options).to.have.length(2);
    expect(options[0].textContent).to.equal('Discharge papers (DD214)');
    expect(options[1].textContent).to.equal('Loan evidence');
  });

  it('should show Statement of Service for ADSM without Purple Heart', () => {
    const { container } = renderWithStore({
      identity: serviceStatuses.ADSM,
      militaryHistory: {
        purpleHeartRecipient: false,
      },
    });

    const options = container.querySelectorAll('option');
    expect(options).to.have.length(1);
    expect(options[0].textContent).to.equal('Statement of Service');
  });

  it('should show Statement of Service and Purple Heart Certificate for ADSM with Purple Heart', () => {
    const { container } = renderWithStore({
      identity: serviceStatuses.ADSM,
      militaryHistory: {
        purpleHeartRecipient: true,
      },
    });

    const options = container.querySelectorAll('option');
    expect(options).to.have.length(2);
    expect(options[0].textContent).to.equal('Statement of Service');
    expect(options[1].textContent).to.equal('Purple Heart Certificate');
  });

  it('should show 3 document types for NADNA', () => {
    const { container } = renderWithStore({
      identity: serviceStatuses.NADNA,
    });

    const options = container.querySelectorAll('option');
    expect(options).to.have.length(3);
    expect(options[0].textContent).to.equal('Statement of Service');
    expect(options[1].textContent).to.equal('Creditable number of years');
    expect(options[2].textContent).to.equal('Retirement Points Statement');
  });

  it('should show 3 document types for DNANA (no Department of Defense Discharge Certificate)', () => {
    const { container } = renderWithStore({
      identity: serviceStatuses.DNANA,
    });

    const options = container.querySelectorAll('option');
    expect(options).to.have.length(3);
    expect(options[0].textContent).to.equal('Separation and Report of Service');
    expect(options[1].textContent).to.equal('Retirement Points Accounting');
    expect(options[2].textContent).to.equal('Proof of character of service');
  });

  it('should show 4 document types for DNANA with prior VA home loan including Loan evidence', () => {
    const { container } = renderWithStore({
      identity: serviceStatuses.DNANA,
      loanHistory: { hadPriorLoans: true },
    });

    const options = container.querySelectorAll('option');
    expect(options).to.have.length(4);
    expect(options[3].textContent).to.equal('Loan evidence');
  });

  it('should show 2 document types for DRNA (no Separation and Report of Service or DoD Discharge Certificate)', () => {
    const { container } = renderWithStore({
      identity: serviceStatuses.DRNA,
    });

    const options = container.querySelectorAll('option');
    expect(options).to.have.length(2);
    expect(options[0].textContent).to.equal('Retirement Points Accounting');
    expect(options[1].textContent).to.equal('Proof of character of service');
  });

  it('should show 3 document types for DRNA with prior VA home loan including Loan evidence', () => {
    const { container } = renderWithStore({
      identity: serviceStatuses.DRNA,
      loanHistory: { hadPriorLoans: true },
    });

    const options = container.querySelectorAll('option');
    expect(options).to.have.length(3);
    expect(options[2].textContent).to.equal('Loan evidence');
  });

  it('does not add Loan evidence when user said no to prior VA loans even if a property has one-time restoration', () => {
    const { container } = renderWithStore({
      identity: serviceStatuses.VETERAN,
      loanHistory: { hadPriorLoans: false },
      relevantPriorLoans: [
        {
          entitlementRestoration:
            entitlementRestorationOptions.ONE_TIME_RESTORATION,
        },
      ],
    });

    const labels = [...container.querySelectorAll('option')].map(
      el => el.textContent,
    );
    expect(labels).to.deep.equal(['Discharge papers (DD214)']);
    expect(labels).to.not.include('Loan evidence');
  });
});
