/* eslint-disable react/prop-types */
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { isReactComponent } from '~/platform/utilities/ui';
import { isMinimalHeaderPath } from '../patterns/minimal-header';

/**
 * Determines the appropriate heading level and responsive font-size classes
 * based on user input, review page state, and minimal header layout.
 *
 * @param {Object} [options={}] - Optional configuration object.
 * @param {string|number|null} userHeaderLevel - An optional custom heading level (e.g., '1', '2', '3').
 *   If not provided, defaults based on minimal header status and review page state.
 * @param {number|null} [options.userHeaderStyleLevel=null] - An optional style level to override the
 *   responsive font-size calculation. Used to apply alternate styling (e.g., h2 size for h1 heading).
 * @param {boolean} [options.isReviewPage=false] - Whether the heading is on a review page.
 *   When true, uses review-page styling (h5 size, base color) and ignores style-level sizing.
 *
 * @returns {Object} An object containing:
 *   - `headingLevel`: The resolved heading element level as a string ('1', '2', '3', etc.).
 *   - `headingClasses`: A classNames string with combined utility classes including:
 *     - Color token (`vads-u-color--base` on review pages, otherwise `gray-dark` or `black`).
 *     - Margin reset (`vads-u-margin-top--0`).
 *     - Responsive font sizes (`mobile-lg:vads-u-font-size--h${styleLevel}` and `vads-u-font-size--h${styleLevel + 1}`)
 *       when a style level is active (non-review pages with minimal header).
 *     - Review-page size (`vads-u-font-size--h5`) when on review page.
 */
export const useHeadingLevels = ({
  userHeaderLevel = null,
  userHeaderStyleLevel = null,
  isReviewPage = false,
  dataDogHidden = false,
}) => {
  const isMinimalHeader = useMemo(() => isMinimalHeaderPath(), []);
  let defaultStyleLevel;
  let defaultLevel;

  if (isMinimalHeader) {
    defaultLevel = isReviewPage ? 3 : 1;
    defaultStyleLevel = !isReviewPage && 2;
  } else {
    defaultLevel = isReviewPage ? 4 : 3;
  }

  const headingLevel = userHeaderLevel || defaultLevel;
  const headingStyleLevel = isReviewPage
    ? undefined
    : userHeaderStyleLevel || defaultStyleLevel;

  const defaultColor =
    Number(headingStyleLevel) === 3 ||
    (!headingStyleLevel && Number(headingLevel) === 3)
      ? 'gray-dark'
      : 'black';
  const headingColor = isReviewPage ? 'base' : defaultColor;

  const headingClasses = classNames({
    [`vads-u-color--${headingColor}`]: true,
    'vads-u-margin-top--0': true,
    ...(headingStyleLevel && {
      [`mobile-lg:vads-u-font-size--h${headingStyleLevel}`]: true,
      [`vads-u-font-size--h${headingStyleLevel + 1}`]: true,
    }),
    'vads-u-font-size--h5': isReviewPage,
    'dd-privacy-mask': dataDogHidden,
  });

  return { headingLevel, headingClasses };
};

/**
 * Render a title header component
 * @param {TitleObject} props - Title to render
 * @returns {JSX.Element} The rendered title component
 */
export const Title = ({
  title,
  description,
  headerLevel: userHeaderLevel,
  headerStyleLevel: userHeaderStyleLevel,
  classNames: userClassNames,
  dataDogHidden = false,
  dataDogAltTitle,
}) => {
  const { headingLevel, headingClasses } = useHeadingLevels({
    userHeaderLevel,
    userHeaderStyleLevel,
    dataDogHidden,
  });

  const CustomHeader = `h${headingLevel}`;
  const className = userClassNames || headingClasses;

  // If the header is an h1, it's intended to also be the focus
  const focusHeaderProps = headingLevel === 1 ? { tabIndex: '-1' } : {};

  return (
    <>
      <CustomHeader
        className={className}
        {...focusHeaderProps}
        data-dd-action-name={dataDogHidden ? dataDogAltTitle : undefined}
      >
        {title}
      </CustomHeader>
      {description && (
        <span className="vads-u-font-family--sans vads-u-font-weight--normal vads-u-font-size--base vads-u-line-height--4 vads-u-display--block">
          {description}
        </span>
      )}
    </>
  );
};

function isTitleObject(obj) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    !Array.isArray(obj) &&
    !(obj instanceof Function) &&
    obj.$$typeof !== Symbol.for('react.element') &&
    !isReactComponent(obj) &&
    obj.title
  );
}

/**
 * @typedef {{
 *   title?: string | JSX.Element | ({ formData, formContext }) => string | JSX.Element,
 *   description?: string | JSX.Element | ({ formData, formContext }) => string | JSX.Element,
 *   headerLevel?: number,
 *   headerStyleLevel?: number,
 *   classNames?: string,
 *   dataDogHidden?: boolean,
 *   dataDogAltTitle?: string,
 * }} TitleObject
 */

/**
 * uiSchema title for the form page, which appears at the top of the page, implemented with object spread into the uiSchema like such: ...titleUI('title')
 *
 * ```js
 * uiSchema: {
 *   ...titleUI('Your contact information')
 *   ...titleUI({
 *     title: 'Your contact information',
 *     description: 'We’ll send any important information to this address.'
 *     headerLevel: 1,
 *     classNames: 'vads-u-margin-top--0',
 *   })
 *   ...titleUI(({ formData, formContext }) => `Your contact information ${formData.firstName}`)
 *   ...titleUI('Your contact information', 'We’ll send any important information to this address.')
 *   ...titleUI('Previous deductible expenses', (<p>
      Tell us more.
          <AdditionalInfo triggerText="What if my expenses are higher than my annual income?">
            We understand in some cases your expenses might be higher than your
            income. If your expenses exceed your income, we’ll adjust them to be
            equal to your income. This won’t affect your application or benefits.
          </AdditionalInfo>
      </p>))
 * ```
 * @param {string | JSX.Element | TitleObject | ({ formData, formContext }) => (string | JSX.Element)} [titleOption] 'ui:title'
 * @param {string | JSX.Element | ({ formData, formContext }) => string | JSX.Element} [descriptionOption] 'ui:description'
 *
 * @returns {UISchemaOptions}
 */
export const titleUI = (titleOption, descriptionOption) => {
  const {
    title,
    description = descriptionOption,
    headerLevel,
    headerStyleLevel,
    classNames: userClassNames,
    dataDogHidden,
    dataDogAltTitle,
  } = isTitleObject(titleOption)
    ? titleOption
    : {
        title: titleOption,
        description: descriptionOption,
      };
  const isTitleFn = typeof title === 'function';
  const isDescriptionFn = typeof description === 'function';

  return {
    'ui:title':
      isTitleFn || isDescriptionFn ? (
        props => (
          <legend className="schemaform-block-title">
            <Title
              title={isTitleFn ? title(props) : title}
              description={isDescriptionFn ? description(props) : description}
              headerLevel={headerLevel}
              headerStyleLevel={headerStyleLevel}
              classNames={userClassNames}
              dataDogHidden={dataDogHidden}
              dataDogAltTitle={
                dataDogHidden &&
                (dataDogAltTitle || (isTitleFn ? title({}) : ''))
              }
            />
          </legend>
        )
      ) : (
        <Title
          title={title}
          description={description}
          headerLevel={headerLevel}
          headerStyleLevel={headerStyleLevel}
          classNames={userClassNames}
          dataDogHidden={dataDogHidden}
          dataDogAltTitle={dataDogAltTitle}
        />
      ),
  };
};

/**
 * uiSchema for a description. Prefer to use second argument of titleUI instead.
 *
 * ```js
 * exampleText: descriptionUI('A block of text goes here')
 * exampleText: descriptionUI(<p>A block of text goes here</p>)
 * exampleText: descriptionUI(<p className="vads-u-margin-bottom--0">
    Tell us more.
        <va-additional-info trigger="What if my expenses are higher than my annual income?">
          We understand ...
        </va-additional-info>
    </p>)
 * exampleText: descriptionUI('A block of text goes here', {
 *    hideOnReview: true
 * })
 * ```
 * @param {string | JSX.Element} [text] 'ui:description'
 * @param {UIOptions} [uiOptions] 'ui:options'
 *
 * @returns {UISchemaOptions}
 */
export const descriptionUI = (text, uiOptions = {}) => {
  return {
    'ui:description': text,
    'ui:options': {
      ...uiOptions,
    },
  };
};

/**
 * uiSchema for an inline title for (in the middle of) a form page. Try not to use this.
 *
 * ```js
 * exampleTitle: inlineTitleUI('Your contact information')
 * exampleTitle: inlineTitleUI('Your contact information', 'We’ll send any important information to this address.')
 * exampleTitle: inlineTitleUI('Previous deductible expenses', (<p>
    Tell us more.
        <va-additional-info trigger="What if my expenses are higher than my annual income?">
          We understand in some cases your expenses might be higher than your
          income. If your expenses exceed your income, we’ll adjust them to be
          equal to your income. This won’t affect your application or benefits.
        </va-additional-info>
    </p>))
 * ```
 * @param {string | JSX.Element} [title] 'ui:title'
 * @param {string | JSX.Element} [description] 'ui:description'
 * @maturityCategory caution
 * @maturityLevel available
 * @returns {UISchemaOptions}
 */
export const inlineTitleUI = (title, description) => {
  return {
    'ui:title': (
      <h3 className="vads-u-color--gray-dark vads-u-margin-top--4 vads-u-margin-bottom--neg3">
        {title}
      </h3>
    ),
    'ui:description': description || null,
  };
};

/**
 * @returns {SchemaOptions}
 */
export const titleSchema = {
  type: 'object',
  properties: {},
};

/**
 * Schema for inlineTitleUI
 * @maturityCategory caution
 * @maturityLevel available
 */
export const inlineTitleSchema = titleSchema;

/**
 * Schema for descriptionUI
 */
export const descriptionSchema = titleSchema;
