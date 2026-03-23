import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import content from '../../locales/en/content.json';
import { VaRadio, VaRadioOption } from '../../utils/imports';
import { titleWithNameUI, titleWithRoleUI } from '../../utils/titles';
import { replaceStrValues } from '../../utils/helpers';

// declare reusable constants
export const FIELD_NAME = 'view:sharesAddressWith';
export const NOT_SHARED = 'na';

// declare static content
export const APPLICANT_SINGULAR = content['noun--applicant'];
const ERROR_MSG_REQUIRED = content['validation--required'];
export const LABEL_TEXT = content['address-selection--label-text'];
export const OPTION_NO_LABEL = content['address-selection--no-option'];
export const OPTION_YES_LABEL = content['address-selection--yes-option'];
const TITLE_TEXT = content['address-selection--page-title'];
const DESC_TEXT = content['address-selection--page-description'];
const UPDATE_BTN_TEXT = content['button--update-page'];
const UPDATE_BTN_ARIA_LABEL = content['address-selection--update-aria-label'];
export const VETERAN_SINGULAR = content['noun--veteran'];

// convert address objects to formatted strings
export const formatAddress = ({ street, street2, city, state, country } = {}) =>
  [street, street2, [city, state].filter(Boolean).join(', '), country]
    .filter(Boolean)
    .join(', ');

// build unique radio options from form data
const buildAddressOptions = ({
  certifierAddress,
  sponsorAddress,
  applicants,
  excludeIndex,
}) => {
  const addUnique = (map, addr) => {
    const formatted = formatAddress(addr);
    if (formatted && !map.has(formatted)) {
      map.set(formatted, { label: formatted, val: JSON.stringify(addr) });
    }
  };
  const m = new Map();
  addUnique(m, certifierAddress);
  addUnique(m, sponsorAddress);
  (applicants ?? []).forEach((a, i) => {
    if (i !== excludeIndex) addUnique(m, a?.applicantAddress);
  });

  return [...m.values()];
};

// declare a safety helper for parsing JSON string
export const safeParse = str => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

// apply radio option selection to correct data object
const applyOptionSelection = (src, nextValue, dataKey) => {
  const clonedSrc = cloneDeep(src);
  const base = { ...clonedSrc, [FIELD_NAME]: nextValue };

  if (nextValue === NOT_SHARED) {
    delete base[dataKey];
    return base;
  }

  const parsed = safeParse(nextValue);
  return parsed ? { ...base, [dataKey]: parsed } : base;
};

const AddressSelectionPage = props => {
  const {
    NavButtons,
    contentAfterButtons,
    contentBeforeButtons,
    data,
    dataKey,
    fullData,
    goForward,
    pagePerItemIndex,
    setFormData,
    updatePage,
    onChange,
    onReviewPage,
  } = props;

  // `fullData` is populated when inside the ArrayBuilder flow
  const fullOrItemData = fullData ?? data;

  // `pagePerItemIndex` is a string, we need to convert it to a number
  const itemIndex = useMemo(
    () => {
      const n = Number(pagePerItemIndex);
      return Number.isFinite(n) && n >= 0 ? n : null;
    },
    [pagePerItemIndex],
  );
  const isArrayMode = itemIndex !== null;

  // data can be the root dataset or from an array item
  const localData = useMemo(
    () =>
      isArrayMode && data.applicants
        ? data.applicants?.[itemIndex] ?? {}
        : data,
    [data, isArrayMode, itemIndex],
  );
  const currentValue = localData[FIELD_NAME];

  const [error, setError] = useState(undefined);

  const handleChange = useCallback(
    e => {
      const nextValue = e?.detail?.value;
      setError(undefined);

      const dataToUpdate = isArrayMode ? localData : fullOrItemData;
      const nextData = applyOptionSelection(dataToUpdate, nextValue, dataKey);
      const onUpdate = onReviewPage ? setFormData : onChange;
      onUpdate(nextData);
    },
    [
      dataKey,
      fullOrItemData,
      isArrayMode,
      localData,
      onChange,
      onReviewPage,
      setFormData,
    ],
  );

  const handleSubmit = useCallback(
    e => {
      e.preventDefault();
      if (!currentValue) return setError(ERROR_MSG_REQUIRED);
      return goForward({ formData: data });
    },
    [currentValue, data, goForward],
  );

  const addressOpts = useMemo(
    () =>
      buildAddressOptions({
        certifierAddress: fullOrItemData.certifierAddress,
        sponsorAddress: fullOrItemData.sponsorAddress,
        applicants: fullOrItemData.applicants,
        excludeIndex: isArrayMode ? itemIndex : -1,
      }),
    [
      fullOrItemData.certifierAddress,
      fullOrItemData.sponsorAddress,
      fullOrItemData.applicants,
      isArrayMode,
      itemIndex,
    ],
  );

  const vaRadioOpts = useMemo(
    () => (
      <>
        <VaRadioOption
          key="not_shared"
          name={`root_${FIELD_NAME}`}
          label={OPTION_NO_LABEL}
          value={NOT_SHARED}
          checked={currentValue === NOT_SHARED}
        />
        {addressOpts.map(({ label, val }) => (
          <VaRadioOption
            key={label}
            name={`root_${FIELD_NAME}`}
            label={`${OPTION_YES_LABEL} ${label}`}
            value={val}
            checked={val === currentValue}
            data-dd-privacy="hidden"
          />
        ))}
      </>
    ),
    [addressOpts, currentValue],
  );

  const pageTitle = useMemo(
    () => {
      const titleFn = isArrayMode ? titleWithNameUI : titleWithRoleUI;
      return titleFn(TITLE_TEXT, DESC_TEXT, {
        arrayBuilder: isArrayMode,
        roleKey: isArrayMode ? 'view:certifierRole' : 'certifierRole',
        other: isArrayMode ? APPLICANT_SINGULAR : VETERAN_SINGULAR,
      })['ui:title']({ formData: localData });
    },
    [isArrayMode, localData],
  );

  const inputLabel = useMemo(
    () => {
      const party = isArrayMode ? APPLICANT_SINGULAR : VETERAN_SINGULAR;
      return replaceStrValues(LABEL_TEXT, party);
    },
    [isArrayMode],
  );

  return (
    <form className="rjsf" onSubmit={handleSubmit}>
      <fieldset className="vads-u-margin-bottom--2">
        <legend className="schemaform-block-title">{pageTitle}</legend>

        <VaRadio
          id={`root_${FIELD_NAME}`}
          name={`root_${FIELD_NAME}`}
          label={inputLabel}
          onVaValueChange={handleChange}
          error={error}
          required
        >
          {vaRadioOpts}
        </VaRadio>
      </fieldset>

      {!onReviewPage ? (
        <>
          {contentBeforeButtons}
          <NavButtons submitToContinue />
          {contentAfterButtons}
        </>
      ) : (
        <va-button
          onClick={updatePage}
          text={UPDATE_BTN_TEXT}
          label={UPDATE_BTN_ARIA_LABEL}
          class="vads-u-margin-bottom--4"
        />
      )}
    </form>
  );
};

AddressSelectionPage.propTypes = {
  NavButtons: PropTypes.func,
  contentAfterButtons: PropTypes.element,
  contentBeforeButtons: PropTypes.element,
  data: PropTypes.object,
  dataKey: PropTypes.string,
  fullData: PropTypes.object,
  goForward: PropTypes.func,
  pagePerItemIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  setFormData: PropTypes.func,
  updatePage: PropTypes.func,
  onChange: PropTypes.func,
  onReviewPage: PropTypes.bool,
};

export default AddressSelectionPage;
