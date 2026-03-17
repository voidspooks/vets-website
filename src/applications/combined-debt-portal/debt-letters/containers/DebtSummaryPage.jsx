import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VaBreadcrumbs } from '@department-of-veterans-affairs/web-components/react-bindings';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { setPageFocus, APP_TYPES } from '../../combined/utils/helpers';
import DebtCardsList from '../components/DebtCardsList';
import OtherVADebts from '../../combined/components/OtherVADebts';
import useHeaderPageTitle from '../../combined/hooks/useHeaderPageTitle';
import { useDebtCopayProvider } from '../../combined/contexts/DebtCopayContext';
import StatusCard from '../../combined/components/StatusCard';
import ErrorAlert from '../../combined/components/alerts/ErrorAlert';
import { LINK_REGISTRY } from '../const/linkRegistry';

const PageBreadcrumbs = () => {
  const breadcrumbs = [
    { href: '/', label: 'Home' },
    { href: '/manage-va-debt/summary', label: 'Overpayments and copay bills' },
    {
      href: '/manage-va-debt/summary/debt-balances',
      label: 'Overpayment balances',
    },
  ];

  return <VaBreadcrumbs breadcrumbList={breadcrumbs} />;
};

const DownloadSection = () => {
  const { t } = useTranslation();
  return (
    <section>
      <h2
        id="downloadDebtLetters"
        className="vads-u-margin-top--4 vads-u-font-size--h2"
      >
        {t(`shared.downloadLetters.header`)}
      </h2>
      <p className="vads-u-margin-bottom--0 vads-u-font-family--sans">
        {t(`shared.downloadLetters.body`)}
      </p>

      <Link
        to={LINK_REGISTRY.downloadLetters.href}
        className="vads-u-margin-top--1 vads-u-font-family--sans"
        data-testid="download-letters-link"
      >
        {t(LINK_REGISTRY.downloadLetters.textKey)}
      </Link>
    </section>
  );
};

const DebtContent = ({ debtsEmpty }) => {
  return (
    <>
      {debtsEmpty ? (
        <StatusCard
          key={APP_TYPES.DEBT}
          amount={0}
          count={0}
          date={null}
          appType={APP_TYPES.DEBT}
        />
      ) : (
        <DebtCardsList />
      )}
    </>
  );
};

DebtContent.propTypes = {
  debtsEmpty: PropTypes.bool.isRequired,
};

const DebtSummary = () => {
  const {
    debtError,
    isDebtLoading,
    totalCopayCount,
    copayError,
    isCopayLoading,
    debtsEmpty,
    showDebtLetterDownload,
    hasDebtError,
    hasCopayError,
    hasBothError,
  } = useDebtCopayProvider();

  const { t } = useTranslation();
  const title = t('shared.debtSummary.title');
  useHeaderPageTitle(title);

  useEffect(() => {
    setPageFocus('h1');
  }, []);

  if (isDebtLoading || isCopayLoading) {
    return (
      <va-loading-indicator
        label="Loading"
        message="Please wait while we load the application for you."
      />
    );
  }

  return (
    <>
      <PageBreadcrumbs />
      <div
        className="medium-screen:vads-l-col--10 small-desktop-screen:vads-l-col--8"
        data-testid="current-va-debt"
      >
        <h1
          data-testid="summary-page-title"
          className="vads-u-margin-bottom--2"
        >
          {title}
        </h1>
        <p className="va-introtext vads-u-margin-bottom--4">
          {t('shared.debtSummary.body')}
        </p>
        <article className="vads-u-padding-x--0 vads-u-padding-bottom--0">
          {hasBothError ? (
            <ErrorAlert
              appType="both"
              debtError={debtError}
              copayError={copayError}
            />
          ) : (
            <>
              {/* Debt Section */}
              {hasDebtError ? (
                <ErrorAlert
                  appType={APP_TYPES.DEBT}
                  debtError
                  copayError={false}
                />
              ) : (
                <DebtContent debtsEmpty={debtsEmpty} />
              )}

              {/* Copay Section */}
              {hasCopayError ? (
                <ErrorAlert
                  appType={APP_TYPES.COPAY}
                  debtError={false}
                  copayError
                />
              ) : (
                totalCopayCount > 0 && <OtherVADebts module={APP_TYPES.COPAY} />
              )}
            </>
          )}
          {showDebtLetterDownload && <DownloadSection t={t} />}
        </article>
      </div>
    </>
  );
};

export default DebtSummary;
