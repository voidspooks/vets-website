import React from 'react';
import PropTypes from 'prop-types';
import { VaLink } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { isSafeUrl } from '../../utils/helpers';

export default function ChampvaNextSteps({ claim }) {
  const nextStepsMeta = claim.attributes?.claimStatusMeta?.nextSteps || {};
  const title = nextStepsMeta.title || 'Next steps';
  const items = nextStepsMeta.items || [];

  if (!items.length) return null;

  return (
    <div
      data-testid="champva-next-steps"
      className="next-steps-container vads-u-margin-bottom--4"
    >
      <h3 className="vads-u-margin-top--0 vads-u-margin-bottom--3">{title}</h3>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <p>
            {item.boldText && <strong>{item.boldText}</strong>}
            {item.text}
          </p>
          {item.linkText &&
            item.linkUrl &&
            isSafeUrl(item.linkUrl) && (
              <p>
                <VaLink href={item.linkUrl} text={item.linkText} />
              </p>
            )}
        </React.Fragment>
      ))}
    </div>
  );
}

ChampvaNextSteps.propTypes = {
  claim: PropTypes.object.isRequired,
};
