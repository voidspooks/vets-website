import React from 'react';
import PropTypes from 'prop-types';
import HTMLStatementLink from './HTMLStatementLink';

const PreviousStatements = ({
  previousStatements,
  shouldUseLighthouseCopays,
  copayId,
}) => {
  if (!previousStatements?.length) return null;

  return (
    <article data-testid="view-statements" className="vads-u-padding--0">
      <h2 id="statement-list" className="vads-u-margin-top--2">
        Previous statements
      </h2>
      <p>
        Review your charges and download your mailed statements from the past 6
        months for this facility.
      </p>
      <ul
        className="no-bullets vads-u-padding-x--0"
        data-testid="otpp-statement-list"
      >
        {previousStatements.map(statement => (
          <HTMLStatementLink
            id={statement.id}
            copayId={copayId}
            statementDate={
              shouldUseLighthouseCopays
                ? statement.invoiceDate
                : statement.pSStatementDateOutput
            }
            key={statement.id}
          />
        ))}
      </ul>
    </article>
  );
};

PreviousStatements.propTypes = {
  copayId: PropTypes.string,
  previousStatements: PropTypes.array,
  shouldUseLighthouseCopays: PropTypes.bool,
};

export default PreviousStatements;
