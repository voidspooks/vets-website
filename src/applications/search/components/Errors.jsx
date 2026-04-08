import React from 'react';
import PropTypes from 'prop-types';

const VALIDATION_HEADLINE = 'Your search didn’t go through';

const Errors = ({ userInput }) => {
  let headline = VALIDATION_HEADLINE;
  let errorMessage;

  if (!userInput.trim().length) {
    errorMessage = `Enter a search term that contains letters or numbers to find what you're looking for.`;
  } else if (userInput.length > 255) {
    errorMessage =
      'The search is over the character limit. Shorten the search and try again.';
  } else {
    headline = 'We couldn’t complete your search';
    errorMessage =
      'We’re sorry. Something went wrong in our system. Try again later. Or use one of the other VA search tools on this page.';
  }

  return (
    <div className="vads-u-margin-bottom--1p5">
      {/* this is the alert box for when searches fail due to server issues */}
      <va-alert status="error" role="alert" data-e2e-id="alert-box">
        <h2 slot="headline">{headline}</h2>
        <p>{errorMessage}</p>
      </va-alert>
    </div>
  );
};

Errors.propTypes = {
  userInput: PropTypes.string.isRequired,
};

export default Errors;
