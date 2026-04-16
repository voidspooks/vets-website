import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { Column, Row } from 'platform/forms/components/common/grid';
import ErrorMessage from 'platform/forms/components/common/alerts/ErrorMessage';
import PreSubmitSection from 'platform/forms/components/review/PreSubmitSection';
import { waitForRenderThenFocus } from 'platform/utilities/ui/focus';
import { scrollTo } from 'platform/utilities/scroll';

import ProgressButton from '../../components/ProgressButton';
import Back from './Back';
import ErrorLinks from './ErrorLinks';

function ValidationError(props) {
  const { appType, buttonText, formConfig, onBack, onSubmit, testId } = props;

  const {
    showReviewErrors,
    formOptions,
    validationError: CustomValidationError,
  } = formConfig || {};

  useEffect(
    () => {
      // ErrorMessage & ErrorLinks components do their own focus management
      if (CustomValidationError) {
        // Initial focus is on the progress stepper
        setTimeout(() => {
          waitForRenderThenFocus('#submission-error-wrapper');
          scrollTo('#submission-error-wrapper');
        });
      }
    },
    [CustomValidationError],
  );

  let ariaDescribedBy = null;
  // If no ariaDescribedBy is passed down from form.js,
  // a null value will properly not render the aria label.
  if (formConfig?.ariaDescribedBySubmit !== null) {
    ariaDescribedBy = formConfig?.ariaDescribedBySubmit;
  } else {
    ariaDescribedBy = null;
  }
  const hideBackButton = formConfig?.useTopBackLink || false;
  const useWebComponents = formOptions?.useWebComponentForNavigation;

  // Show review error message with links (must be enabled in formConfig) or
  // default validation error message
  let alert = showReviewErrors ? (
    <ErrorLinks appType={appType} testId={testId} formConfig={formConfig} />
  ) : (
    <ErrorMessage
      active
      title={`We’re sorry. Some information in your ${appType} is missing or not valid.`}
    >
      <p>
        Please check each section of your {appType} to make sure you’ve filled
        out all the information that is required.
      </p>
    </ErrorMessage>
  );

  if (CustomValidationError) {
    alert = (
      <div id="submission-error-wrapper">
        <CustomValidationError
          {...props}
          errorLinks={formConfig.showReviewErrors ? alert : null}
        />
      </div>
    );
  }

  return (
    <>
      <Row>
        <Column id="submission-error-wrapper" role="alert" testId={testId}>
          {alert}
        </Column>
      </Row>
      <PreSubmitSection formConfig={formConfig} />
      <Row classNames="form-progress-buttons vads-u-margin-y--2">
        {hideBackButton ? (
          <>
            <Column classNames="small-6 medium-5">
              <ProgressButton
                ariaDescribedBy={ariaDescribedBy}
                onButtonClick={onSubmit}
                buttonText={buttonText}
                buttonClass="usa-button-primary"
                useWebComponents={useWebComponents}
              />
            </Column>
          </>
        ) : (
          <>
            <Column classNames="small-6 medium-5">
              <Back
                onButtonClick={onBack}
                useWebComponents={useWebComponents}
              />
            </Column>
            <Column classNames="small-6 medium-5">
              <ProgressButton
                ariaDescribedBy={ariaDescribedBy}
                onButtonClick={onSubmit}
                buttonText={buttonText}
                buttonClass="usa-button-primary"
                useWebComponents={useWebComponents}
              />
            </Column>
            <Column classNames="small-1 medium-1 end">
              <div className="hidden">&nbsp;</div>
            </Column>
          </>
        )}
      </Row>
    </>
  );
}

ValidationError.propTypes = {
  appType: PropTypes.string,
  buttonText: PropTypes.string,
  formConfig: PropTypes.shape({
    validationError: PropTypes.func,
    showReviewErrors: PropTypes.bool,
    ariaDescribedBySubmit: PropTypes.string,
    useTopBackLink: PropTypes.bool,
    formOptions: PropTypes.shape({
      useWebComponentForNavigation: PropTypes.bool,
    }),
  }),
  submission: PropTypes.shape({
    errorMessage: PropTypes.string,
    errorReceived: PropTypes.oneOfType([
      PropTypes.instanceOf(Error),
      PropTypes.shape({
        message: PropTypes.string,
      }),
      PropTypes.shape({
        errors: PropTypes.arrayOf(
          PropTypes.shape({
            code: PropTypes.string,
            detail: PropTypes.string,
            source: PropTypes.shape({
              pointer: PropTypes.string,
            }),
            status: PropTypes.string,
            title: PropTypes.string,
          }),
        ),
      }),
    ]),
    hasAttemptedSubmit: PropTypes.bool,
    id: PropTypes.any,
    status: PropTypes.string,
    timestamp: PropTypes.number,
    onBack: PropTypes.func,
    onSubmit: PropTypes.func,
  }),
  testId: PropTypes.string,
  onBack: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default ValidationError;
