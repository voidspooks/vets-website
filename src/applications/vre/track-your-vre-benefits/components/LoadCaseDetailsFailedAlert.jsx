import React from 'react';

export default function LoadCaseDetailsFailedAlert() {
  return (
    <div className="vads-u-margin-y--3">
      <va-alert
        close-btn-aria-label="Close notification"
        status="error"
        visible
      >
        <h2 slot="headline">We can't load the Case Progress right now</h2>
        <p>
          Something went wrong. If the issue persists, contact the VA benefits
          hotline.
        </p>
      </va-alert>
    </div>
  );
}
