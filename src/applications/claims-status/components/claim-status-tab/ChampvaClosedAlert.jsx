import React from 'react';
import PropTypes from 'prop-types';

import { buildDateFormatter } from '../../utils/helpers';

export default function ChampvaClosedAlert({ claim }) {
  const { closeDate, claimStatusMeta } = claim.attributes;
  const closedAlertMeta = claimStatusMeta?.closedAlert || {};
  const title =
    closedAlertMeta.title || 'We made a decision on your application';
  const description = closedAlertMeta.description || '';

  const formattedDate = closeDate ? buildDateFormatter()(closeDate) : null;
  const headline = formattedDate ? `${title} ${formattedDate}` : title;

  return (
    <va-alert
      data-testid="champva-closed-alert"
      class="vads-u-margin-bottom--4"
      status="info"
    >
      <h2 id="claims-alert-header" slot="headline">
        {headline}
      </h2>
      {description && <p className="vads-u-margin-y--0">{description}</p>}
    </va-alert>
  );
}

ChampvaClosedAlert.propTypes = {
  claim: PropTypes.object.isRequired,
};
