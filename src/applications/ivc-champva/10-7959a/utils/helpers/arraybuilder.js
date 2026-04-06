import React from 'react';
import PropTypes from 'prop-types';
import { replaceStrValues } from './formatting';
import { titleWithNameText } from '../titles';
import content from '../../locales/en/content.json';

export const createModalTitleOrDescription = (itemKey, nounKey) => props => {
  const itemName = props.getItemName(
    props.itemData,
    props.index,
    props.formData,
  );
  const contentKey = itemName ? itemKey : nounKey;
  const replacementValue = itemName || props.nounSingular;
  return replaceStrValues(content[contentKey], replacementValue);
};

export const createSummaryTitle = summaryKey => {
  const SummaryTitle = ({ formData }) => {
    const titleText = titleWithNameText(content[summaryKey])(formData);
    return <span data-dd-privacy="mask">{titleText}</span>;
  };
  SummaryTitle.propTypes = { formData: PropTypes.object };
  return SummaryTitle;
};
