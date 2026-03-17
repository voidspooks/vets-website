import { expect } from 'chai';
import formConfig from '../../config/form';
import transformForSubmit from '../../config/submit-transformer';
import fixture from '../e2e/fixtures/data/maximal-test.json';
import transformedFixture from '../e2e/fixtures/data/transformed/maximal-test.json';

describe('transformForSubmit', () => {
  it('should transform json correctly', () => {
    const transformedResult = JSON.parse(
      transformForSubmit(formConfig, fixture),
    );
    expect(transformedResult).to.deep.equal(transformedFixture);
  });

  it('should remove otherConditions from transformed data when present', () => {
    const transformedResult = JSON.parse(
      transformForSubmit(formConfig, fixture),
    );
    expect(transformedResult).to.not.have.property('otherConditions');
  });

  it('should handle missing otherConditions property', () => {
    const formWithoutOtherConditions = {
      ...fixture,
      data: {
        ...fixture.data,
        remarks: {
          respiratoryIllness: true,
        },
      },
    };
    delete formWithoutOtherConditions.data.otherConditions;

    const transformedResult = JSON.parse(
      transformForSubmit(formConfig, formWithoutOtherConditions),
    );
    expect(transformedResult).to.not.have.property('otherConditions');
    expect(transformedResult).to.have.property('remarks');
  });

  it('should delete remarks when empty', () => {
    const formWithEmptyRemarks = {
      ...fixture,
      data: {
        ...fixture.data,
        remarks: {},
      },
    };
    delete formWithEmptyRemarks.data.otherConditions;

    const transformedResult = JSON.parse(
      transformForSubmit(formConfig, formWithEmptyRemarks),
    );
    expect(transformedResult).to.not.have.property('remarks');
    expect(transformedResult).to.not.have.property('otherConditions');
  });

  it('should include only otherConditions in remarks when no checkboxes selected', () => {
    const formWithOnlyOtherConditions = {
      ...fixture,
      data: {
        ...fixture.data,
        remarks: {},
        otherConditions: 'Custom condition description',
      },
    };

    const transformedResult = JSON.parse(
      transformForSubmit(formConfig, formWithOnlyOtherConditions),
    );
    expect(transformedResult.remarks).to.equal('Custom condition description');
    expect(transformedResult).to.not.have.property('otherConditions');
  });
});
