import { expect } from 'chai';
import {
  typeOfTrainingUiSchema,
  typeOfTrainingSchema,
  flightTrainingRequirementsUiSchema,
  flightTrainingRequirementsSchema,
  schoolInformationUiSchema,
  schoolInformationSchema,
  careerObjectiveUiSchema,
  careerObjectiveSchema,
  benefitAuthorizationUiSchema,
  benefitAuthorizationSchema,
} from './educationTraining';

describe('educationTraining chapter', () => {
  describe('typeOfTrainingUiSchema', () => {
    it('has typeOfEducation field', () => {
      expect(typeOfTrainingUiSchema).to.have.property('typeOfEducation');
    });
  });

  describe('typeOfTrainingSchema', () => {
    it('has typeOfEducation in required array', () => {
      expect(typeOfTrainingSchema.required).to.include('typeOfEducation');
    });
  });

  describe('flightTrainingRequirementsUiSchema', () => {
    it('has flightTrainingCourse field', () => {
      expect(flightTrainingRequirementsUiSchema).to.have.property('flightTrainingCourse');
    });

    it('has ui:validations array', () => {
      expect(flightTrainingRequirementsUiSchema['ui:validations']).to.be.an('array');
    });

    describe('validateFlightTrainingAcknowledged', () => {
      let messages;
      let errors;

      beforeEach(() => {
        messages = [];
        errors = {
          flightTrainingCourse: {
            requirementsAcknowledged: { addError: msg => messages.push(msg || '') },
          },
        };
      });

      it('adds error when requirementsAcknowledged is false', () => {
        const validationFn = flightTrainingRequirementsUiSchema['ui:validations'][0];
        validationFn(errors, {
          flightTrainingCourse: { requirementsAcknowledged: false },
        });
        expect(messages.length).to.be.greaterThan(0);
      });

      it('does not add error when requirementsAcknowledged is true', () => {
        const validationFn = flightTrainingRequirementsUiSchema['ui:validations'][0];
        validationFn(errors, {
          flightTrainingCourse: { requirementsAcknowledged: true },
        });
        expect(messages).to.have.lengthOf(0);
      });

      it('does not add error when flightTrainingCourse is absent', () => {
        const validationFn = flightTrainingRequirementsUiSchema['ui:validations'][0];
        validationFn(errors, {});
        expect(messages).to.have.lengthOf(0);
      });
    });
  });

  describe('schoolInformationUiSchema', () => {
    it('has schoolSelected and schoolInfo fields', () => {
      expect(schoolInformationUiSchema).to.have.property('schoolSelected');
      expect(schoolInformationUiSchema).to.have.property('schoolInfo');
    });
  });

  describe('careerObjectiveUiSchema', () => {
    it('has educationalObjective field', () => {
      expect(careerObjectiveUiSchema).to.have.property('educationalObjective');
    });
  });

  describe('careerObjectiveSchema', () => {
    it('educationalObjective has maxLength 500', () => {
      expect(careerObjectiveSchema.properties.educationalObjective.maxLength).to.equal(500);
    });
  });

  describe('benefitAuthorizationUiSchema', () => {
    it('has highestRateAuthorization field', () => {
      expect(benefitAuthorizationUiSchema).to.have.property('highestRateAuthorization');
    });
  });
});