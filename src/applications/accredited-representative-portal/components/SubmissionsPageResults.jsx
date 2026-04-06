import React from 'react';
import { PropTypes } from 'prop-types';
import SubmissionCard from './SubmissionCard';

const SubmissionsPageResults = ({ submissions, context }) => {
  if (!submissions || submissions.length === 0) {
    return (
      <p data-testid="submissions-table-fetcher-empty">
        No form submissions found
      </p>
    );
  }

  return (
    <ul
      data-testid="submissions-card"
      className="submissions__list"
      sort-column={1}
    >
      {submissions.map((submission, index) => {
        return (
          <SubmissionCard
            context={context}
            submission={submission}
            key={index}
          />
        );
      })}
    </ul>
  );
};

SubmissionsPageResults.propTypes = {
  submissions: PropTypes.arrayOf(
    PropTypes.shape({
      length: PropTypes.number,
      map: PropTypes.func,
    }),
  ),
  context: PropTypes.string,
};

SubmissionsPageResults.defaultProps = {
  context: null,
};

export default SubmissionsPageResults;
