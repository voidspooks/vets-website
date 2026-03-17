import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  VaBreadcrumbs,
  VaPagination,
} from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { useFeatureToggle } from '~/platform/utilities/feature-toggles/useFeatureToggle';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { setPageFocus, APP_TYPES } from '../../combined/utils/helpers';
import Balances from '../components/Balances';
import OtherVADebts from '../../combined/components/OtherVADebts';
import useHeaderPageTitle from '../../combined/hooks/useHeaderPageTitle';
import { useDebtCopayProvider } from '../../combined/contexts/DebtCopayContext';
import StatusCard from '../../combined/components/StatusCard';
import ErrorAlert from '../../combined/components/alerts/ErrorAlert';
import NotEnrolledAlert from '../../combined/components/alerts/NotEnrolledAlert';

const PageBreadcrumbs = () => {
  const breadcrumbs = [
    { href: '/', label: 'Home' },
    { href: '/manage-va-debt/summary', label: 'Overpayments and copay bills' },
    { href: '/manage-va-debt/summary/copay-balances', label: 'Copay balances' },
  ];
  return <VaBreadcrumbs breadcrumbList={breadcrumbs} />;
};

const Pagination = ({
  data,
  currentPage,
  onPageChange,
  maxRows = 10,
  itemType = 'items',
  onPaginationTextChange,
}) => {
  const getPaginationText = useCallback(
    () => {
      const startItemIndex = (currentPage - 1) * maxRows + 1;
      const endItemIndex = Math.min(currentPage * maxRows, data.length);
      return `Showing ${startItemIndex}-${endItemIndex} of ${
        data.length
      } ${itemType}`;
    },
    [currentPage, data, maxRows, itemType],
  );

  useEffect(
    () => {
      if (onPaginationTextChange) {
        onPaginationTextChange(getPaginationText());
      }
    },
    [
      currentPage,
      data,
      maxRows,
      itemType,
      onPaginationTextChange,
      getPaginationText,
    ],
  );

  const numPages = Math.ceil(data?.length / maxRows);

  if (!data || data.length <= maxRows) {
    return null;
  }

  return (
    <VaPagination
      onPageSelect={e => onPageChange(e.detail.page)}
      page={currentPage}
      pages={numPages}
    />
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  data: PropTypes.array,
  itemType: PropTypes.string,
  maxRows: PropTypes.number,
  onPaginationTextChange: PropTypes.func,
};

const CopayContent = ({
  copaysEmpty,
  paginatedData,
  paginationText,
  shouldShowVHAPaymentHistory,
}) => {
  return copaysEmpty ? (
    <StatusCard
      key={APP_TYPES.COPAY}
      amount={0}
      count={0}
      date={null}
      appType={APP_TYPES.COPAY}
    />
  ) : (
    <>
      <Balances
        statements={paginatedData}
        showVHAPaymentHistory={shouldShowVHAPaymentHistory}
        paginationText={paginationText}
      />
    </>
  );
};

CopayContent.propTypes = {
  copaysEmpty: PropTypes.bool.isRequired,
  shouldShowVHAPaymentHistory: PropTypes.bool.isRequired,
  paginatedData: PropTypes.array,
  paginationText: PropTypes.string,
};

const CopaySummary = () => {
  const {
    totalDebtCount,
    debtError,
    isDebtLoading,
    copayError,
    isCopayLoading,
    copaysEmpty,
    shouldShowVHAPaymentHistory,
    copaysByUniqueFacility,
    isNotEnrolledInHealthCare,
    hasDebtError,
    hasCopayError,
    hasBothError,
  } = useDebtCopayProvider();

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationText, setPaginationText] = useState('');

  const MAX_ROWS = 10;

  const paginatedData = useMemo(
    () => {
      return copaysByUniqueFacility?.slice(
        (currentPage - 1) * MAX_ROWS,
        currentPage * MAX_ROWS,
      );
    },
    [copaysByUniqueFacility, currentPage],
  );

  // feature toggle stuff for VHA payment history MVP
  const { useToggleLoadingValue } = useFeatureToggle();
  const togglesLoading = useToggleLoadingValue();

  const { t } = useTranslation();
  const title = t('shared.copaySummary.title');
  useHeaderPageTitle(title);

  useEffect(() => {
    setPageFocus('h1');
  }, []);

  if (isDebtLoading || isCopayLoading || togglesLoading) {
    return (
      <div className="vads-u-margin--5">
        <va-loading-indicator
          label="Loading"
          message="Please wait while we load the application for you."
          set-focus
        />
      </div>
    );
  }

  // Defining here to avoid nested ternary linting errors - has access to all component variables through closure
  const renderCopaySection = () => {
    if (!isNotEnrolledInHealthCare) {
      return <NotEnrolledAlert />;
    }
    if (hasCopayError) {
      return (
        <ErrorAlert appType={APP_TYPES.COPAY} debtError={false} copayError />
      );
    }
    return (
      <>
        <CopayContent
          copaysEmpty={copaysEmpty}
          paginatedData={paginatedData}
          paginationText={paginationText}
          shouldShowVHAPaymentHistory={shouldShowVHAPaymentHistory}
        />
        <Pagination
          data={copaysByUniqueFacility}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          maxRows={MAX_ROWS}
          itemType="copays"
          onPaginationTextChange={setPaginationText}
        />
      </>
    );
  };

  return (
    <>
      <PageBreadcrumbs />
      <div className="medium-screen:vads-l-col--10 small-desktop-screen:vads-l-col--8">
        <h1 data-testid="summary-page-title">{title}</h1>
        <p className="va-introtext">{t('shared.copaySummary.body')}</p>
        <article className="vads-u-padding-x--0 vads-u-padding-bottom--0">
          {hasBothError ? (
            <ErrorAlert
              appType="both"
              debtError={debtError}
              copayError={copayError}
            />
          ) : (
            <>
              {/* Copay Section */}
              {renderCopaySection()}

              {/* Debt Section */}
              {hasDebtError ? (
                <ErrorAlert
                  appType={APP_TYPES.DEBT}
                  debtError
                  copayError={false}
                />
              ) : (
                totalDebtCount > 0 && <OtherVADebts module={APP_TYPES.DEBT} />
              )}
            </>
          )}
        </article>
      </div>
    </>
  );
};

export default CopaySummary;
