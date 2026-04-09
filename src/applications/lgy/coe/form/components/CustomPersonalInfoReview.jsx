import React from 'react';
import { PersonalInformationReview } from 'platform/forms-system/src/js/components/PersonalInformation/PersonalInformationReview';

const CustomPersonalInfoReview = props => (
  <PersonalInformationReview
    {...props}
    config={{
      name: { show: false },
      ssn: { show: true },
      dateOfBirth: { show: true },
    }}
    dataAdapter={{
      ssnPath: 'veteranSsnLastFour',
    }}
    title="Personal information"
  />
);

export default CustomPersonalInfoReview;
