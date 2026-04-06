import React from 'react';
import FileUploadDescription from './FileUploadDescription';

const SchoolEnrollmentProofDescription = () => (
  <>
    <p>
      <strong>If the applicant is already enrolled in school</strong>
    </p>
    <p>
      Ask the school for a letter on their letterhead that includes this
      information:
    </p>
    <ul>
      <li>
        The applicant’s first and last name, <strong>and</strong>
      </li>
      <li>
        Last 4 digits of the applicant’s Social Security number,{' '}
        <strong>and</strong>
      </li>
      <li>
        Start and end dates for each semester or enrollment term,{' '}
        <strong>and</strong>
      </li>
      <li>
        Enrollment status (full-time or part-time), <strong>and</strong>
      </li>
      <li>
        Expected graduation date, <strong>and</strong>
      </li>
      <li>
        Signature and title of a school official, such as director or principal
      </li>
    </ul>
    <p>
      <strong>If the applicant is planning to enroll</strong>
    </p>
    <p>Submit a copy of the applicant’s acceptance letter from the school.</p>
    <FileUploadDescription />
  </>
);

export default SchoolEnrollmentProofDescription;
