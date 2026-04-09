import React from 'react';
import PropTypes from 'prop-types';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import useTooltipLifecycle from '../../hooks/useTooltipLifecycle';

const DismissibleAlert = ({
  tooltipName,
  status,
  headline,
  children,
  className,
}) => {
  const { tooltipVisible, tooltipId, dismiss } = useTooltipLifecycle(
    tooltipName,
  );

  if (!tooltipVisible) return null;

  return (
    <VaAlert
      status={status}
      closeable
      closeBtnAriaLabel="Close notification"
      onCloseEvent={dismiss}
      className={className}
      data-testid="dismissible-tooltip-alert"
      data-dd-privacy="mask"
      data-dd-action-name={`Dismissible tooltip alert - ${tooltipId}`}
    >
      {headline && <h2 slot="headline">{headline}</h2>}
      {children}
    </VaAlert>
  );
};

DismissibleAlert.propTypes = {
  children: PropTypes.node.isRequired,
  tooltipName: PropTypes.string.isRequired,
  className: PropTypes.string,
  headline: PropTypes.string,
  status: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
};

DismissibleAlert.defaultProps = {
  status: 'info',
  headline: null,
  className: '',
};

export default DismissibleAlert;
