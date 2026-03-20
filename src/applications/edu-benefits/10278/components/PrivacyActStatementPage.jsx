import React, { useEffect } from 'react';
import { focusElement, scrollToTop } from 'platform/utilities/ui';
import PrivacyActStatement from './PrivacyActStatement';

const PrivacyActStatementPage = () => {
  useEffect(() => {
    scrollToTop();
    focusElement('h1');
  }, []);

  return (
    <div className="form-22-10278-container row vads-u-padding-x--2 desktop:vads-u-padding-x--0 vads-u-padding-y--9">
      <div className="vads-l-col--12 medium-screen:vads-l-col--8 vads-u-margin-bottom--4">
        <h1>Privacy Act Statement</h1>
        <PrivacyActStatement />
      </div>
    </div>
  );
};

PrivacyActStatementPage.propTypes = {};

export default PrivacyActStatementPage;
