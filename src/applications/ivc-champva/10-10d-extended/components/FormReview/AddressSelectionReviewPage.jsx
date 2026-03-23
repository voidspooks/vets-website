import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  APPLICANT_SINGULAR,
  FIELD_NAME,
  formatAddress,
  LABEL_TEXT,
  NOT_SHARED,
  OPTION_YES_LABEL,
  safeParse,
  VETERAN_SINGULAR,
} from '../FormPages/AddressSelectionPage';
import content from '../../locales/en/content.json';
import { replaceStrValues } from '../../utils/helpers';

// declare static content
const EDIT_BTN_TEXT = content['button--edit'];
const REVIEW_OPTION_NO = content['review--no-option'];

// parse the stored data value in to human-friendly text
export const formatDataValue = (storedValue, { withPrefix = true } = {}) => {
  if (!storedValue) return '';
  if (storedValue === NOT_SHARED) return REVIEW_OPTION_NO;

  const parsed = safeParse(storedValue);
  const addr = parsed ? formatAddress(parsed) : String(storedValue);
  return withPrefix ? `${OPTION_YES_LABEL} ${addr}` : addr;
};

// ensure we have the correct data whether in array mode or not
export const getScopedData = (data, pagePerItemIndex) => {
  const n = Number(pagePerItemIndex);
  const isArrayMode = Number.isFinite(n) && n >= 0;
  if (isArrayMode && data?.applicants) return data.applicants?.[n] ?? {};
  return data ?? {};
};

const AddressSelectionReviewPage = props => {
  const { data, editPage, pagePerItemIndex, title } = props;

  const isArrayMode = useMemo(
    () => {
      const n = Number(pagePerItemIndex);
      return Number.isFinite(n) && n >= 0;
    },
    [pagePerItemIndex],
  );

  const localData = useMemo(() => getScopedData(data, pagePerItemIndex), [
    data,
    pagePerItemIndex,
  ]);

  const inputLabel = useMemo(
    () => {
      const party = isArrayMode ? APPLICANT_SINGULAR : VETERAN_SINGULAR;
      return replaceStrValues(LABEL_TEXT, party);
    },
    [isArrayMode],
  );

  const valueText = useMemo(() => formatDataValue(localData?.[FIELD_NAME]), [
    localData,
  ]);

  return (
    <div className="form-review-panel-page">
      <form className="rjsf" noValidate>
        <div className="form-review-panel-page-header-row">
          <h4 className="form-review-panel-page-header vads-u-font-size--h5">
            {title}
          </h4>
          <va-button
            text={EDIT_BTN_TEXT}
            label={`${EDIT_BTN_TEXT} ${title}`}
            onClick={editPage}
            secondary
          />
        </div>
        <dl className="review">
          <div className="review-row">
            <dt>{inputLabel}</dt>
            <dd className="dd-privacy-hidden" data-dd-action-name="data value">
              {valueText || '—'}
            </dd>
          </div>
        </dl>
      </form>
    </div>
  );
};

AddressSelectionReviewPage.propTypes = {
  data: PropTypes.object,
  editPage: PropTypes.func,
  pagePerItemIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  title: PropTypes.string,
};

export default AddressSelectionReviewPage;
