import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CaseProgressDescription from './CaseProgressDescription';

const CaseProgressBar = ({
  current,
  stepLabels,
  headingText = 'VA Benefits',
  label = 'Label is here',
  counters = 'small',
  headerLevel = 2,
  attributes = {},
}) => {
  const total = stepLabels.length;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fullSizeProgressBarProps =
    windowWidth > 820 ? { label, labels: stepLabels.join(';'), counters } : {};

  return (
    <>
      <div className="usa-width-one-whole vads-u-margin-top--2">
        <va-segmented-progress-bar
          current={String(current)}
          header-level={headerLevel}
          heading-text={headingText}
          {...fullSizeProgressBarProps}
          total={String(total)}
        />
      </div>

      <CaseProgressDescription step={current} attributes={attributes} />
    </>
  );
};

CaseProgressBar.propTypes = {
  current: PropTypes.number.isRequired,
  stepLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  headingText: PropTypes.string,
  label: PropTypes.string,
  counters: PropTypes.oneOf(['small', 'large']),
  headerLevel: PropTypes.number,
  attributes: PropTypes.object,
};

export default CaseProgressBar;
