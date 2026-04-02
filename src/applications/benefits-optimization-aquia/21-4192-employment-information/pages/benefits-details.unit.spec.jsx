/**
 * @module tests/pages/benefits-details.unit.spec
 * @description Unit tests for Benefits Details page dynamic title logic
 * VA Form 21-4192 - Request for Employment Information
 */

import { expect } from 'chai';

import { benefitsDetailsUiSchema } from './benefits-details';

describe('Benefits Details Page', () => {
  describe('updateUiSchema dynamic titles', () => {
    const { updateUiSchema } = benefitsDetailsUiSchema['ui:options'];

    it('should include veteran name in field titles with masking', () => {
      const formData = {
        veteranInformation: {
          veteranFullName: { first: 'John', last: 'Doe' },
        },
      };

      const result = updateUiSchema(formData, formData);

      // Should apply dd-privacy-mask class at field group level
      expect(result.benefitsDetails['ui:options'].classNames).to.equal(
        'dd-privacy-mask',
      );

      // Title should be a plain string with veteran name
      const title = result.benefitsDetails.stopReceivingDate['ui:title'];
      expect(title).to.be.a('string');
      expect(title).to.include('John Doe');
    });

    it('should fall back to Veteran when name is missing', () => {
      const result = updateUiSchema({}, {});
      const title = result.benefitsDetails.stopReceivingDate['ui:title'];

      // Should be a plain string when using fallback
      expect(title).to.be.a('string');
      expect(title).to.include('Veteran');
    });
  });
  describe('date relationship validations', () => {
    const getValidation = () => benefitsDetailsUiSchema['ui:validations'][0];

    const buildErrors = () => {
      const messages = {
        benefitsDetails: {
          stopReceivingDate: [],
          firstPaymentDate: [],
        },
      };

      const errors = {
        benefitsDetails: {
          stopReceivingDate: {
            addError: message =>
              messages.benefitsDetails.stopReceivingDate.push(message),
          },
          firstPaymentDate: {
            addError: message =>
              messages.benefitsDetails.firstPaymentDate.push(message),
          },
        },
      };

      return { errors, messages };
    };

    it('should add error when stop receiving date is before start receiving date', () => {
      const validation = getValidation();
      const { errors, messages } = buildErrors();

      validation(errors, {
        benefitsDetails: {
          stopReceivingDate: '2020-01-01',
          startReceivingDate: '2020-01-02',
        },
      });

      expect(messages.benefitsDetails.stopReceivingDate).to.deep.equal([
        'Stop receiving date must be after start receiving date',
      ]);
    });

    it('should add error when first payment date is before start receiving date', () => {
      const validation = getValidation();
      const { errors, messages } = buildErrors();

      validation(errors, {
        benefitsDetails: {
          firstPaymentDate: '2020-01-01',
          startReceivingDate: '2020-01-02',
        },
      });

      expect(messages.benefitsDetails.firstPaymentDate).to.deep.equal([
        'First payment date must be after start receiving date',
      ]);
    });
  });
});
