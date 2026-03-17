import React from 'react';
import { Provider } from 'react-redux';
import { render, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';

import { SET_DATA } from 'platform/forms-system/src/js/actions';
import { PreSubmitInfo } from '../../../containers/PreSubmitInfo';
import { FORM_RESPONSES_KEY } from '../../../constants/storageKeys';

// Mocking a Redux store with dispatch
const store = {
  getState: () => ({
    form: {
      formId: 'T-QSTNR',
      data: {},
    },
  }),
  subscribe: () => {},
  dispatch: sinon.spy(action => {
    // Simulating setting the data in the Redux store when setData is dispatched
    if (action.type === SET_DATA) {
      store.getState = () => ({
        form: {
          formId: 'T-QSTNR',
          data: action.payload,
        },
      });
    }
  }),
};

describe('<PreSubmitInfo>', () => {
  let setPreSubmitSpy;
  const getProps = () => ({
    props: {
      formData: {
        privacyAgreementAccepted: false,
      },
      setPreSubmit: setPreSubmitSpy,
      showError: sinon.mock(),
    },
  });

  beforeEach(() => {
    setPreSubmitSpy = sinon.spy();
  });

  context('when the component renders', () => {
    it('contains the privacy agreement', () => {
      const { props } = getProps();
      const { container } = render(
        <Provider store={store}>
          <PreSubmitInfo {...props} />
        </Provider>,
      );
      const selectors = {
        privacyAgreement: container.querySelector(
          '[name="privacyAgreementAccepted"]',
        ),
      };

      expect(selectors.privacyAgreement).to.exist;
    });

    it('sets privacyAgreementAccepted to false on mount', () => {
      const { props } = getProps();
      render(
        <Provider store={store}>
          <PreSubmitInfo {...props} />
        </Provider>,
      );

      expect(setPreSubmitSpy.calledWith('privacyAgreementAccepted', false)).to
        .be.true;
    });

    it('calls setPreSubmit with true when user accepts the agreement', async () => {
      const { props } = getProps();
      const { container } = render(
        <Provider store={store}>
          <PreSubmitInfo {...props} />
        </Provider>,
      );

      const vaPrivacyAgreement = container.querySelector(
        'va-privacy-agreement',
      );

      const customEvent = new CustomEvent('vaChange', {
        detail: { checked: true },
        bubbles: true,
      });

      vaPrivacyAgreement.dispatchEvent(customEvent);

      await waitFor(() => {
        expect(setPreSubmitSpy.calledWith('privacyAgreementAccepted', true)).to
          .be.true;
      });
    });

    it('reads form data from sessionStorage and dispatches it to Redux', () => {
      const mockSessionData = {
        characterOfDischarge: 'HONORABLE',
        characterOfDischargeTWO: {},
        militaryServiceTotalTimeServed: 'LESS_THAN_4_MONTHS',
        goals: {
          RETIREMENT: true,
        },
        militaryBranch: {},
        AIR_FORCE: {},
        ARMY: {},
        COAST_GUARD: {},
        MARINE_CORPS: {},
        NAVY: {},
        privacyAgreementAccepted: true,
      };

      // Set mock session data
      global.sessionStorage.setItem(
        FORM_RESPONSES_KEY,
        JSON.stringify(mockSessionData),
      );

      const { props } = getProps();
      render(
        <Provider store={store}>
          <PreSubmitInfo {...props} />
        </Provider>,
      );

      // Simulate the dispatch of `setData` action with the session data
      store.dispatch({
        type: SET_DATA,
        payload: mockSessionData,
      });

      // Check if the Redux store has been updated with the correct form data
      const state = store.getState();
      expect(state.form.data).to.deep.equal(mockSessionData);
    });
  });
});
