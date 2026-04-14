import React from 'react';

const SubmissionTypeAddtlInfo = () => (
  <va-additional-info
    trigger="What these options mean"
    class="vads-u-margin-bottom--4"
  >
    <div>
      <p className="vads-u-margin-top--0">
        <strong>
          If it’s your first time applying for benefits for yourself or someone
          else
        </strong>
        , it’s a new application.
      </p>
      <p>
        <strong>If you applied and we asked you for more information</strong>,
        it’s an update to an existing application.
      </p>
      <p className="vads-u-margin-bottom--0">
        <strong>
          If you’re already enrolled and need to update information
        </strong>
        , it’s an update to a beneficiary’s enrollment information. This can be
        information like proof of school enrollment, marriage, or divorce.
      </p>
    </div>
  </va-additional-info>
);

export default SubmissionTypeAddtlInfo;
