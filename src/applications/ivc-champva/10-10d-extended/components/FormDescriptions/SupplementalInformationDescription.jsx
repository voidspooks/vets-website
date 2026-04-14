import PropTypes from 'prop-types';
import React from 'react';
import { APP_URLS } from '../../utils/appUrls';

const ohiAlert = (
  <va-alert status="info" class="vads-u-margin-bottom--4">
    <h2 slot="headline" className="vads-u-font-size--h3">
      You’ll need to submit another form
    </h2>
    <div>
      <p className="vads-u-margin-top--0">
        Since you need to update your other health insurance information, you’ll
        need to use another form.
      </p>
      <va-link
        href={APP_URLS.ohi}
        text="Submit other health insurance information"
        external
      />
    </div>
  </va-alert>
);

const SupplementalInformationDescription = ({ formData }) => (
  <>
    {formData['view:hasOhiToUpdate'] && ohiAlert}
    <p>
      Now we’ll ask you a few questions to make sure we update the CHAMPVA
      application or benefits for the correct person.
    </p>
    <p>
      This could be the applicant who needs to add requested documents to their
      existing CHAMPVA application. Or the beneficiary who needs to update their
      documents to continue their CHAMPVA enrollment.
    </p>
    <p>
      After we confirm some information, you can upload supporting documents.
    </p>
    <p>This could include any of these common documents:</p>
    <ul>
      <li>School enrollment certification letter</li>
      <li>Marriage certificate or certificate of civil union</li>
      <li>Divorce decree</li>
      <li>Court-ordered adoption papers</li>
      <li>Birth certificates of dependents</li>
    </ul>
    <p>
      <strong>Note:</strong> If this is your first time applying for CHAMPVA
      benefits, go back to the start of this form and select{' '}
      <strong>A new application</strong>.
    </p>
  </>
);

SupplementalInformationDescription.propTypes = {
  formData: PropTypes.shape({
    'view:hasOhiToUpdate': PropTypes.bool,
  }),
};

export default SupplementalInformationDescription;
