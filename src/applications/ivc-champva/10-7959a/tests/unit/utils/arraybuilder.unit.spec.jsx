import { render } from '@testing-library/react';
import { expect } from 'chai';
import React from 'react';
import sinon from 'sinon-v20';
import {
  createModalTitleOrDescription,
  createSummaryTitle,
} from '../../../utils/helpers';

describe('10-7959a `createModalTitleOrDescription` util', () => {
  const itemKey = 'health-insurance--cancel-edit-item-title';
  const nounKey = 'health-insurance--cancel-edit-noun-title';

  const createMockProps = (itemName = null, nounSingular = 'plan') => ({
    getItemName: sinon.stub().returns(itemName),
    itemData: itemName ? { provider: itemName } : {},
    index: 0,
    formData: {},
    nounSingular,
  });

  const subject = (itemName, nounSingular = 'plan') => {
    const modalFn = createModalTitleOrDescription(itemKey, nounKey);
    const props = createMockProps(itemName, nounSingular);
    const result = modalFn(props);
    return { props, result };
  };

  const expectGetItemNameCalled = props =>
    sinon.assert.calledOnceWithExactly(
      props.getItemName,
      props.itemData,
      props.index,
      props.formData,
    );

  it('should use itemKey and itemName when item name exists', () => {
    const { props, result } = subject('Blue Cross');
    expectGetItemNameCalled(props);
    expect(result).to.include('Blue Cross');
    expect(result).to.not.include('{{XX');
  });

  [
    { value: null, description: 'null' },
    { value: undefined, description: 'undefined' },
    { value: '', description: 'empty string' },
  ].forEach(({ value, description }) => {
    it(`should use nounKey and noun when item name is ${description}`, () => {
      const { props, result } = subject(value, 'insurance plan');
      expectGetItemNameCalled(props);
      expect(result).to.include('insurance plan');
      expect(result).to.not.include('{{XX');
    });
  });
});

describe('10-7959a createSummaryTitle util', () => {
  const summaryKey = 'health-insurance--summary-title';

  const subject = (overrides = {}) => {
    const formData = { certifierRole: 'applicant', ...overrides };
    const SummaryTitle = createSummaryTitle(summaryKey);
    return render(<SummaryTitle formData={formData} />);
  };

  it('should render title inside a masked privacy wrapper', () => {
    const { container } = subject();
    const mask = container.querySelector('span[data-dd-privacy="mask"]');
    expect(mask.textContent).to.match(/health insurance review/i);
  });
});
