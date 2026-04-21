import React, { useEffect } from 'react';
import { focusElement } from 'platform/utilities/ui';

import Headline from '../ProfileSectionHeadline';

import AccountSecurityContent from './AccountSecurityContent';

const AccountSecurity = () => {
  useEffect(() => {
    document.title = 'Sign-In Information | Veterans Affairs';
    focusElement('[data-focus-target]');
  }, []);

  return (
    <>
      <Headline>Sign-in information</Headline>
      <AccountSecurityContent />
    </>
  );
};

export default AccountSecurity;
