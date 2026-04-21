import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom-v5-compat';
import { focusElement } from '@department-of-veterans-affairs/platform-utilities/ui';
import { useFeatureToggle } from '~/platform/utilities/feature-toggles';
import { getIntentsToFile } from '../actions';
import ClaimsBreadcrumbs from '../components/ClaimsBreadcrumbs';
import IntentToFileCard from '../components/IntentToFileCard';
import IntentToFileCardLoadingSkeleton from '../components/IntentToFileCardLoadingSkeleton';
import IntentToFileErrorAlert from '../components/IntentToFileErrorAlert';
import NeedHelp from '../components/NeedHelp';
import { INTENT_TO_FILE_PATH, LINKS } from '../constants';
import { setDocumentTitle } from '../utils/helpers';

const EmptyState = () => (
  <>
    <p
      data-testid="itf-empty-state"
      className="vads-u-margin-top--0 vads-u-margin-bottom--2"
    >
      We don’t have any intents to file on record for you in our system.
    </p>
    <div
      role="presentation"
      className="vads-u-border-top--1px vads-u-border-color--gray-light vads-u-margin-top--2 vads-u-margin-bottom--0"
    />
  </>
);

const IntentToFilePageContent = () => {
  const dispatch = useDispatch();
  const { data: intentsToFile, loading, error } = useSelector(
    state => state.disability.status.intentsToFile,
  );

  useEffect(
    () => {
      setDocumentTitle('Your Intents To File');
      focusElement('h1');
      dispatch(getIntentsToFile());
    },
    [dispatch],
  );

  return (
    <>
      <h1 className="vads-u-margin-bottom--2">Your intents to file</h1>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--4">
        If you have active intents to file a claim for VA benefits, you can
        review them here.
      </p>

      <h2 className="vads-u-margin-top--0 vads-u-margin-bottom--2">
        Intents to file on record
      </h2>
      <IntentToFileCardLoadingSkeleton isLoading={loading} />
      {!loading && error && <IntentToFileErrorAlert />}
      {!loading && !error && intentsToFile.length === 0 && <EmptyState />}
      {!loading &&
        !error &&
        intentsToFile.length > 0 && (
          <>
            {/* Adding a `role="list"` to `ul` with `list-style: none` to work around
              a problem with Safari not treating the `ul` as a list. */}
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
            <ul role="list" className="remove-bullets">
              {intentsToFile.map(itf => (
                <li key={itf.id}>
                  <IntentToFileCard itf={itf} />
                </li>
              ))}
            </ul>
          </>
        )}

      <h2 className="vads-u-margin-top--4 vads-u-margin-bottom--1p5">
        Start a new intent to file
      </h2>
      <h3 className="vads-u-font-family--sans vads-u-font-size--md vads-u-margin-top--0">
        Option 1: Start a benefits claim online
      </h3>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--1">
        When you start a claim or application for any of these benefits online,
        we’ll automatically create an intent to file for you:
      </p>
      {/* Adding a `role="list"` to `ul` with `list-style: none` to work around
          a problem with Safari not treating the `ul` as a list. */}
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ul className="vads-u-margin-top--0 vads-u-margin-bottom--4" role="list">
        <li>
          <va-link
            href={LINKS.disabilityCompensationClaimIntro}
            text="Start a disability compensation claim online"
          />
        </li>
        <li>
          <va-link
            href={LINKS.supplementalClaimIntro}
            text="Start a Supplemental Claim for disability compensation online"
          />
        </li>
        <li>
          <va-link
            href={LINKS.veteransPensionOnlineIntro}
            text="Start a Veterans Pension application online"
          />
        </li>
      </ul>
      <h3 className="vads-u-font-family--sans vads-u-font-size--md vads-u-margin-top--0">
        Option 2: Submit an intent to file form
      </h3>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--2">
        For Dependency and Indemnity Compensation (DIC) benefits, you can submit
        a separate form to let us know that you intend to file a claim (VA Form
        21-0966). You can also use this form for disability compensation and
        Veterans Pension benefits.
      </p>
      <p className="vads-u-margin-bottom--1">
        <va-link
          href={LINKS.intentToFileForm0966}
          text="Submit an intent to file online"
        />
      </p>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--0p5">
        If you have an accredited representative, they may also create an intent
        to file for you.
      </p>

      <h2 className="vads-u-margin-top--4 vads-u-margin-bottom--1p5">
        Why can’t I find my intent to file?
      </h2>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--4">
        An intent to file expires 1 year after it’s recorded. If you think you
        have an active intent to file that isn’t available here, call us at{' '}
        <va-telephone contact="8008271000" /> (
        <va-telephone contact="711" tty="true" />
        ).
      </p>

      <h2 className="vads-u-margin-top--4 vads-u-margin-bottom--1p5">
        What is an intent to file?
      </h2>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--0p5">
        An intent to file is a record in our system. It lets us know that you
        plan to submit a claim for VA benefits. And it sets a potential start
        date (or effective date) for your benefits.
      </p>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--4">
        <va-link
          href={LINKS.intentToFileAboutClaim}
          text="Learn more about an intent to file a claim"
          active
        />
      </p>

      <NeedHelp />
    </>
  );
};

export const IntentToFilePage = () => {
  const { TOGGLE_NAMES, useToggleValue } = useFeatureToggle();
  const cstIntentsToFileEnabled = useToggleValue(TOGGLE_NAMES.cstIntentsToFile);

  if (!cstIntentsToFileEnabled) {
    return <Navigate to="/your-claims/" replace />;
  }

  const crumb = {
    href: `../${INTENT_TO_FILE_PATH}`,
    label: 'Your intents to file',
    isRouterLink: true,
  };

  return (
    <article className="row vads-u-margin-bottom--5">
      <div className="usa-width-two-thirds medium-8 columns">
        <ClaimsBreadcrumbs crumbs={[crumb]} />
        <IntentToFilePageContent />
      </div>
    </article>
  );
};

export default IntentToFilePage;
