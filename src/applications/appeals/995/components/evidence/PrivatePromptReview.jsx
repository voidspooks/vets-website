import React from 'react';
import PropTypes from 'prop-types';
import { summaryContent } from '../../content/evidence/private';
import { EVIDENCE_PRIVATE_PROMPT_URL } from '../../constants';
import { redesignActive } from '../../utils';
import { hasArrayBuilderPrivateEvidence } from '../../utils/form-data-retrieval';

const PrivatePromptReview = ({ data, goToPath }) => {
  if (redesignActive(data) && !hasArrayBuilderPrivateEvidence(data)) {
    return (
      <div className="private-prompt-review vads-u-text-align--left vads-u-border-bottom--1px vads-u-border-top--1px vads-u-border-color--base-light">
        <h4 className="vads-u-margin-top--2p5 vads-u-margin-x--0 vads-u-margin-bottom--0 vads-u-color--base-darker vads-u-font-size--h5 vads-u-padding-right--1 vads-u-padding-bottom--1 vads-u-border-bottom--1px vads-u-border-color--base-light">
          {summaryContent.title}
        </h4>
        <p className="vads-u-margin-bottom--0 vads-u-padding-right--2">
          Do you have any records to add?
        </p>
        <p className="vads-u-margin-y--0 vads-u-padding-right--2">
          <strong>No</strong>
        </p>
        <va-button
          class="vads-u-border-top--1px vads-u-border-color--base-light vads-u-margin-top--1 vads-u-padding-x--0 vads-u-padding-top--1 vads-u-padding-bottom--3"
          data-action="add"
          text="Add a private provider or VA Vet Center"
          name="recordsAddButton"
          onClick={e => {
            e.preventDefault();
            goToPath(`/${EVIDENCE_PRIVATE_PROMPT_URL}`);
          }}
          primary
        />
      </div>
    );
  }

  return null;
};

PrivatePromptReview.propTypes = {
  data: PropTypes.shape(),
  goToPath: PropTypes.func,
};

export default PrivatePromptReview;
