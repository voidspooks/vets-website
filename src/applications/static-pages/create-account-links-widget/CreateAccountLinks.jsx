import React from 'react';
import CreateAccountLink from 'platform/user/authentication/components/CreateAccountLink';
import './create-account-links-widget.scss';

export default function CreateAccountLinks() {
  return (
    <ul className="vads-u-margin-y--3 usa-unstyled-list">
      <li>
        <CreateAccountLink policy="idme" className="create-account-link">
          Create an ID.me account
        </CreateAccountLink>
      </li>
      <li>
        <CreateAccountLink policy="logingov" className="create-account-link">
          Create a Login.gov account
        </CreateAccountLink>
      </li>
    </ul>
  );
}
