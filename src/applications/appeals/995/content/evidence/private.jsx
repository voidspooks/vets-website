import React from 'react';
import { getYear } from 'date-fns';
import { getCountryObjectFromIso3 } from 'platform/forms/address/helpers';
import {
  getProviderDetailsTitle,
  getSelectedIssues,
} from '../../utils/evidence';
import { PRIVATE_TREATMENT_LOCATION_KEY } from '../../constants';
import { formatIssueList } from '../../../shared/utils/contestableIssueMessages';
import { formatDateToReadableString } from '../../../shared/utils/dates';
import { capitalizeFirstLetter } from '../../../shared/utils';

export const introContent = {
  title: 'Add your private provider or VA Vet Center details',
  description: (
    <>
      <p>
        We can collect your private provider or VA Vet Center medical records
        from any of these sources to support your claim:
      </p>
      <ul>
        <li>Private provider</li>
        <li>VA Vet Center (this is different from VA-paid community care)</li>
      </ul>
      <p className="vads-u-margin-bottom--0">
        We’ll ask you where you were treated, what you were treated for, and
        when.
      </p>
    </>
  ),
};

export const renderAddress = (address, confirmationPage = false) => {
  const { city, country, street, street2, postalCode, state } = address;
  const countryName = getCountryObjectFromIso3(country)?.countryName || '';

  return (
    <p
      className={`dd-privacy-hidden ${
        confirmationPage ? 'vads-u-margin-top--0' : ''
      }`}
    >
      {confirmationPage ? '' : 'Mailing address:'}
      <span className={confirmationPage ? '' : 'vads-u-font-weight--bold'}>
        {!confirmationPage ? <br /> : null}
        {street && (
          <>
            <span>{street}</span>
          </>
        )}
        {street2 && (
          <>
            <br />
            <span>{street2}</span>
          </>
        )}
        {city && (
          <>
            <br />
            <span>{city}</span>
          </>
        )}
        {state && (
          <>
            <span>, {state}</span>
          </>
        )}
        {postalCode && (
          <>
            <br />
            <span>{postalCode}</span>
          </>
        )}
        {countryName && (
          <>
            <br />
            <span>{countryName}</span>
          </>
        )}
      </span>
    </p>
  );
};

export const getFormattedIssues = issues => {
  if (issues?.length === 1) {
    return capitalizeFirstLetter(issues[0]);
  }

  return capitalizeFirstLetter(formatIssueList(issues));
};

export const getTreatmentRange = (treatmentStart, treatmentEnd) => {
  return `${formatDateToReadableString(
    new Date(`${treatmentStart}T12:00:00`),
  )} to ${formatDateToReadableString(new Date(`${treatmentEnd}T12:00:00`))}`;
};

export const summaryContent = {
  title:
    'Review the private providers or VA Vet Centers we’ll request your records from',
  question:
    'Do you want us to request records from another private provider or VA Vet Center?',
  options: {
    Y: 'Yes',
    N: 'No',
  },
  alertItemUpdatedText: itemData =>
    itemData?.[PRIVATE_TREATMENT_LOCATION_KEY]
      ? `${
          itemData[PRIVATE_TREATMENT_LOCATION_KEY]
        } information has been updated.`
      : 'Your information has been updated.',
  cardDescription: item => {
    const selectedIssues = getSelectedIssues(item?.issues);
    const formattedIssues = getFormattedIssues(selectedIssues);

    return (
      <>
        {item?.address && renderAddress(item.address)}
        {selectedIssues?.length === 1 && (
          <p>
            Condition: <strong>{formattedIssues}</strong>
          </p>
        )}
        {selectedIssues?.length > 1 && (
          <p>
            Conditions: <strong>{formattedIssues}</strong>
          </p>
        )}
        {item?.treatmentEnd &&
          item?.treatmentStart && (
            <p>
              Treatment: &nbsp;
              <strong>
                {getTreatmentRange(item.treatmentStart, item.treatmentEnd)}
              </strong>
            </p>
          )}
      </>
    );
  },
  requiredError:
    'Select if you want to add another private provider or VA Vet Center',
};

export const detailsEntryContent = {
  question: (formContext, addOrEdit) => {
    const index = formContext?.pagePerItemIndex || 0;

    return getProviderDetailsTitle(
      addOrEdit,
      +index + 1,
      'nonVa',
      true,
    ).replace('Edit', '');
  },
  label:
    'Enter the name and mailing address of the private provider, facility, medical center, clinic, or VA Vet Center you want us to request your records from.',
  locationLabel: 'Location name',
  locationRequiredError: 'Enter a location name',
};

export const treatmentDateContent = {
  question: (formContext, addOrEdit) => {
    const location = formContext?.[PRIVATE_TREATMENT_LOCATION_KEY];

    if (addOrEdit === 'add') {
      return location
        ? `When were you treated at ${location}?`
        : 'When were you treated?';
    }

    return location
      ? `when you were treated at ${location}`
      : `when you were treated`;
  },
  firstDateLabel: 'First date of treatment',
  dateHint: 'You can estimate.',
  lastDateLabel: 'Last date of treatment',
  requiredError: 'Enter a date, even if it’s an estimate',
  futureError: 'Enter a date in the past, even if it’s an estimate',
  customDayErrorMessage: 'Enter a day from 1 to 31, even if it’s an estimate',
  customMonthErrorMessage:
    'Enter a month from 1 to 12, even if it’s an estimate',
  customYearErrorMessage: `Enter a year from 1900 to ${getYear(
    new Date(),
  )}, even if it’s an estimate`,
};

export const customizableLLText = {
  cancelEditTitle: ({ getItemName, itemData }) =>
    getItemName(itemData)
      ? `Cancel editing the ${getItemName(itemData)} record`
      : 'Cancel editing this record',
  cancelEditDescription:
    'If you cancel, you’ll lose any changes you made to this record and you’ll be returned to the review page.',
  deleteYes: 'Yes, remove this location',
  deleteNo: 'No, keep this location',
  deleteDescription: ({ getItemName, itemData }) =>
    getItemName(itemData) ? (
      <p>
        This will remove <strong>{getItemName(itemData)}</strong> from your
        request.
      </p>
    ) : (
      <p>This will remove this facility from your request.</p>
    ),
  deleteTitle: 'Remove this location?',
  reviewAddButtonText: 'Add another private provider or VA Vet Center',
};

export const confirmationText = {
  authLCTitle:
    'Authorization and limitation of consent for private providers or VA Vet Centers',
  authAcknowledgement:
    'Yes, I acknowledge and authorize this release of information',
  privateTitle:
    'Private providers or VA Vet Centers we’ll request your records from',
};
