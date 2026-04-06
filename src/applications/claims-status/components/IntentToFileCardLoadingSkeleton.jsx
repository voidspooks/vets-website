import React from 'react';
import PropTypes from 'prop-types';

import LoadingSkeleton from './LoadingSkeleton';

export default function IntentToFileCardLoadingSkeleton({ isLoading = true }) {
  return (
    <LoadingSkeleton
      id="itf-card"
      isLoading={isLoading}
      srLabel="Loading your intents to file…"
      srLoadedLabel="Intents to file have loaded"
    >
      <LoadingSkeleton.Row height="1.5rem" width="14rem" marginBottom="1rem" />
      <LoadingSkeleton.Row width="18rem" marginBottom="0.5rem" />
      <LoadingSkeleton.Row width="22rem" />
      <LoadingSkeleton.Row width="16rem" marginBottom="1rem" />
      <LoadingSkeleton.Row width="12rem" />
    </LoadingSkeleton>
  );
}

IntentToFileCardLoadingSkeleton.propTypes = {
  isLoading: PropTypes.bool,
};
