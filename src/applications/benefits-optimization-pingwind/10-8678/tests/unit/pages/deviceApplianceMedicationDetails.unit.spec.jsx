import React from 'react';
import { expect } from 'chai';
import { render, cleanup } from '@testing-library/react';
import {
  testNumberOfErrorsOnSubmitForWebComponents,
  testNumberOfWebComponentFields,
} from 'platform/forms-system/test/pageTestHelpers.spec';
import formConfig from '../../../config/form';
import deviceApplianceMedicationDetails from '../../../pages/deviceApplianceMedicationDetails';
import { BODY_PART_LABELS, FORM_10_8678 } from '../../../definitions/constants';

const {
  schema,
  uiSchema,
} = formConfig.chapters.deviceApplianceMedicationChapter.pages.deviceApplianceMedicationDetailsPage;

const pageTitle = 'deviceApplianceMedicationDetailsPage';

testNumberOfWebComponentFields(formConfig, schema, uiSchema, 7, pageTitle);
testNumberOfErrorsOnSubmitForWebComponents(
  formConfig,
  schema,
  uiSchema,
  4,
  pageTitle,
);

describe('10-8678 deviceApplianceMedicationDetails internals', () => {
  const itemsUi =
    deviceApplianceMedicationDetails.uiSchema.deviceApplianceMedicationItems;
  const arrayOptions = itemsUi['ui:options'];
  const itemValidator = itemsUi.items['ui:validations'][0];
  const issuingOtherUi = itemsUi.items.issuingFacilityOther;

  afterEach(() => cleanup());

  describe('ui:options.itemAriaLabel', () => {
    it('falls back to the default label when itemType is missing', () => {
      expect(arrayOptions.itemAriaLabel(undefined)).to.equal(
        'Device, appliance, or skin medication',
      );
      expect(arrayOptions.itemAriaLabel({})).to.equal(
        'Device, appliance, or skin medication',
      );
    });

    it('returns the item type when present', () => {
      expect(arrayOptions.itemAriaLabel({ itemType: 'Custom brace' })).to.equal(
        'Custom brace',
      );
    });
  });

  describe('issuingFacilityOther ui:required (isOtherMedicalFacility)', () => {
    it('is required only when issuingFacility is "Other"', () => {
      expect(
        issuingOtherUi['ui:required']({
          issuingFacility: FORM_10_8678.VHA_MEDICAL_FACILITY.OTHER_OPTION,
        }),
      ).to.equal(true);
      expect(
        issuingOtherUi['ui:required']({
          issuingFacility: 'Facility A',
        }),
      ).to.equal(false);
      expect(issuingOtherUi['ui:required']({})).to.equal(false);
      expect(issuingOtherUi['ui:required'](undefined)).to.equal(false);
    });
  });

  describe('validateOtherMedicalFacility', () => {
    const makeErrors = () => {
      const bag = [];
      return {
        errors: {
          issuingFacilityOther: { addError: msg => bag.push(msg) },
        },
        bag,
      };
    };

    it('adds an error when "Other" is selected but the free-text is empty', () => {
      const { errors, bag } = makeErrors();
      itemValidator(errors, {
        issuingFacility: FORM_10_8678.VHA_MEDICAL_FACILITY.OTHER_OPTION,
        issuingFacilityOther: '',
      });
      expect(bag).to.deep.equal([
        FORM_10_8678.VHA_MEDICAL_FACILITY.OTHER_ERROR,
      ]);
    });

    it('adds an error when "Other" is selected but the free-text is only whitespace', () => {
      const { errors, bag } = makeErrors();
      itemValidator(errors, {
        issuingFacility: FORM_10_8678.VHA_MEDICAL_FACILITY.OTHER_OPTION,
        issuingFacilityOther: '   ',
      });
      expect(bag).to.have.lengthOf(1);
    });

    it('does not add an error when "Other" is selected with a real value', () => {
      const { errors, bag } = makeErrors();
      itemValidator(errors, {
        issuingFacility: FORM_10_8678.VHA_MEDICAL_FACILITY.OTHER_OPTION,
        issuingFacilityOther: 'Springfield VA',
      });
      expect(bag).to.deep.equal([]);
    });

    it('does not add an error when a listed facility is selected', () => {
      const { errors, bag } = makeErrors();
      itemValidator(errors, {
        issuingFacility: 'Facility A',
        issuingFacilityOther: '',
      });
      expect(bag).to.deep.equal([]);
    });

    it('tolerates undefined fieldData without throwing', () => {
      const { errors } = makeErrors();
      expect(() => itemValidator(errors, undefined)).to.not.throw();
    });
  });

  describe('DeviceApplianceMedicationView (ui:options.viewField)', () => {
    const ViewField = arrayOptions.viewField;

    it('renders null when formData is missing', () => {
      const { container } = render(<ViewField formData={null} />);
      expect(container.firstChild).to.equal(null);
    });

    it('uses the default device label when itemType is missing', () => {
      const { container } = render(<ViewField formData={{}} />);
      expect(container).to.contain.text(
        'Device, appliance, or skin medication',
      );
    });

    it('renders a complete item including selected body parts', () => {
      const { container } = render(
        <ViewField
          formData={{
            itemType: 'Brace',
            serviceConnectedDisability: 'Knee injury',
            issuingFacility: 'Facility A',
            impactedLocations: {
              upperLeft: true,
              upperRight: false,
              lowerLeft: true,
              lowerRight: false,
            },
          }}
        />,
      );

      expect(container).to.contain.text('Brace');
      expect(container).to.contain.text('Knee injury');
      expect(container).to.contain.text('Facility A');
      expect(container).to.contain.text(BODY_PART_LABELS.upperLeft);
      expect(container).to.contain.text(BODY_PART_LABELS.lowerLeft);
      expect(container).to.not.contain.text(BODY_PART_LABELS.upperRight);
    });

    it('shows the issuingFacilityOther value when "Other" is selected', () => {
      const { container } = render(
        <ViewField
          formData={{
            itemType: 'Custom device',
            issuingFacility: FORM_10_8678.VHA_MEDICAL_FACILITY.OTHER_OPTION,
            issuingFacilityOther: 'Out-of-system clinic',
          }}
        />,
      );
      expect(container).to.contain.text('Out-of-system clinic');
      expect(container).to.not.contain.text(
        FORM_10_8678.VHA_MEDICAL_FACILITY.OTHER_OPTION,
      );
    });

    it('omits optional review rows when their values are missing', () => {
      const { container } = render(
        <ViewField
          formData={{
            itemType: 'Brace',
          }}
        />,
      );
      expect(container).to.not.contain.text('Service-connected disability');
      expect(container).to.not.contain.text('Facility or PSAS');
      expect(container).to.not.contain.text('Impacted body areas');
    });

    it('omits the body-area row when no locations are selected', () => {
      const { container } = render(
        <ViewField
          formData={{
            itemType: 'Brace',
            impactedLocations: {
              upperLeft: false,
              upperRight: false,
              lowerLeft: false,
              lowerRight: false,
            },
          }}
        />,
      );
      expect(container).to.not.contain.text('Impacted body areas');
    });

    it('handles an undefined impactedLocations object (getSelectedBodyParts fallback)', () => {
      const { container } = render(
        <ViewField formData={{ itemType: 'Brace' }} />,
      );
      expect(container).to.contain.text('Brace');
    });
  });
});
