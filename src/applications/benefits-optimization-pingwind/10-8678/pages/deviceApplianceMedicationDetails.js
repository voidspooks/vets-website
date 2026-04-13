// @ts-check
import React from 'react';
import PropTypes from 'prop-types';
import {
  checkboxGroupSchema,
  checkboxGroupUI,
  selectSchema,
  selectUI,
  textSchema,
  textUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';

import {
  BODY_PART_LABELS,
  FORM_10_8678,
  MAX_BENEFIT_ITEMS,
} from '../definitions/constants';
import {
  VHA_MEDICAL_FACILITY_LABELS,
  VHA_MEDICAL_FACILITY_OPTIONS,
} from '../definitions/facilities';

const { VHA_MEDICAL_FACILITY } = FORM_10_8678;

const DEVICE_ITEM_LABEL = 'Device, appliance, or skin medication';

const isOtherMedicalFacility = item =>
  item?.issuingFacility === VHA_MEDICAL_FACILITY.OTHER_OPTION;

const getSelectedBodyParts = bodyParts => {
  if (!bodyParts) {
    return [];
  }

  return Object.entries(BODY_PART_LABELS)
    .filter(([key]) => bodyParts[key])
    .map(([, label]) => label);
};

const validateOtherMedicalFacility = (errors, fieldData) => {
  if (
    isOtherMedicalFacility(fieldData) &&
    !fieldData?.issuingFacilityOther?.trim()
  ) {
    errors.issuingFacilityOther.addError(VHA_MEDICAL_FACILITY.OTHER_ERROR);
  }
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

const DeviceApplianceMedicationView = ({ formData }) => {
  if (!formData) {
    return null;
  }

  const {
    impactedLocations,
    issuingFacility,
    issuingFacilityOther,
    itemType,
    serviceConnectedDisability,
  } = formData;

  const selectedBodyParts = getSelectedBodyParts(impactedLocations);
  const facilityDisplay = isOtherMedicalFacility(formData)
    ? issuingFacilityOther
    : issuingFacility;

  return (
    <div>
      <strong>{itemType || DEVICE_ITEM_LABEL}</strong>
      {renderReviewRow(
        'Service-connected disability',
        serviceConnectedDisability,
      )}
      {renderReviewRow('Facility or PSAS', facilityDisplay)}
      {selectedBodyParts.length > 0 && (
        <div>
          <strong>Impacted body areas:</strong> {selectedBodyParts.join(', ')}
        </div>
      )}
    </div>
  );
};

DeviceApplianceMedicationView.displayName = 'DeviceApplianceMedicationView';

DeviceApplianceMedicationView.propTypes = {
  formData: PropTypes.shape({
    impactedLocations: PropTypes.shape({
      upperLeft: PropTypes.bool,
      upperRight: PropTypes.bool,
      lowerLeft: PropTypes.bool,
      lowerRight: PropTypes.bool,
    }),
    issuingFacility: PropTypes.string,
    issuingFacilityOther: PropTypes.string,
    itemType: PropTypes.string,
    serviceConnectedDisability: PropTypes.string,
  }),
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(
      'Prosthetic device, orthopedic appliance, and skin medications',
      `Tell us about any device, orthopedic appliance, or skin medication you use regularly for your service-connected disability. Add one item at a time. You can add up to ${MAX_BENEFIT_ITEMS} items total.`,
    ),

    deviceApplianceMedicationItems: {
      'ui:errorMessages': {
        minItems: `Add at least one ${DEVICE_ITEM_LABEL.toLowerCase()}`,
        maxItems: `You can add up to ${MAX_BENEFIT_ITEMS} items`,
      },
      'ui:options': {
        itemName: DEVICE_ITEM_LABEL,
        viewField: DeviceApplianceMedicationView,
        reviewTitle: 'Device, appliance, and medication details',
        itemAriaLabel: item => item?.itemType || DEVICE_ITEM_LABEL,
        keepInPageOnReview: true,
        confirmRemove: true,
        confirmRemoveDescription:
          'This will remove this item from your application.',
      },
      items: {
        'ui:validations': [validateOtherMedicalFacility],

        serviceConnectedDisability: textUI({
          title:
            'What service-connected disability requires the use of this device, orthopedic appliance, or skin medication?',
          errorMessages: {
            required: 'Enter your service-connected disability or disabilities',
          },
        }),

        itemType: textUI({
          title:
            'What is the name of this device, orthopedic appliance, or skin medication?',
          errorMessages: {
            required:
              'Enter the name of the device, appliance, or skin medication you use',
          },
        }),

        issuingFacility: selectUI({
          title:
            'At which VHA location did you receive the device, orthopedic appliance, or skin medication?',
          description:
            'Select a facility or PSAS from the list. If your facility isn’t listed, select "Other" and enter the name in the field provided.',
          labels: VHA_MEDICAL_FACILITY_LABELS,
          errorMessages: {
            required: VHA_MEDICAL_FACILITY.FIELD_ERROR,
          },
        }),

        issuingFacilityOther: {
          ...textUI(VHA_MEDICAL_FACILITY.OTHER_LABEL),
          'ui:options': {
            expandUnder: 'issuingFacility',
            expandUnderCondition: VHA_MEDICAL_FACILITY.OTHER_OPTION,
          },
          'ui:required': item => isOtherMedicalFacility(item),
          'ui:errorMessages': {
            required: VHA_MEDICAL_FACILITY.OTHER_ERROR,
          },
        },

        impactedLocations: checkboxGroupUI({
          title:
            'Which area or areas of the body are impacted by this device, orthopedic appliance, or skin medication?',
          required: true,
          labels: BODY_PART_LABELS,
          errorMessages: {
            required: 'Select at least one impacted area of the body',
          },
        }),
      },
    },
  },

  schema: {
    type: 'object',
    required: ['deviceApplianceMedicationItems'],
    properties: {
      deviceApplianceMedicationItems: {
        type: 'array',
        minItems: 1,
        maxItems: MAX_BENEFIT_ITEMS,
        items: {
          type: 'object',
          required: [
            'serviceConnectedDisability',
            'itemType',
            'issuingFacility',
            'impactedLocations',
          ],
          properties: {
            serviceConnectedDisability: {
              ...textSchema,
              maxLength: 255,
            },
            itemType: {
              ...textSchema,
              maxLength: 255,
            },
            issuingFacility: selectSchema(VHA_MEDICAL_FACILITY_OPTIONS),
            issuingFacilityOther: {
              ...textSchema,
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
