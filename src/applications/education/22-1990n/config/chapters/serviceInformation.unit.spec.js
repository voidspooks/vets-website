import { expect } from 'chai';
import {
  activeDutyStatusUiSchema,
  activeDutyStatusSchema,
  militaryServiceHistoryUiSchema,
  militaryServiceHistorySchema,
  supportingDocumentsUiSchema,
  supportingDocumentsSchema,
} from './serviceInformation';

describe('serviceInformation chapter', () => {
  describe('activeDutyStatusUiSchema', () => {
    it('has activeDuty and terminalLeave fields', () => {
      expect(activeDutyStatusUiSchema).to.have.property('activeDuty');
      expect(activeDutyStatusUiSchema).to.have.property('terminalLeave');
    });
  });

  describe('activeDutyStatusSchema', () => {
    it('requires activeDuty and terminalLeave', () => {
      expect(activeDutyStatusSchema.required).to.include('activeDuty');
      expect(activeDutyStatusSchema.required).to.include('terminalLeave');
    });
  });

  describe('militaryServiceHistoryUiSchema', () => {
    it('has servicePeriods field', () => {
      expect(militaryServiceHistoryUiSchema).to.have.property('servicePeriods');
    });

    it('servicePeriods items has required service fields', () => {
      const items = militaryServiceHistoryUiSchema.servicePeriods.items;
      expect(items).to.have.property('dateEnteredService');
      expect(items).to.have.property('serviceComponent');
      expect(items).to.have.property('serviceStatus');
    });

    describe('validateServiceEntryDate', () => {
      let messages;
      let errors;

      beforeEach(() => {
        messages = [];
        errors = { addError: msg => messages.push(msg || '') };
      });

      it('adds a warning for dates before Oct 1 2003', () => {
        const dateField = militaryServiceHistoryUiSchema.servicePeriods.items.dateEnteredService;
        const validations = dateField['ui:validations'];
        expect(validations).to.be.an('array');
        validations.forEach(fn => {
          if (typeof fn === 'function') {
            fn(errors, '2002-01-01');
          }
        });
        expect(messages.length).to.be.greaterThan(0);
      });

      it('does not add error for dates on or after Oct 1 2003', () => {
        const dateField = militaryServiceHistoryUiSchema.servicePeriods.items.dateEnteredService;
        const validations = dateField['ui:validations'];
        validations.forEach(fn => {
          if (typeof fn === 'function') {
            fn(errors, '2004-05-01');
          }
        });
        expect(messages).to.have.lengthOf(0);
      });

      it('does not error on null/undefined value', () => {
        const dateField = militaryServiceHistoryUiSchema.servicePeriods.items.dateEnteredService;
        const validations = dateField['ui:validations'];
        expect(() => {
          validations.forEach(fn => {
            if (typeof fn === 'function') fn(errors, null);
          });
        }).to.not.throw();
      });
    });
  });

  describe('militaryServiceHistorySchema', () => {
    it('requires servicePeriods', () => {
      expect(militaryServiceHistorySchema.required).to.include('servicePeriods');
    });

    it('servicePeriods items require dateEnteredService, serviceComponent, serviceStatus', () => {
      const itemRequired = militaryServiceHistorySchema.properties.servicePeriods.items.required;
      expect(itemRequired).to.include('dateEnteredService');
      expect(itemRequired).to.include('serviceComponent');
      expect(itemRequired).to.include('serviceStatus');
    });
  });

  describe('supportingDocumentsUiSchema', () => {
    it('has ddForm2863 and ddForm214 fields', () => {
      expect(supportingDocumentsUiSchema).to.have.property('ddForm2863');
      expect(supportingDocumentsUiSchema).to.have.property('ddForm214');
    });
  });
});