import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { render, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { DefinitionTester } from '~/platform/testing/unit/schemaform-utils';
import formConfig from '../../config/form';

describe('Phone and email address page', () => {
  afterEach(cleanup);

  const email = 'testing@abc.com';
  const mobilePhone = '5224258965';

  const defaultState = {
    form: {
      formId: formConfig.formId,
      loadedData: {
        metadata: {},
      },
    },
    user: {
      login: {
        currentlyLoggedIn: false,
      },
      profile: {
        loa: { current: 1 },
      },
    },
    data: {
      duplicateEmail: [{ address: email, dupe: false }],
      duplicatePhone: [{ number: mobilePhone, dupe: false }],
    },
    featureToggles: {},
  };

  const createMockStore = state => ({
    getState: () => state,
    subscribe: () => {},
    dispatch: sinon.stub(),
  });

  const {
    schema,
    uiSchema,
  } = formConfig.chapters.identificationChapter.pages.phoneAndEmail;

  const mockData = {
    duplicateEmail: [{ address: email, dupe: false }],
    duplicatePhone: [{ number: mobilePhone, dupe: false }],
    contactInfo: {
      mobilePhone: { contact: mobilePhone },
      homePhone: { contact: '' },
    },
    emailAddress: email,
  };

  it('renders inputs', () => {
    const { container } = render(
      <Provider store={createMockStore(defaultState)}>
        <DefinitionTester schema={schema} uiSchema={uiSchema} data={mockData} />
      </Provider>,
    );

    const mobilePhoneInput = container.querySelector(
      "va-telephone-input[label='Mobile phone number']",
    );
    const homePhoneInput = container.querySelector(
      "va-telephone-input[label='Home phone number']",
    );
    const emailInput = container.querySelector("va-text-input[label='Email']");

    expect(mobilePhoneInput).to.exist;
    expect(homePhoneInput).to.exist;
    expect(emailInput).to.exist;
  });

  it('renders duplicate contact info modal', () => {
    const { container } = render(
      <Provider
        store={createMockStore({
          ...defaultState,
          data: {
            duplicateEmail: [{ address: email, dupe: true }],
            duplicatePhone: [{ number: mobilePhone, dupe: true }],
          },
        })}
      >
        <DefinitionTester
          schema={schema}
          uiSchema={uiSchema}
          data={{
            ...mockData,
            duplicateEmail: [{ address: email, dupe: true }],
            duplicatePhone: [{ number: mobilePhone, dupe: true }],
          }}
        />
      </Provider>,
    );

    const modal = container.querySelector('va-modal');
    expect(modal).to.have.attribute(
      'modal-title',
      'We have this mobile phone number and email on file for another person with education benefits',
    );
  });
});
