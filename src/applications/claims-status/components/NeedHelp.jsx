import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import * as TrackedItem from '../utils/trackedItemContent';

export function NeedHelp({ claim, item }) {
  const helpMeta = claim?.attributes?.claimStatusMeta?.help;
  const phone = helpMeta?.phone || '8008271000';
  const tty = helpMeta?.tty || '711';
  const hours =
    helpMeta?.hours || 'Monday through Friday, 8:00 a.m. to 9:00 p.m. ET.';
  const intro = helpMeta?.intro || 'Call us';
  const inlineTty = helpMeta?.inlineTty || false;
  const askVa = helpMeta?.askVa || null;

  const alias =
    item && item.supportAliases?.length > 0
      ? item.supportAliases.map((name, index) => {
          let separator = null;
          let displayName = name;

          if (index === item.supportAliases.length - 1) {
            displayName = `${name}.`;
          } else if (index === item.supportAliases.length - 2) {
            separator = ' or ';
          } else if (index < item.supportAliases.length - 2 && index >= 0) {
            separator = ', ';
          }

          return (
            <Fragment key={index}>
              <span className="vads-u-font-weight--bold">“{displayName}”</span>
              {separator}
            </Fragment>
          );
        })
      : null;

  return (
    <va-need-help class="vads-u-margin-top--4">
      <div slot="content">
        <p>
          {inlineTty ? (
            <>
              {intro} at <va-telephone contact={phone} /> (
              <va-telephone contact={tty} tty="true" />
              ). We're here {hours}
            </>
          ) : (
            <>
              {intro} at <va-telephone contact={phone} />. We're here {hours} If
              you have hearing loss, call{' '}
              <va-telephone contact={tty} tty="true" />.
            </>
          )}
        </p>
        {askVa && (
          <p>
            {askVa.text} <va-link href={askVa.linkUrl} text={askVa.linkText} />
          </p>
        )}
        {alias && (
          <p>
            We may refer to the{' '}
            <span className="vads-u-font-weight--bold">
              “{TrackedItem.getDisplayFriendlyName(item)}”
            </span>{' '}
            request as {alias}
          </p>
        )}
      </div>
    </va-need-help>
  );
}

NeedHelp.propTypes = {
  claim: PropTypes.object,
  item: PropTypes.object,
};
export default NeedHelp;
