import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import {
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom-v5-compat';
import PropTypes from 'prop-types';
import { useFeatureToggle } from '~/platform/utilities/feature-toggles';

import {
  clearClaim as clearClaimAction,
  getClaim as getClaimAction,
} from '../actions';

export function ClaimPage({ clearClaim, getClaim }) {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const {
    TOGGLE_NAMES,
    useToggleValue,
    useToggleLoadingValue,
  } = useFeatureToggle();
  const cstMultiClaimProviderEnabled = useToggleValue(
    TOGGLE_NAMES.cstMultiClaimProvider,
  );
  const isLoadingToggles = useToggleLoadingValue();

  // Capture volatile values in refs so the effect below can read the latest
  // values without listing them as deps (which would cause re-fetches on every
  // navigation param change). Refs are stable objects — their .current is not
  // tracked by react-hooks/exhaustive-deps.
  const paramsRef = useRef(params);
  const searchParamsRef = useRef(searchParams);
  const providerEnabledRef = useRef(cstMultiClaimProviderEnabled);
  paramsRef.current = params;
  searchParamsRef.current = searchParams;
  providerEnabledRef.current = cstMultiClaimProviderEnabled;

  // Reset claim and loading state on dismount unconditionally so stale state
  // is never left in the store even when toggles were still loading on mount.
  useEffect(() => () => clearClaim(), [clearClaim]);

  useEffect(
    () => {
      // Wait for feature toggles to finish loading before determining the
      // provider. Without this guard, a back-navigation that triggers a full app
      // reload may call getClaim before cstMultiClaimProviderEnabled resolves,
      // causing the Lighthouse endpoint to be used instead of the correct
      // CHAMPVA provider endpoint and leaking Lighthouse components into the
      // CHAMPVA files view.
      if (isLoadingToggles !== false) return;

      const provider = providerEnabledRef.current
        ? searchParamsRef.current.get('type')
        : null;
      getClaim(paramsRef.current.id, navigate, provider);
    },
    [isLoadingToggles, getClaim, navigate],
  );

  return <Outlet />;
}

const mapDispatchToProps = {
  getClaim: getClaimAction,
  clearClaim: clearClaimAction,
};

export default connect(
  null,
  mapDispatchToProps,
)(ClaimPage);

ClaimPage.propTypes = {
  clearClaim: PropTypes.func,
  getClaim: PropTypes.func,
};
