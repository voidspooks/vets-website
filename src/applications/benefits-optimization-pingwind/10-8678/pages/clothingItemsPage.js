// @ts-check
import React from 'react';
import PropTypes from 'prop-types';
import {
  titleUI,
  textUI,
  textSchema,
  textareaUI,
  textareaSchema,
  checkboxGroupUI,
  checkboxGroupSchema,
  currentOrPastMonthYearDateUI,
  currentOrPastMonthYearDateSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { MAX_CLOTHING_ITEMS, BODY_PART_LABELS } from '../definitions/constants';

const getSelectedBodyParts = bodyParts => {
  if (!bodyParts) {
    return [];
  }

  return Object.entries(BODY_PART_LABELS)
    .filter(([key]) => bodyParts[key])
    .map(([, label]) => label);
};

const renderReviewRow = (label, value) => {
  if (!value) {
    return null;
  }

  return (
    <div>
      <strong>{label}:</strong> {value}
    </div>
  );
};

const ClothingItemView = ({ formData }) => {
  if (!formData) {
    return null;
  }

  const {
    itemType,
    serviceConnectedDisability,
    issuedDate,
    issuingFacility,
    impactedLocations,
  } = formData;

  const selectedBodyParts = getSelectedBodyParts(impactedLocations);

  return (
    <div>
      <strong>{itemType || 'Appliance or skin medication'}</strong>
      {renderReviewRow(
        'Service-connected disability',
        serviceConnectedDisability,
      )}
      {renderReviewRow('Month and year issued', issuedDate)}
      {renderReviewRow('VA facility', issuingFacility)}
      {selectedBodyParts.length > 0 && (
        <div>
          <strong>Body areas impacted:</strong> {selectedBodyParts.join(', ')}
        </div>
      )}
    </div>
  );
};

ClothingItemView.propTypes = {
  formData: PropTypes.shape({
    itemType: PropTypes.string,
    serviceConnectedDisability: PropTypes.string,
    issuedDate: PropTypes.string,
    issuingFacility: PropTypes.string,
    impactedLocations: PropTypes.shape({
      chest: PropTypes.bool,
      back: PropTypes.bool,
      buttock: PropTypes.bool,
      leftLeg: PropTypes.bool,
      rightLeg: PropTypes.bool,
      leftArm: PropTypes.bool,
      rightArm: PropTypes.bool,
    }),
  }),
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(
      'Appliances and skin medications',
      'Add each appliance or skin medication that damages your clothing. You can add up to 5 items.',
    ),
    clothingItems: {
      'ui:errorMessages': {
        minItems: 'Add at least one appliance or skin medication',
        maxItems: `You can add up to ${MAX_CLOTHING_ITEMS} items`,
      },
      'ui:options': {
        itemName: 'Appliance or skin medication',
        viewField: ClothingItemView,
        reviewTitle: 'Appliances and skin medications',
        confirmRemove: true,
        confirmRemoveDescription:
          'This will remove this appliance or skin medication from your application.',
      },
      items: {
        itemType: {
          ...textUI({
            title: 'Type of appliance or name of skin medication',
            errorMessages: {
              required:
                'Enter the type of appliance or name of the skin medication',
            },
          }),
        },
        serviceConnectedDisability: {
          ...textareaUI({
            title:
              'Service-connected disability or disabilities requiring this appliance or skin medication',
            errorMessages: {
              required:
                'Enter the service-connected disability or disabilities',
            },
          }),
        },
        issuedDate: {
          ...currentOrPastMonthYearDateUI({
            title: 'Month and year issued',
            hint: 'Enter the month and year this item was issued',
            errorMessages: {
              required: 'Enter the month and year issued',
            },
          }),
        },
        issuingFacility: {
          ...textareaUI({
            title: 'Name and location of VA facility that issued this item',
            errorMessages: {
              required: 'Enter the name and location of the VA facility',
            },
          }),
        },
        impactedLocations: checkboxGroupUI({
          title: 'Body area or areas impacted',
          required: false,
          labels: BODY_PART_LABELS,
          hint:
            'Select all body areas impacted by this appliance or skin medication',
        }),
      },
    },
  },
  schema: {
    type: 'object',
    required: ['clothingItems'],
    properties: {
      clothingItems: {
        type: 'array',
        minItems: 1,
        maxItems: MAX_CLOTHING_ITEMS,
        items: {
          type: 'object',
          required: [
            'itemType',
            'serviceConnectedDisability',
            'issuedDate',
            'issuingFacility',
          ],
          properties: {
            itemType: {
              ...textSchema,
              maxLength: 100,
            },
            serviceConnectedDisability: {
              ...textareaSchema,
              maxLength: 500,
            },
            issuedDate: currentOrPastMonthYearDateSchema,
            issuingFacility: {
              ...textareaSchema,
              maxLength: 255,
            },
            impactedLocations: checkboxGroupSchema(
              Object.keys(BODY_PART_LABELS),
            ),
          },
        },
      },
    },
  },
};
