import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { mount } from 'enzyme';
import EmailReviewField from '../../components/EmailReviewField';

const MockComponent = ({ formData }) => <div>{formData}</div>;
MockComponent.propTypes = {
  formData: PropTypes.string,
};

describe('EmailReviewField component', () => {
  it('renders the EmailReviewField footer', () => {
    const wrapper = mount(
      <EmailReviewField>
        <MockComponent formData="test@test.com" />
      </EmailReviewField>,
    );
    expect(wrapper.text()).to.include('test');

    wrapper.unmount();
  });
});
