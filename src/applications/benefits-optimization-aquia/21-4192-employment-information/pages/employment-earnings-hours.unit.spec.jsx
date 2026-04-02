/**
 * @module tests/pages/employment-earnings-hours.unit.spec
 * @description Unit tests for Employment Earnings Hours page validation logic
 * VA Form 21-4192 - Request for Employment Information
 */

import { expect } from 'chai';

import { employmentEarningsHoursUiSchema } from './employment-earnings-hours';

describe('Employment Earnings Hours Page', () => {
  describe('date relationship validations', () => {
    const getValidation = () =>
      employmentEarningsHoursUiSchema.employmentEarningsHours.weeklyHours[
        'ui:validations'
      ][1];

    const buildErrors = () => {
      const messages = [];

      const errors = {
        addError: message => {
          messages.push(message || '');
        },
      };

      return { errors, messages };
    };

    it('should add error when weekly hours are less than daily hours', () => {
      const validation = getValidation();
      const { errors, messages } = buildErrors();

      validation(
        errors,
        10, // weekly hours
        { employmentEarningsHours: { dailyHours: 12 } },
      );

      expect(messages).to.deep.equal([
        'Weekly hours cannot be less than daily hours',
      ]);
    });

    it('should not add error when weekly hours are greater than daily hours', () => {
      const validation = getValidation();
      const { errors, messages } = buildErrors();

      validation(
        errors,
        12, // weekly hours
        { employmentEarningsHours: { dailyHours: 10 } },
      );

      expect(messages).to.deep.equal([]);
    });

    it('should not add error when weekly hours are equal to daily hours', () => {
      const validation = getValidation();
      const { errors, messages } = buildErrors();

      validation(
        errors,
        10, // weekly hours
        { employmentEarningsHours: { dailyHours: 10 } },
      );

      expect(messages).to.deep.equal([]);
    });
  });
});
