import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  selectIsCernerPatient,
  selectIsCernerOnlyPatient,
} from 'platform/user/cerner-dsot/selectors';
import { VaTelephone } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { CONTACTS } from '@department-of-veterans-affairs/component-library/contacts';
import EmergencyNote from '../components/EmergencyNote';
import RouterLink from '../components/shared/RouterLink';
import { Paths, PageTitles, ExternalLinks } from '../util/constants';

const CareTeamHelp = () => {
  const isCerner = useSelector(selectIsCernerPatient);
  const isCernerOnly = useSelector(selectIsCernerOnlyPatient);
  const history = useHistory();
  // Set page title
  useEffect(() => {
    document.title = PageTitles.CARE_TEAM_HELP_TITLE_TAG;
  }, []);

  const renderReasons = () => (
    <>
      <li>
        They don’t use messages, <strong>or</strong>
      </li>
      <li>
        They’re part of a different VA health care system, <strong>or</strong>
      </li>
      {!isCerner && (
        <>
          <li>
            You removed them from your contact list, <strong>or</strong>
          </li>
          <li>Your account isn’t connected to them</li>
        </>
      )}

      {isCerner &&
      !isCernerOnly && ( // hybrid users
          <>
            <li>
              You removed them from your contact list, <strong>or</strong>
            </li>
            <li>
              Your account isn’t connected to them, <strong>or</strong>
            </li>
          </>
        )}

      {isCerner && (
        <>
          <li>
            Their name may appear different
            <div className="vads-u-margin-top--0p5">
              <va-link
                href={ExternalLinks.CARE_TEAM_NAME_GLOSSARY}
                text="Review our messages health care team names glossary"
                data-testid="name-change-link"
              />
            </div>
          </li>
        </>
      )}
    </>
  );

  const renderOtherOptions = () => {
    return (
      <>
        <p>If you can’t find your care team, try these other options:</p>

        <ul>
          <li>
            Select a different VA health care system, <strong>or</strong>
          </li>
          <li>
            Try entering your type of care, provider name, or any part of your
            care team name
          </li>
        </ul>
      </>
    );
  };

  const renderContactListSection = () => {
    // VistA or Hybrid users see the contact list link
    if (!isCernerOnly) {
      return (
        <>
          <p>
            You can send messages to new or previously removed care teams by
            adding them to your contact list.
          </p>

          <RouterLink
            href={Paths.CONTACT_LIST}
            text="Update your contact list"
            data-testid="update-contact-list-link"
          />
        </>
      );
    }
    // Oracle-only users don't see a contact list section
    return null;
  };

  const renderContent = () => (
    <div>
      <h1 className="vads-u-margin-bottom--2">Can’t find your care team?</h1>
      <EmergencyNote dropDownFlag />

      <p>You may not find your care team for these reasons:</p>

      <ul>{renderReasons()}</ul>

      {renderOtherOptions()}

      {renderContactListSection()}

      <p>
        If you need more help, call us at{' '}
        <VaTelephone contact={CONTACTS.MY_HEALTHEVET} /> (
        <VaTelephone contact={CONTACTS['711']} tty />
        ). We’re here Monday through Friday, 8:00 a.m. to 8:00 p.m. ET.
      </p>

      <va-button back full-width onClick={() => history.goBack()} text="Back" />
    </div>
  );

  return (
    <div className="vads-l-grid-container care-team-help-container">
      {renderContent()}
    </div>
  );
};

export default CareTeamHelp;
