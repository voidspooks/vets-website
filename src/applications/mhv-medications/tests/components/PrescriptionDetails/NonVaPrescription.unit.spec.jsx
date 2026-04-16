import React from 'react';
import { renderWithStoreAndRouterV6 } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import { expect } from 'chai';
import nonVaRxDetailsResponse from '../../fixtures/nonVaPrescription.json';
import NonVaPrescription from '../../../components/PrescriptionDetails/NonVaPrescription';

describe('nonVaPrescription details container', () => {
  const prescription = nonVaRxDetailsResponse.data.attributes;
  const setup = (
    rx = prescription,
    { isCernerPilot = false, isMedsImprovements = false } = {},
  ) => {
    return renderWithStoreAndRouterV6(<NonVaPrescription {...rx} />, {
      initialState: {
        featureToggles: {
          // eslint-disable-next-line camelcase
          mhv_medications_cerner_pilot: isCernerPilot,
          // eslint-disable-next-line camelcase
          mhv_medications_management_improvements: isMedsImprovements,
        },
      },
      reducers: {},
      initialEntries: ['/prescriptions/1234567891'],
    });
  };

  it('renders without errors', () => {
    const screen = setup();
    expect(screen);
  });

  it('displays "Active: Non-VA" as the status', () => {
    const { getByTestId } = setup();
    expect(getByTestId('rx-status')).to.contain.text('Active: Non-VA');
  });

  it('displays prescription disclaimer', () => {
    const screen = setup({ ...prescription, disclaimer: 'test disclaimer' });
    expect(screen.findByText('test disclaimer')).to.exist;
  });

  it('displays details when provided', () => {
    const rx = {
      ...prescription,
      sig: 'These are your instructions',
      indicationForUse: 'This is your reason for use',
      dispensedDate: '2022-06-02',
      providerFirstName: 'FirstName',
      providerLastName: 'LastName',
      facilityName: 'VA Facility No. 123',
    };
    const screen = setup(rx);
    // screen.debug();
    const { getByTestId } = screen;
    expect(getByTestId('rx-instructions')).to.have.text(rx.sig);
    expect(getByTestId('rx-reason-for-use')).to.have.text(rx.indicationForUse);
    expect(getByTestId('rx-dispensed-date')).to.have.text('June 2, 2022');
    expect(getByTestId('rx-documented-by')).to.have.text('FirstName LastName');
    expect(getByTestId('rx-documented-at')).to.have.text(rx.facilityName);
  });

  it('displays defaults when empty', () => {
    const rx = {
      ...prescription,
      sig: '',
      indicationForUse: '',
      dispensedDate: '',
      providerFirstName: '',
      providerLastName: '',
      facilityName: '',
    };
    const { getByTestId } = setup(rx);
    /* eslint-disable prettier/prettier */
    expect(getByTestId('rx-instructions')).to.have.text('Instructions not available');
    expect(getByTestId('rx-reason-for-use')).to.have.text('Reason for use not available');
    expect(getByTestId('rx-dispensed-date')).to.have.text('Date not available');
    expect(getByTestId('rx-documented-by')).to.have.text('Provider name not available');
    expect(getByTestId('rx-documented-at')).to.have.text('VA facility name not available');
    /* eslint-enable prettier/prettier */
  });

  it('displays defaults when null', () => {
    const rx = {
      ...prescription,
      sig: null,
      indicationForUse: null,
      dispensedDate: null,
      providerFirstName: null,
      providerLastName: null,
      facilityName: null,
    };
    const { getByTestId } = setup(rx);
    /* eslint-disable prettier/prettier */
    expect(getByTestId('rx-instructions')).to.have.text('Instructions not available');
    expect(getByTestId('rx-reason-for-use')).to.have.text('Reason for use not available');
    expect(getByTestId('rx-dispensed-date')).to.have.text('Date not available');
    expect(getByTestId('rx-documented-by')).to.have.text('Provider name not available');
    expect(getByTestId('rx-documented-at')).to.have.text('VA facility name not available');
    /* eslint-enable prettier/prettier */
  });

  it('hides reason for use section when Cerner pilot is enabled', () => {
    const screen = setup(prescription, { isCernerPilot: true });

    expect(screen.queryByTestId('rx-reason-for-use')).to.be.null;
  });

  describe('when medications management improvements flag is enabled', () => {
    it('displays updated status definition text', () => {
      const { getByTestId } = setup(prescription, { isMedsImprovements: true });
      const statusDefinition = getByTestId('nonVA-status-definition');
      expect(statusDefinition).to.contain.text(
        'A VA provider entered this medication in your records. But you didn’t get this medication through a VA pharmacy.',
      );
    });
  });
});
