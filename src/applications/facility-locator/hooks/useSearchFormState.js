import { useCallback, useRef, useState } from 'react';
import {
  createFormStateFromQuery,
  validateForm,
} from '../reducers/searchQuery';
import { LocationType } from '../constants';

/** Manages draft form state before Redux commit (dual-state pattern). */
const useSearchFormState = currentQuery => {
  const [selectedServiceType, setSelectedServiceType] = useState(null);

  const [draftFormState, setDraftFormState] = useState(() =>
    createFormStateFromQuery(currentQuery),
  );

  const submitErrorsRef = useRef({});

  const setSubmitErrors = useCallback(errors => {
    submitErrorsRef.current = errors;
  }, []);

  const clearSubmitErrors = useCallback(() => {
    submitErrorsRef.current = {};
  }, []);

  const updateDraftState = useCallback(updater => {
    setDraftFormState(prev => {
      const updates =
        typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      const flags = validateForm(prev, updates);

      const submitErrors = submitErrorsRef.current;
      if (submitErrors.locationChanged) {
        flags.locationChanged = true;
      }
      if (submitErrors.facilityTypeChanged) {
        flags.facilityTypeChanged = true;
      }
      if (
        submitErrors.serviceTypeChanged &&
        updates.facilityType === LocationType.CC_PROVIDER
      ) {
        flags.serviceTypeChanged = true;
      }

      if (
        prev.facilityType !== updates.facilityType &&
        prev.facilityType === LocationType.CC_PROVIDER
      ) {
        delete submitErrors.serviceTypeChanged;
      }

      // Expose submit error state directly so components can show
      // persistent errors until resubmit (VACMS-20271).
      const submitErrorFlags = {
        submitErrorLocation: !!submitErrors.locationChanged,
        submitErrorFacilityType: !!submitErrors.facilityTypeChanged,
        submitErrorServiceType: !!(
          submitErrors.serviceTypeChanged &&
          updates.facilityType === LocationType.CC_PROVIDER
        ),
      };

      return { ...updates, ...flags, ...submitErrorFlags };
    });
  }, []);

  const handleFacilityTypeChange = useCallback(
    e => {
      updateDraftState(prev => ({
        ...prev,
        facilityType: e.target.value,
        serviceType: null,
        vamcServiceDisplay: null,
      }));
    },
    [updateDraftState],
  );

  const handleServiceTypeChange = useCallback(
    ({ target, selectedItem }) => {
      setSelectedServiceType(selectedItem);
      const option = target.value.trim();
      const serviceType = option === 'All' ? null : option;
      updateDraftState({ serviceType });
    },
    [updateDraftState],
  );

  return {
    draftFormState,
    setDraftFormState,
    updateDraftState,
    handleFacilityTypeChange,
    handleServiceTypeChange,
    selectedServiceType,
    setSelectedServiceType,
    setSubmitErrors,
    clearSubmitErrors,
  };
};

export default useSearchFormState;
