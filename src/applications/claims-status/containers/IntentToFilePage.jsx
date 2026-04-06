import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom-v5-compat';
import { VaLink } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { focusElement } from '@department-of-veterans-affairs/platform-utilities/ui';
import { useFeatureToggle } from '~/platform/utilities/feature-toggles';
import { getIntentsToFile } from '../actions';
import ClaimsBreadcrumbs from '../components/ClaimsBreadcrumbs';
import IntentToFileCard from '../components/IntentToFileCard';
import IntentToFileCardLoadingSkeleton from '../components/IntentToFileCardLoadingSkeleton';
import IntentToFileErrorAlert from '../components/IntentToFileErrorAlert';
import NeedHelp from '../components/NeedHelp';
import { LINKS } from '../constants';
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
        If you have active intents to file (ITF) a claim for VA benefits, you
        can review them here.
      </p>

      <h2 className="vads-u-margin-bottom--2">Intents to file on record</h2>
      <IntentToFileCardLoadingSkeleton isLoading={loading} />
      {!loading && error && <IntentToFileErrorAlert />}
      {!loading && !error && intentsToFile.length === 0 && <EmptyState />}
      {!loading &&
        !error &&
        intentsToFile.map(itf => <IntentToFileCard key={itf.id} itf={itf} />)}

      <h2 className="vads-u-margin-top--4 vads-u-margin-bottom--1p5">
        Start a new intent to file
      </h2>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--1p5">
        You can create an intent to file if you plan to file a claim for these
        types of benefits:
      </p>
      <ul className="vads-u-margin-top--0 vads-u-margin-bottom--1p5">
        <li>
          <strong>Disability compensation.</strong> If you start a claim or a
          Supplemental Claim online using VA Form 21-526EZ, we’ll automatically
          create an intent to file for you.{' '}
          <VaLink
            href={LINKS.disabilityCompensationClaimIntro}
            text="Start a claim for disability compensation online"
          />
        </li>
        <li>
          <strong>Veterans pension.</strong> If you start a claim online using
          VA Form 21P-527EZ, we’ll automatically create an intent to file for
          you.{' '}
          <VaLink
            href={LINKS.veteransPensionOnlineIntro}
            text="Start an application for Veterans Pension online"
          />
        </li>
        <li>
          <strong>Dependency and Indemnity Compensation (DIC).</strong>
          You can submit a separate form to let us know that you intend to file
          for DIC benefits.{' '}
          <VaLink
            href={LINKS.intentToFileForm0966}
            text="Submit an intent to file online"
          />
        </li>
      </ul>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--2">
        For any of these benefits, you can submit a separate form to let us know
        that you intend to file a claim.
      </p>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--0p5">
        <VaLink
          href={LINKS.intentToFileForm0966}
          text="Submit an intent to file (VA Form 21-0966) online"
        />
      </p>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--4">
        If you have an accredited representative, they may also create an intent
        to file for you.
      </p>

      <h2 className="vads-u-margin-top--0 vads-u-margin-bottom--1p5">
        Why can’t I find my intent to file?
      </h2>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--4">
        An intent to file expires 1 year after it’s recorded. If you think you
        have an active intent to file that isn’t available here, call us at{' '}
        <va-telephone contact="8008271000" /> (
        <va-telephone contact="711" tty="true" />
        ).
      </p>

      <h2 className="vads-u-margin-top--0 vads-u-margin-bottom--1p5">
        What is an intent to file?
      </h2>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--0p5">
        An intent to file is a record in our system. It lets us know that you
        plan to submit a claim for VA benefits. And it sets a potential start
        date (or effective date) for your benefits.
      </p>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--4">
        <VaLink
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
    href: '../your-claims/intent-to-file',
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
