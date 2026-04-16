import React from 'react';
import { Toggler } from 'platform/utilities/feature-toggles';

const TOGGLE_KEY = Toggler.TOGGLE_NAMES.form1010dEnhancedFlowEnabled;

const AlreadyAppliedAlert = () => (
  <va-alert status="info" class="vads-u-margin-y--4">
    <h2 slot="headline">Have you already applied for CHAMPVA benefits?</h2>
    <Toggler toggleName={TOGGLE_KEY}>
      <Toggler.Enabled>
        <p>
          If we asked you for more information, you can submit supporting
          documents using this form. You can also use it to update your
          information.
        </p>
        <p>
          <va-link-action
            href="#start"
            text="Add or update your information"
            type="secondary"
          />
        </p>
      </Toggler.Enabled>
      <Toggler.Disabled>
        <p>
          Learn more about what you may need to do after you apply. And find out
          what to do if we need more information from you or if you need to
          update your information.
        </p>
      </Toggler.Disabled>
    </Toggler>
    <p>
      <va-link
        href="/resources/what-to-do-after-applying-for-champva-benefits/"
        text="Learn what to do after applying for CHAMPVA benefits"
      />
    </p>
  </va-alert>
);

export default AlreadyAppliedAlert;
