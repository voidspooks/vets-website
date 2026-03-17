// added until testing of new radio buttons is completed

import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { VaPrivacyAgreement } from '@department-of-veterans-affairs/component-library/dist/react-bindings';

// platform - form-system actions
import { setData } from 'platform/forms-system/exportsFile';
import { setPreSubmit as setPreSubmitAction } from 'platform/forms-system/src/js/actions';
import { FORM_RESPONSES_KEY } from '../constants/storageKeys';

export const PreSubmitInfo = ({ formData, showError, setPreSubmit }) => {
  const dispatch = useDispatch();

  useEffect(
    () => {
      // This ensures the user will always have to accept the privacy agreement.
      setPreSubmit('privacyAgreementAccepted', false);
    },
    [setPreSubmit],
  );

  useEffect(
    () => {
      // Restore saved responses from sessionStorage only if the form hasn't been populated yet.
      // `characterOfDischarge` is used as the hydration check since it's the last required field.
      if (isEmpty(formData.characterOfDischarge)) {
        const savedResponses = sessionStorage.getItem(FORM_RESPONSES_KEY);

        if (savedResponses) {
          try {
            const data = JSON.parse(savedResponses);
            dispatch(setData(data));
          } catch (error) {
            // Clear the corrupted sessionStorage entry to prevent future parsing errors.
            sessionStorage.removeItem(FORM_RESPONSES_KEY);
          }
        }
      }
    },
    [dispatch, formData.characterOfDischarge],
  );

  const privacyAgreementAccepted = formData.privacyAgreementAccepted || false;

  return (
    <VaPrivacyAgreement
      enableAnalytics
      class="vads-u-margin-y--4"
      name="privacyAgreementAccepted"
      onVaChange={event =>
        setPreSubmit('privacyAgreementAccepted', event.detail.checked)
      }
      showError={showError && !privacyAgreementAccepted}
    />
  );
};

const mapDispatchToProps = {
  setPreSubmit: setPreSubmitAction,
};

export default connect(
  null,
  mapDispatchToProps,
)(PreSubmitInfo);
