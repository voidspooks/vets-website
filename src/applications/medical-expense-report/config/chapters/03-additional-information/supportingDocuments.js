import React from 'react';
import { titleUI } from 'platform/forms-system/src/js/web-component-patterns';

const SupportingDocumentsContent = (
  <>
    <p>
      Next we’ll ask you to submit evidence (supporting documents) for your
      expenses. If you upload all of this information online now, you may be
      able to get a faster decision on your claim.
    </p>

    <p>
      <span className="vads-u-font-weight--bold">
        If you have residential care facility or in-home care attendant
        expenses,
      </span>{' '}
      you may need to submit 1 of these supporting documents:
    </p>

    <ul>
      <li>
        Worksheet for a Residential Care, Adult Daycare, or Similar Facility
        from the PDF version of VA Form 21P-8416
        <span className="vads-u-display--block vads-u-margin-bottom--2">
          <va-link
            href="https://www.va.gov/find-forms/about-form-21p-8416/"
            text="Get VA Form 21P-8416 to download"
            external
          />
        </span>
      </li>
      <li>
        Worksheet for In-Home Attendant from the PDF version of VA Form 21P-8416
        <span className="vads-u-display--block vads-u-margin-bottom--2">
          <va-link
            href="https://www.va.gov/find-forms/about-form-21p-8416/"
            text="Get VA Form 21P-8416 to download"
            external
          />
        </span>
      </li>
    </ul>

    <p>
      <span className="vads-u-font-weight--bold">
        If you have nursing home expenses,
      </span>{' '}
      you may need to submit 1 of these supporting documents:
    </p>

    <ul>
      <li>
        Request for Nursing Home Information in Connection with Claim for Aid
        and Attendance (VA Form 21-0779)
        <span className="vads-u-display--block vads-u-margin-bottom--2">
          <va-link
            href="https://www.va.gov/supporting-forms-for-claims/submit-nursing-home-information-form-21-0779"
            text="Submit nursing home information in connection with claim for Aid and Attendance"
            external
          />
        </span>
        <span className="vads-u-display--block vads-u-margin-bottom--2">
          <va-link
            href="https://www.va.gov/find-forms/about-form-21-0779/"
            text="Get VA Form 21-0779 to download"
            external
          />
        </span>
      </li>
      <li>
        Examination for Housebound Status or Permanent Need for Regular Aid and
        Attendance form (VA Form 21-2680)
        <span className="vads-u-display--block vads-u-margin-bottom--2">
          <va-link
            href="https://www.va.gov/pension/aid-attendance-housebound/apply-form-21-2680"
            text="Apply for Aid and Attendance benefits or Housebound allowance"
            external
          />
        </span>
        <span className="vads-u-display--block vads-u-margin-bottom--2">
          <va-link
            href="https://www.va.gov/find-forms/about-form-21-2680/"
            text="Get VA Form 21-2680 to download"
            external
          />
        </span>
      </li>
    </ul>
  </>
);

/** @type {PageSchema} */
export default {
  title: 'Supporting documents',
  path: 'expenses/additional-information/supporting-documents',
  uiSchema: {
    ...titleUI('Supporting documents'),
    'view:supportingDocuments': {
      'ui:description': SupportingDocumentsContent,
    },
  },
  schema: {
    type: 'object',
    properties: {
      'view:supportingDocuments': {
        type: 'object',
        properties: {},
      },
    },
  },
};
