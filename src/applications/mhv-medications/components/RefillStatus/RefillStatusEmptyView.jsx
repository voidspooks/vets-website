import React from 'react';
import ProcessList from '../shared/ProcessList';
import { refillProcessStepGuideV2 } from '../../util/processListData';

const RefillStatusEmptyView = () => (
  <>
    <div className="vads-u-padding-y--3 vads-u-border-bottom--1px vads-u-border-color--gray-light">
      <h2 className="vads-u-font-size--h3 vads-u-margin-y--0">
        You don’t have any refill requests in progress
      </h2>
      <p>
        You don’t have any prescription refills requested, in progress, or being
        shipped. If you have questions about a refill, contact your care team.
      </p>
    </div>
    <ProcessList stepGuideProps={refillProcessStepGuideV2} />
  </>
);

export default RefillStatusEmptyView;
