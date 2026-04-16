import { expect } from 'chai';
import transformForSubmit from '../../config/transformForSubmit';

describe('pre-need transformForSubmit', () => {
  it('should add formNumber to transformed data', () => {
    const formConfig = {
      formId: '40-10007',
    };
    const form = {
      data: {
        application: {
          claimant: {
            name: {
              first: 'John',
              last: 'Doe',
            },
          },
        },
      },
    };

    const result = JSON.parse(transformForSubmit(formConfig, form));

    expect(result.formNumber).to.equal('40-10007');
    expect(result.application).to.exist;
  });

  it('should handle escaped characters', () => {
    const formConfig = {
      formId: '40-10007',
    };
    const form = {
      data: {
        application: {
          claimant: {
            name: {
              first: 'John',
              last: 'Doe',
            },
          },
        },
      },
    };

    const result = JSON.parse(transformForSubmit(formConfig, form));

    expect(result.formNumber).to.equal('40-10007');
    expect(result.application.claimant.name.first).to.equal('John');
  });

  it('should return valid JSON string', () => {
    const formConfig = {
      formId: '40-10007',
    };
    const form = {
      data: {
        application: {},
      },
    };

    const result = transformForSubmit(formConfig, form);

    expect(() => JSON.parse(result)).to.not.throw();
    expect(typeof result).to.equal('string');
  });
});
