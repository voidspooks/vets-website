import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { toHash } from '../../../../shared/utilities';
import {
  medicarePageTitleUI,
  titleWithFormDataUI,
  titleWithNameUI,
  titleWithRoleUI,
} from '../../../utils/titles';

const renderTitle = (uiSchema, formData = {}) => {
  const TitleComponent = uiSchema['ui:title'];
  const { container } = render(<div>{TitleComponent({ formData })}</div>);
  return container.textContent;
};

const expectHasTitle = uiSchema => {
  expect(uiSchema).to.have.property('ui:title');
};

const createName = ({ first = 'John', last = 'Smith', ...rest } = {}) => ({
  first,
  ...(last && { last }),
  ...rest,
});

const createApplicant = ({
  ssn = '123123123',
  first = 'John',
  last = 'Smith',
  dob,
  ...overrides
} = {}) => ({
  applicantSsn: ssn,
  applicantName: createName({ first, last }),
  ...(dob && { applicantDob: dob }),
  ...overrides,
});

const createMedicareItem = (ssn = '123123123') => ({
  medicareParticipant: toHash(ssn),
});

const createMedicareStore = applicants => ({
  getState: () => ({
    form: { data: { applicants } },
  }),
  subscribe: () => {},
  dispatch: () => {},
});

const renderMedicareTitle = ({
  title = 'Medicare plan types',
  applicants = [],
  item = createMedicareItem(),
} = {}) => {
  const uiSchema = medicarePageTitleUI(title);
  const TitleComponent = uiSchema['ui:title'];
  const store = createMedicareStore(applicants);

  const { container } = render(
    <Provider store={store}>
      <div>{TitleComponent({ formData: item })}</div>
    </Provider>,
  );

  return container.textContent;
};

describe('1010d `medicarePageTitleUI` util', () => {
  it('should return a UI schema object with ui:title property', () => {
    expectHasTitle(medicarePageTitleUI('Medicare plan types'));
  });

  it('should generate title with participant name when applicant found', () => {
    const result = renderMedicareTitle({ applicants: [createApplicant()] });
    expect(result).to.equal('John Smith’s Medicare plan types');
  });

  it('should generate title with `Applicant` when no match found', () => {
    const result = renderMedicareTitle({
      item: createMedicareItem('321321321'),
      applicants: [createApplicant({ first: 'Jane', last: 'Doe' })],
    });
    expect(result).to.equal('Applicant’s Medicare plan types');
  });

  it('should generate title with `No participant` when item is null', () => {
    const result = renderMedicareTitle({ item: null });
    expect(result).to.equal('No participant’s Medicare plan types');
  });

  it('should include description when provided', () => {
    const result = medicarePageTitleUI(
      'Medicare plan types',
      'Test description',
    );
    expectHasTitle(result);
    expect(result['ui:title']).to.be.a('function');
  });

  it('should generate title with over-65 applicant name when no participant match', () => {
    const result = renderMedicareTitle({
      item: createMedicareItem('999999999'),
      applicants: [
        createApplicant({
          first: 'Elder',
          last: 'Applicant',
          dob: '1950-01-01',
        }),
        createApplicant({
          ssn: '321321321',
          first: 'Younger',
          last: 'Applicant',
          dob: '2000-01-01',
        }),
      ],
    });
    expect(result).to.equal('Elder Applicant’s Medicare plan types');
  });
});

describe('1010d `titleWithFormDataUI` util', () => {
  const DEFAULT_FORM_DATA = { provider: 'Cigna' };
  const buildSchema = (title, options = {}, description = null) =>
    titleWithFormDataUI(title, description, options);

  it('should return a UI schema object with ui:title property', () => {
    const uiSchema = buildSchema('%s prescription coverage', {
      dataKey: 'provider',
    });
    expectHasTitle(uiSchema);
  });

  it('should replace %s placeholder with provider name from form data', () => {
    const uiSchema = buildSchema('%s prescription coverage', {
      dataKey: 'provider',
    });
    const title = renderTitle(uiSchema, DEFAULT_FORM_DATA);
    expect(title).to.equal('Cigna prescription coverage');
  });

  it('should return title text when resolved value is not present', () => {
    const uiSchema = buildSchema('%s prescription coverage', {
      dataKey: 'provider',
    });
    const title = renderTitle(uiSchema, {});
    expect(title).to.equal('%s prescription coverage');
  });

  it('should use custom placeholder token', () => {
    const uiSchema = buildSchema('Upload [%p] card', {
      dataKey: 'provider',
      placeholder: '%p',
    });
    const title = renderTitle(uiSchema, DEFAULT_FORM_DATA);
    expect(title).to.equal('Upload [Cigna] card');
  });

  it('should support resolver functions for dataKey', () => {
    const uiSchema = buildSchema('Explanation of benefits for %s', {
      dataKey: formData => formData?.insurance?.provider,
      capitalize: false,
    });
    const title = renderTitle(uiSchema, { insurance: { provider: 'Aetna' } });
    expect(title).to.equal('Explanation of benefits for Aetna');
  });

  it('should use fallback when resolved value is nullish', () => {
    const uiSchema = buildSchema('%s prescription coverage', {
      dataKey: 'provider',
      fallback: 'Insurance',
    });
    const title = renderTitle(uiSchema, {});
    expect(title).to.equal('Insurance prescription coverage');
  });

  it('should use fallback when resolved value is a blank string', () => {
    const uiSchema = buildSchema('%s prescription coverage', {
      dataKey: 'provider',
      fallback: 'Insurance',
    });
    const title = renderTitle(uiSchema, { provider: '' });
    expect(title).to.equal('Insurance prescription coverage');
  });

  it('should support arrayBuilder edit titles with form data replacement', () => {
    const uiSchema = buildSchema('%s prescription coverage', {
      dataKey: 'provider',
      arrayBuilder: true,
    });
    const title = renderTitle(uiSchema, DEFAULT_FORM_DATA);
    expect(title).to.equal('Cigna prescription coverage');
  });
});

describe('1010d `titleWithRoleUI` util', () => {
  const buildSchema = (title, options = {}, description = null) =>
    titleWithRoleUI(title, description, options);

  it('should return `Your` when certifier role is `applicant`', () => {
    const uiSchema = buildSchema('%s mailing address');
    const title = renderTitle(uiSchema, { certifierRole: 'applicant' });
    expect(title).to.equal('Your mailing address');
  });

  it('should return `Applicant’s` when certifier role is not applicant', () => {
    const uiSchema = buildSchema('%s mailing address');
    const title = renderTitle(uiSchema, { certifierRole: 'other' });
    expect(title).to.equal('Applicant’s mailing address');
  });

  it('should return `Applicant’s` when certifier role is missing', () => {
    const uiSchema = buildSchema('%s mailing address');
    const title = renderTitle(uiSchema, {});
    expect(title).to.equal('Applicant’s mailing address');
  });

  it('should handle capitalization option', () => {
    const uiSchema = buildSchema('%s contact info', {
      capitalize: false,
      self: 'your',
      other: 'their',
    });
    const title = renderTitle(uiSchema, { certifierRole: 'applicant' });
    expect(title).to.equal('your contact info');
  });

  it('should handle possessive option set to false', () => {
    const uiSchema = buildSchema('%s information', {
      possessive: false,
    });
    const title = renderTitle(uiSchema, { certifierRole: 'other' });
    expect(title).to.equal('Applicant information');
  });

  it('should use custom roleKey and matchRole', () => {
    const uiSchema = buildSchema('%s preferences', {
      roleKey: 'relationship',
      matchRole: 'self',
      self: 'My',
    });
    const title = renderTitle(uiSchema, { relationship: 'self' });
    expect(title).to.equal('My preferences');
  });

  it('should return empty string when title is empty', () => {
    const uiSchema = buildSchema('');
    const title = renderTitle(uiSchema, { certifierRole: 'applicant' });
    expect(title).to.equal('');
  });
});

describe('1010d `titleWithNameUI` util', () => {
  const buildSchema = (title, options = {}, description = null) =>
    titleWithNameUI(title, description, options);

  it('should return `Your` when certifier role is `applicant`', () => {
    const uiSchema = buildSchema('%s identification information');
    const title = renderTitle(uiSchema, { certifierRole: 'applicant' });
    expect(title).to.equal('Your identification information');
  });

  it('should return full name with possessive when certifier role is not `applicant`', () => {
    const uiSchema = buildSchema('%s identification information');
    const title = renderTitle(uiSchema, {
      certifierRole: 'other',
      applicantName: createName(),
    });
    expect(title).to.equal('John Smith’s identification information');
  });

  it('should return first name when `firstNameOnly` option is true', () => {
    const uiSchema = buildSchema('%s contact info', {
      firstNameOnly: true,
    });
    const title = renderTitle(uiSchema, {
      certifierRole: 'other',
      applicantName: createName(),
    });
    expect(title).to.equal('John’s contact info');
  });

  it('should return name without possessive when `possessive` option is false', () => {
    const uiSchema = buildSchema('Contact information for %s', {
      possessive: false,
    });
    const title = renderTitle(uiSchema, {
      certifierRole: 'other',
      applicantName: createName({ last: undefined }),
    });
    expect(title).to.equal('Contact information for John Smith');
  });

  it('should fallback to `Applicant` when name object is empty', () => {
    const uiSchema = buildSchema('%s information');
    const title = renderTitle(uiSchema, {
      certifierRole: 'other',
      applicantName: {},
    });
    expect(title).to.equal('Applicant’s information');
  });

  it('should fallback to `Applicant` when applicantName is missing', () => {
    const uiSchema = buildSchema('%s information');
    const title = renderTitle(uiSchema, { certifierRole: 'other' });
    expect(title).to.equal('Applicant’s information');
  });

  it('should use custom nameKey option', () => {
    const uiSchema = buildSchema('%s medical history', {
      nameKey: 'patientName',
      other: 'Patient',
      firstNameOnly: true,
    });
    const title = renderTitle(uiSchema, {
      certifierRole: 'other',
      patientName: createName({ first: 'Jane', last: undefined }),
    });
    expect(title).to.equal('Jane’s medical history');
  });

  it('should use custom placeholder token', () => {
    const uiSchema = buildSchema('Review %p information', {
      placeholder: '%p',
      firstNameOnly: true,
    });
    const title = renderTitle(uiSchema, {
      certifierRole: 'other',
      applicantName: createName({ last: undefined }),
    });
    expect(title).to.equal('Review John’s information');
  });

  it('should return empty title when title is empty', () => {
    const uiSchema = buildSchema('');
    const title = renderTitle(uiSchema, { certifierRole: 'applicant' });
    expect(title).to.equal('');
  });
});
