import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { VaButton } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { selectIsCernerPatient } from 'platform/user/cerner-dsot/selectors';
import useTooltipLifecycle from '../../hooks/useTooltipLifecycle';

const InProductionEducationAlert = ({
  tooltipName,
  children,
  className,
  dismissButtonTestId,
  onDismiss,
  ...props
}) => {
  const isCernerPatient = useSelector(selectIsCernerPatient);
  const { tooltipVisible, dismiss } = useTooltipLifecycle(tooltipName, {
    skip: !isCernerPatient,
  });

  const handleStopShowing = useCallback(
    () => {
      dismiss();
      if (onDismiss) {
        onDismiss();
      }
    },
    [dismiss, onDismiss],
  );

  if (!tooltipVisible || !isCernerPatient) return null;

  return (
    <aside className={`sm-ipe-alert ${className || ''}`} {...props}>
      {children}
      <VaButton
        className="vads-u-margin-top--3"
        secondary
        text="Stop showing this hint"
        data-testid={dismissButtonTestId}
        onClick={handleStopShowing}
      />
    </aside>
  );
};

InProductionEducationAlert.propTypes = {
  children: PropTypes.node.isRequired,
  tooltipName: PropTypes.string.isRequired,
  className: PropTypes.string,
  dismissButtonTestId: PropTypes.string,
  onDismiss: PropTypes.func,
};

export default InProductionEducationAlert;
