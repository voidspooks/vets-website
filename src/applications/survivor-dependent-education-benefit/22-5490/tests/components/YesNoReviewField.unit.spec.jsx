import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { mount } from 'enzyme';
import YesNoReviewField from '../../components/YesNoReviewField';

const MockComponent = ({ formData }) => <div>{formData}</div>;
MockComponent.propTypes = {
  formData: PropTypes.string,
};

describe('YesNoReviewField component', () => {
  it('renders the YesNoReviewField footer', () => {
    const uiSchema = {
      'ui:title': 'test title',
    };
    const wrapper = mount(
      <YesNoReviewField uiSchema={uiSchema}>
        <MockComponent formData="yes" />
      </YesNoReviewField>,
    );
    expect(wrapper.text()).to.include('test title');

    wrapper.unmount();
  });
});
