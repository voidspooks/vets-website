import React from 'react';
import PropTypes from 'prop-types';
import { VaPrivacyAgreement } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { useFeatureToggle } from '~/platform/utilities/feature-toggles/useFeatureToggle';
import { TOGGLE_KEY } from '../../constants';
import { PreSubmitInfo2 } from '../../components/PreSubmitInfo2';

export const PreSubmitInfoSelector = props => {
  const {
    TOGGLE_NAMES,
    useToggleLoadingValue,
    useToggleValue,
  } = useFeatureToggle();
  const coeRebuildEnabled = useToggleValue(TOGGLE_NAMES[TOGGLE_KEY]);
  const isLoading = useToggleLoadingValue(TOGGLE_NAMES[TOGGLE_KEY]);

  if (isLoading) {
    return <va-loading-indicator message="Loading your application..." />;
  }

  if (coeRebuildEnabled) {
    return <PreSubmitInfo2 {...props} />;
  }

  const { formData, preSubmitInfo, showError, onSectionComplete } = props;
  const checked = formData?.[preSubmitInfo.field] || false;

  return (
    <div>
      {preSubmitInfo.notice}
      {preSubmitInfo.required && (
        <VaPrivacyAgreement
          required={preSubmitInfo.required}
          checked={checked}
          name={preSubmitInfo.field}
          showError={
            showError && !checked
              ? preSubmitInfo.error || 'Please accept'
              : undefined
          }
          onVaChange={event => onSectionComplete(event.target.checked)}
          uswds
        />
      )}
    </div>
  );
};

PreSubmitInfoSelector.propTypes = {
  formData: PropTypes.object,
  onSectionComplete: PropTypes.func,
  preSubmitInfo: PropTypes.shape({
    error: PropTypes.string,
    field: PropTypes.string,
    notice: PropTypes.node,
    required: PropTypes.bool,
  }),
  showError: PropTypes.bool,
  user: PropTypes.object,
};
