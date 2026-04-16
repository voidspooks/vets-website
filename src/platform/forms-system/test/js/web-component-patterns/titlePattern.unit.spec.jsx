import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import {
  useHeadingLevels,
  Title,
  titleUI,
  titleSchema,
  descriptionUI,
  descriptionSchema,
  inlineTitleUI,
  inlineTitleSchema,
} from '../../../src/js/web-component-patterns/titlePattern';

describe('titlePattern', () => {
  describe('useHeadingLevels', () => {
    it('should return default heading level and classes', () => {
      const { result } = renderHook(() => useHeadingLevels({}));
      expect(result.current.headingLevel).to.equal(3);
      expect(result.current.headingClasses).to.include(
        'vads-u-color--gray-dark',
      );
      expect(result.current.headingClasses).to.include('vads-u-margin-top--0');
    });

    it('should return custom header level and classes', () => {
      const { result } = renderHook(() =>
        useHeadingLevels({
          userHeaderLevel: 2,
          userHeaderStyleLevel: 4,
        }),
      );
      expect(result.current.headingLevel).to.equal(2);
      expect(result.current.headingClasses).to.include(
        'mobile-lg:vads-u-font-size--h4',
      );
      expect(result.current.headingClasses).to.include('vads-u-color--black');
    });

    it('should default to header level 1 in minimal header apps', () => {
      const minimalHeader = document.createElement('div');
      minimalHeader.id = 'header-minimal';
      document.body.appendChild(minimalHeader);

      const { result } = renderHook(() => useHeadingLevels({}));
      expect(result.current.headingLevel).to.equal(1);
      expect(result.current.headingClasses).to.include(
        'mobile-lg:vads-u-font-size--h2',
      );
      expect(result.current.headingClasses).to.include('vads-u-font-size--h3');

      document.body.removeChild(minimalHeader);
    });

    it('should return review page heading levels and classes', () => {
      const { result } = renderHook(() =>
        useHeadingLevels({
          isReviewPage: true,
        }),
      );
      expect(result.current.headingLevel).to.equal(4);
      expect(result.current.headingClasses).to.include('vads-u-font-size--h5');
      expect(result.current.headingClasses).to.include('vads-u-color--base');
    });

    it('should return review page heading level 3 in minimal header apps', () => {
      const minimalHeader = document.createElement('div');
      minimalHeader.id = 'header-minimal';
      document.body.appendChild(minimalHeader);

      const { result } = renderHook(() =>
        useHeadingLevels({ isReviewPage: true }),
      );
      expect(result.current.headingLevel).to.equal(3);
      expect(result.current.headingClasses).to.include('vads-u-font-size--h5');
      expect(result.current.headingClasses).to.include('vads-u-color--base');

      document.body.removeChild(minimalHeader);
    });

    it('should use black color for non-h3 heading level without style level', () => {
      const { result } = renderHook(() =>
        useHeadingLevels({ userHeaderLevel: 2 }),
      );
      expect(result.current.headingClasses).to.include('vads-u-color--black');
    });

    it('should use gray-dark color when headingStyleLevel is 3', () => {
      const { result } = renderHook(() =>
        useHeadingLevels({ userHeaderLevel: 1, userHeaderStyleLevel: 3 }),
      );
      expect(result.current.headingClasses).to.include(
        'vads-u-color--gray-dark',
      );
    });
  });

  describe('Title component', () => {
    it('should render a title and description with default header level', () => {
      const { getByText } = render(
        <Title title="Test Title" description="Test Description" />,
      );
      expect(getByText('Test Title').tagName).to.equal('H3');
      expect(getByText('Test Description').tagName).to.equal('SPAN');
    });

    it('should render a title without a description', () => {
      const { getByText, queryByText } = render(<Title title="Test Title" />);
      expect(getByText('Test Title').tagName).to.equal('H3');
      expect(queryByText('Test Description')).to.be.null;
    });

    it('should render an h1 in minimal header apps by default', () => {
      const minimalHeader = document.createElement('div');
      minimalHeader.id = 'header-minimal';
      document.body.appendChild(minimalHeader);

      const { getByText } = render(<Title title="Test Title" />);
      const titleElement = getByText('Test Title');
      expect(titleElement.tagName).to.equal('H1');
      expect(titleElement.getAttribute('tabIndex')).to.equal('-1');

      document.body.removeChild(minimalHeader);
    });

    it('should render a title with a custom header level', () => {
      const { getByText } = render(
        <Title title="Test Title" headerLevel={2} />,
      );

      const titleElement = getByText('Test Title');
      expect(titleElement.tagName).to.equal('H2');
      expect(titleElement.getAttribute('data-dd-action-name')).to.be.null;
    });

    it('should render a title with a custom header style level', () => {
      const { getByText } = render(
        <Title title="Test Title" headerStyleLevel={4} />,
      );
      const titleElement = getByText('Test Title');
      expect(titleElement.className).to.include(
        'mobile-lg:vads-u-font-size--h4',
      );
    });

    it('should apply custom class names', () => {
      const { getByText } = render(
        <Title title="Test Title" classNames="custom-class" />,
      );
      expect(getByText('Test Title').className).to.include('custom-class');
    });

    it('should add the dd-privacy-mask class when dataDogHidden is true', () => {
      const { getByText } = render(
        <Title title="Test Title" dataDogHidden dataDogAltTitle="testing" />,
      );

      const titleElement = getByText('Test Title');
      expect(titleElement.className).to.include('dd-privacy-mask');
      expect(titleElement.getAttribute('data-dd-action-name')).to.eq('testing');
    });

    it('should not add dd-privacy-mask when dataDogHidden is false', () => {
      const { getByText } = render(<Title title="Test Title" />);
      const titleElement = getByText('Test Title');
      expect(titleElement.className).to.not.include('dd-privacy-mask');
      expect(titleElement.getAttribute('data-dd-action-name')).to.be.null;
    });
  });

  describe('titleUI function', () => {
    it('should return a UI schema with a title component', () => {
      const uiSchema = titleUI('Test Title', 'Test Description');
      expect(uiSchema).to.have.property('ui:title');
      const { getByText } = render(uiSchema['ui:title']);
      expect(getByText('Test Title')).to.exist;
      expect(getByText('Test Description')).to.exist;
    });

    it('should accept a TitleObject with options', () => {
      const uiSchema = titleUI({
        title: 'Object Title',
        description: 'Object Description',
        headerLevel: 2,
        classNames: 'custom-class',
      });
      const { getByText } = render(uiSchema['ui:title']);
      expect(getByText('Object Title').tagName).to.equal('H2');
      expect(getByText('Object Title').className).to.include('custom-class');
      expect(getByText('Object Description')).to.exist;
    });

    it('should accept a TitleObject with dataDogHidden', () => {
      const uiSchema = titleUI({
        title: 'Hidden Title',
        dataDogHidden: true,
        dataDogAltTitle: 'alt',
      });
      const { getByText } = render(uiSchema['ui:title']);
      const titleElement = getByText('Hidden Title');
      expect(titleElement.className).to.include('dd-privacy-mask');
      expect(titleElement.getAttribute('data-dd-action-name')).to.eq('alt');
    });

    it('should handle a function title and render with props', () => {
      const titleFn = ({ formData }) => `Hello ${formData.name}`;
      const uiSchema = titleUI(titleFn);
      expect(uiSchema['ui:title']).to.be.a('function');

      const { getByText } = render(
        uiSchema['ui:title']({ formData: { name: 'World' } }),
      );
      expect(getByText('Hello World')).to.exist;
    });

    it('should handle a function description and render with props', () => {
      const descFn = ({ formData }) => `Desc for ${formData.name}`;
      const uiSchema = titleUI('Static Title', descFn);
      expect(uiSchema['ui:title']).to.be.a('function');

      const { getByText } = render(
        uiSchema['ui:title']({ formData: { name: 'Vet' } }),
      );
      expect(getByText('Static Title')).to.exist;
      expect(getByText('Desc for Vet')).to.exist;
    });

    it('should handle a TitleObject with function title and dataDogHidden', () => {
      const titleFn = ({ formData }) => `Hi ${formData?.name || ''}`;
      const uiSchema = titleUI({
        title: titleFn,
        dataDogHidden: true,
        dataDogAltTitle: 'alt-action',
      });
      const { getByText } = render(
        uiSchema['ui:title']({ formData: { name: 'Test' } }),
      );
      const titleElement = getByText('Hi Test');
      expect(titleElement.className).to.include('dd-privacy-mask');
    });

    it('should fall back to calling title function for dataDogAltTitle when dataDogAltTitle is not provided', () => {
      const titleFn = () => 'Fallback Title';
      const uiSchema = titleUI({
        title: titleFn,
        dataDogHidden: true,
      });
      const { container } = render(uiSchema['ui:title']({ formData: {} }));
      const titleElement = container.querySelector('h3');
      expect(titleElement.className).to.include('dd-privacy-mask');
      expect(titleElement.getAttribute('data-dd-action-name')).to.eq(
        'Fallback Title',
      );
    });

    it('should use empty string for dataDogAltTitle when title is not a function and dataDogAltTitle is not provided', () => {
      const descFn = () => 'Dynamic desc';
      const uiSchema = titleUI({
        title: 'Static Title',
        description: descFn,
        dataDogHidden: true,
      });
      const { getByText } = render(uiSchema['ui:title']({ formData: {} }));
      const titleElement = getByText('Static Title');
      expect(titleElement.className).to.include('dd-privacy-mask');
    });

    it('should render title without description when none provided', () => {
      const uiSchema = titleUI('Only Title');
      const { getByText, container } = render(uiSchema['ui:title']);
      expect(getByText('Only Title')).to.exist;
      expect(container.querySelector('span')).to.be.null;
    });
  });

  describe('descriptionUI function', () => {
    it('should return a UI schema with a description', () => {
      const uiSchema = descriptionUI('Some description text');
      expect(uiSchema['ui:description']).to.equal('Some description text');
      expect(uiSchema['ui:options']).to.deep.equal({});
    });

    it('should accept JSX as description', () => {
      const jsx = <p>JSX description</p>;
      const uiSchema = descriptionUI(jsx);
      expect(uiSchema['ui:description']).to.equal(jsx);
    });

    it('should pass through uiOptions', () => {
      const uiSchema = descriptionUI('Text', { hideOnReview: true });
      expect(uiSchema['ui:options']).to.deep.equal({ hideOnReview: true });
    });
  });

  describe('inlineTitleUI function', () => {
    it('should return a UI schema with an inline h3 title', () => {
      const uiSchema = inlineTitleUI('Inline Title');
      expect(uiSchema).to.have.property('ui:title');
      const { getByText } = render(uiSchema['ui:title']);
      const titleElement = getByText('Inline Title');
      expect(titleElement.tagName).to.equal('H3');
      expect(titleElement.className).to.include('vads-u-color--gray-dark');
    });

    it('should set ui:description to null when no description provided', () => {
      const uiSchema = inlineTitleUI('Inline Title');
      expect(uiSchema['ui:description']).to.be.null;
    });

    it('should include a description when provided', () => {
      const uiSchema = inlineTitleUI('Inline Title', 'Some desc');
      expect(uiSchema['ui:description']).to.equal('Some desc');
    });

    it('should accept JSX as description', () => {
      const desc = <p>Details here</p>;
      const uiSchema = inlineTitleUI('Inline Title', desc);
      expect(uiSchema['ui:description']).to.equal(desc);
    });
  });

  describe('schema exports', () => {
    it('titleSchema should be an empty object schema', () => {
      expect(titleSchema).to.deep.equal({
        type: 'object',
        properties: {},
      });
    });

    it('inlineTitleSchema should equal titleSchema', () => {
      expect(inlineTitleSchema).to.deep.equal(titleSchema);
    });

    it('descriptionSchema should equal titleSchema', () => {
      expect(descriptionSchema).to.deep.equal(titleSchema);
    });
  });
});
