import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as authUtilities from 'platform/user/authentication/utilities';
import { updateStateAndVerifier } from 'platform/utilities/oauth/utilities';
import { SERVICE_PROVIDERS } from '../constants';

// Note: For the `op=signup` param to reach ID.me, vets-api's Sign in Service will need
// to forward it in the authorization redirect it constructs. See ID.me OIDC docs:
// https://docs.id.me/guides/open-id-connect/integration

function signupHandler(loginType, isOAuth) {
  authUtilities.createAndStoreReturnUrl();
  if (isOAuth) {
    updateStateAndVerifier(loginType);
  }
}

export default function CreateAccountLink({
  policy,
  useOAuth = true,
  children,
  externalApplication,
  clientId = 'vaweb',
  className = '',
}) {
  const [href, setHref] = useState('');

  useEffect(
    () => {
      async function generateURL() {
        const url = await authUtilities.signupOrVerify({
          clientId,
          policy,
          isLink: true,
          allowVerification: false,
          useOAuth,
          config: externalApplication,
        });
        setHref(url);
      }
      generateURL();
    },
    [policy, useOAuth, externalApplication, clientId],
  );

  return (
    <a
      href={href}
      className={`vads-c-action-link--blue${className ? ` ${className}` : ''}`}
      data-testid={policy}
      onClick={() => signupHandler(policy, useOAuth)}
    >
      {!children && `Create an account with ${SERVICE_PROVIDERS[policy].label}`}
      {children}
    </a>
  );
}

CreateAccountLink.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  clientId: PropTypes.string,
  externalApplication: PropTypes.string,
  policy: PropTypes.string,
  useOAuth: PropTypes.bool,
};
