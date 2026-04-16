// libs
import React from 'react';
import PropTypes from 'prop-types';

// forms-system constants
import { APP_TYPE_DEFAULT } from '../constants';

// submit states
import ClientError from './submit-states/ClientError';
import Default from './submit-states/Default';
import GenericError from './submit-states/GenericError';
import Pending from './submit-states/Pending';
import Submitted from './submit-states/Submitted';
import ThrottledError from './submit-states/ThrottledError';
import ValidationError from './submit-states/ValidationError';

export default function SubmitButtons(props) {
  const { onBack, onSubmit, submission, formConfig, formErrors = {} } = props;

  const appType = formConfig?.customText?.appType || APP_TYPE_DEFAULT;
  const buttonText =
    formConfig.customText?.submitButtonText || `Submit ${appType}`;

  const renderProps = {
    appType,
    onBack,
    onSubmit,
    formConfig,
    buttonText,
    formErrors,
    submission,
  };

  if (submission.status === false) {
    return <Default {...renderProps} />;
  }

  if (submission.status === 'submitPending') {
    return <Pending {...renderProps} />;
  }

  if (submission.status === 'applicationSubmitted') {
    return <Submitted {...renderProps} />;
  }

  if (submission.status === 'clientError') {
    return <ClientError {...renderProps} />;
  }

  if (submission.status === 'throttledError') {
    return <ThrottledError {...renderProps} when={submission.extra} />;
  }

  if (submission.status === 'validationError') {
    return <ValidationError {...renderProps} />;
  }

  return <GenericError {...renderProps} />;
}

SubmitButtons.propTypes = {
  formConfig: PropTypes.shape({
    customText: PropTypes.shape({
      appType: PropTypes.string,
      submitButtonText: PropTypes.string,
    }),
  }),
  formErrors: PropTypes.object,
  submission: PropTypes.object,
  onBack: PropTypes.func,
  onSubmit: PropTypes.func,
};
