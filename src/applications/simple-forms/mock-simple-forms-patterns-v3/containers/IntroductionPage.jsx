import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import FormTitle from '~/platform/forms-system/src/js/components/FormTitle';
import formPatternsCatalog from '~/platform/forms-system/src/js/patterns/form-patterns-catalog.json';
import webComponentPatternsCatalog from '~/platform/forms-system/src/js/web-component-patterns/web-component-patterns-catalog.json';

const GITHUB_BASE =
  'https://github.com/department-of-veterans-affairs/vets-website/blob/main';

// Default maturity for patterns without explicit tags
const DEFAULT_MATURITY = {
  maturityCategory: 'use',
  maturityLevel: 'best_practice',
};

// Look up maturity from the web component patterns catalog by uiSchema name
const webComponentMaturity = uiSchemaName => {
  const pattern = webComponentPatternsCatalog.patterns.find(
    e => e.uiSchema === uiSchemaName,
  );
  if (!pattern) return {};
  return {
    maturityCategory:
      pattern.maturityCategory || DEFAULT_MATURITY.maturityCategory,
    maturityLevel: pattern.maturityLevel || DEFAULT_MATURITY.maturityLevel,
  };
};

// Look up maturity from the form patterns catalog by directory slug
const formPatternMaturity = slug => {
  const pattern = formPatternsCatalog.patterns.find(e => e.slug === slug);
  if (!pattern) return {};
  return {
    maturityCategory:
      pattern.maturityCategory || DEFAULT_MATURITY.maturityCategory,
    maturityLevel: pattern.maturityLevel || DEFAULT_MATURITY.maturityLevel,
  };
};

// Look up all displayable fields from the form patterns catalog
const formPatternData = slug => {
  const pattern = formPatternsCatalog.patterns.find(e => e.slug === slug);
  if (!pattern) return {};
  const data = {
    ...formPatternMaturity(slug),
  };
  if (pattern.guidanceHref) {
    data.guidanceHref = pattern.guidanceHref;
  }
  if (pattern.figmaHref) {
    data.figmaHref = pattern.figmaHref;
  }
  if (pattern.stagingHref) {
    data.stagingHref = pattern.stagingHref;
  }
  if (pattern.codePaths) {
    data.codeLinks = pattern.codePaths.map(p => ({
      href: p,
      label: p.endsWith('README.md') ? 'README' : 'Source',
    }));
  }
  return data;
};

const maturityConfig = {
  use: {
    className: 'usa-label vads-u-background-color--green-darker',
  },
  caution: {
    className: 'usa-label vads-u-color--base',
    style: { backgroundColor: 'var(--vads-color-orange)' },
  },
  "don't use": {
    className: 'usa-label vads-u-background-color--secondary-darkest',
  },
};

const MaturityTag = ({ category, level }) => {
  const config = maturityConfig[category] || maturityConfig.caution;
  const label = level ? `${category}: ${level.replace(/_/g, ' ')}` : category;
  return (
    <span
      className={`${config.className} vads-u-margin-left--1`}
      style={{ ...config.style, whiteSpace: 'nowrap' }}
    >
      {label}
    </span>
  );
};

const ExtLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);

const CodeLink = ({ path, text }) => (
  <ExtLink href={`${GITHUB_BASE}/${path}`}>{text || path}</ExtLink>
);

const fieldPatterns = [
  {
    name: 'Name and Date of Birth',
    formLink: '/name-and-date-of-birth',
    ...webComponentMaturity('fullNameUI'),
    guidanceHref: 'https://design.va.gov/patterns/ask-users-for/names',
    codeLinks: [
      {
        href:
          'src/applications/simple-forms/mock-simple-forms-patterns-v3/pages/nameAndDateOfBirth.js',
        label: 'Page config',
      },
    ],
    figmaHref:
      'https://www.figma.com/file/4A3O3mVx4xDAKfHE7fPF1U/VADS-Templates%2C-Patterns%2C-and-Forms?type=design&node-id=2988-2763&mode=design&t=G7cHyOgjfgKxCDPo-11',
  },
  {
    name: 'Identification information',
    formLink: '/identification-information',
    ...webComponentMaturity('ssnUI'),
    guidanceHref:
      'https://design.va.gov/patterns/ask-users-for/social-security-number',
    codeLinks: [
      {
        href:
          'src/applications/simple-forms/mock-simple-forms-patterns-v3/pages/identificationInformation.js',
        label: 'Page config',
      },
    ],
    figmaHref:
      'https://www.figma.com/file/4A3O3mVx4xDAKfHE7fPF1U/VADS-Templates%2C-Patterns%2C-and-Forms?type=design&node-id=2988-23560&mode=design&t=G7cHyOgjfgKxCDPo-11',
  },
  {
    name: 'Relationship to Veteran',
    formLink: '/relationship-to-veteran',
    ...webComponentMaturity('relationshipToVeteranUI'),
    guidanceHref: 'https://design.va.gov/patterns/ask-users-for/relationship',
    codeLinks: [
      {
        href:
          'src/applications/simple-forms/mock-simple-forms-patterns-v3/pages/relationshipToVeteran.js',
        label: 'Page config',
      },
    ],
    figmaHref:
      'https://www.figma.com/file/4A3O3mVx4xDAKfHE7fPF1U/VADS-Templates%2C-Patterns%2C-and-Forms?type=design&node-id=2988-17640&mode=design&t=G7cHyOgjfgKxCDPo-11',
  },
  {
    name: 'Mailing address',
    formLink: '/mailing-address',
    ...webComponentMaturity('addressUI'),
    guidanceHref: 'https://design.va.gov/patterns/ask-users-for/addresses',
    codeLinks: [
      {
        href:
          'src/applications/simple-forms/mock-simple-forms-patterns-v3/pages/mailingAddress.js',
        label: 'Page config',
      },
    ],
    figmaHref:
      'https://www.figma.com/file/4A3O3mVx4xDAKfHE7fPF1U/VADS-Templates%2C-Patterns%2C-and-Forms?type=design&node-id=2987-36363&mode=design&t=G7cHyOgjfgKxCDPo-11',
  },
  {
    name: 'Phone and email address',
    formLink: '/phone-and-email-address',
    ...webComponentMaturity('phoneUI'),
    guidanceHref: 'https://design.va.gov/patterns/ask-users-for/phone-numbers',
    codeLinks: [
      {
        href:
          'src/applications/simple-forms/mock-simple-forms-patterns-v3/pages/phoneAndEmailAddress.js',
        label: 'Page config',
      },
    ],
    figmaHref:
      'https://www.figma.com/file/4A3O3mVx4xDAKfHE7fPF1U/VADS-Templates%2C-Patterns%2C-and-Forms?type=design&node-id=2988-9602&mode=design&t=G7cHyOgjfgKxCDPo-11',
  },
  {
    name: 'International contact',
    formLink: '/international-contact',
    ...webComponentMaturity('internationalPhoneUI'),
    guidanceHref: 'https://design.va.gov/patterns/ask-users-for/phone-numbers',
    codeLinks: [
      {
        href:
          'src/applications/simple-forms/mock-simple-forms-patterns-v3/pages/internationalContact.js',
        label: 'Page config',
      },
    ],
    figmaHref:
      'https://www.figma.com/design/afurtw4iqQe6y4gXfNfkkk/VADS-Component-Library?node-id=31366-83&p=f&t=NnDlLac4F9xmwC6o-0',
  },
  {
    name: 'Service branch',
    formLink: '/service-branch',
    ...webComponentMaturity('serviceBranchUI'),
    guidanceHref:
      'https://design.va.gov/patterns/ask-users-for/service-history',
    codeLinks: [
      {
        href:
          'src/applications/simple-forms/mock-simple-forms-patterns-v3/pages/serviceBranch.js',
        label: 'Page config',
      },
    ],
    figmaHref:
      'https://www.figma.com/design/4A3O3mVx4xDAKfHE7fPF1U/VADS-Templates--Patterns--and-Forms?node-id=2988-28636&p=f&t=6U0yAXfFmWc95Kt9-0',
  },
  {
    name: 'File upload',
    formLink: '/upload-file',
    ...webComponentMaturity('fileInputUI'),
    guidanceHref: 'https://design.va.gov/components/form/file-input',
    codeLinks: [
      {
        href:
          'src/applications/simple-forms/mock-simple-forms-patterns-v3/pages/upload.js',
        label: 'Page config',
      },
    ],
    figmaHref:
      'https://www.figma.com/design/4A3O3mVx4xDAKfHE7fPF1U/VADS-Templates--Patterns--and-Forms?node-id=2988-63596&p=f&t=6U0yAXfFmWc95Kt9-0',
    variants: [
      {
        name: 'Multiple',
        formLink: '/supporting-documents',
        ...webComponentMaturity('fileInputMultipleUI'),
        codeLinks: [
          {
            href:
              'src/applications/simple-forms/mock-simple-forms-patterns-v3/pages/supportingDocuments.js',
            label: 'Page config',
          },
        ],
      },
      {
        name: 'Multiple + additional info (required)',
        formLink: '/supporting-documents-array-required-intro',
        ...webComponentMaturity('fileInputMultipleUI'),
        codeLinks: [
          {
            href:
              'src/applications/simple-forms/mock-simple-forms-patterns-v3/pages/supportingDocumentsArray.js',
            label: 'Page config',
          },
        ],
      },
      {
        name: 'Multiple + additional info (optional)',
        formLink: '/supporting-documents-array-optional',
        ...webComponentMaturity('fileInputMultipleUI'),
        codeLinks: [
          {
            href:
              'src/applications/simple-forms/mock-simple-forms-patterns-v3/pages/supportingDocumentsArray.js',
            label: 'Page config',
          },
        ],
      },
    ],
  },
];

const compositePatterns = [
  {
    name: 'Multiple responses list & loop',
    formLink: '/treatment-records',
    ...formPatternData('array-builder'),
    variants: [
      {
        name: 'Optional',
        formLink: '/employers',
        codeLinks: [
          {
            href:
              'src/applications/simple-forms/mock-simple-forms-patterns-v3/pages/employers.js',
            label: 'Page config (optional)',
          },
        ],
      },
    ],
  },
  {
    name: 'Prefill',
    ...formPatternData('prefill'),
    variants: [
      {
        name: 'With Minimal header',
        stagingHref: 'https://staging.va.gov/mock-form-minimal-prefill',
      },
    ],
  },
  {
    name: 'Minimal header',
    ...formPatternData('minimal-header'),
  },
];

// Flatten patterns with variants into renderable rows.
// Variants inherit parent fields unless they override them.
const flattenPatterns = patterns =>
  patterns.flatMap(pattern => {
    const { variants, ...parent } = pattern;
    const rows = [{ ...parent, isVariant: false }];
    if (variants) {
      variants.forEach(variant => {
        rows.push({
          ...parent,
          ...variant,
          name: `${parent.name}: ${variant.name}`,
          isVariant: true,
        });
      });
    }
    return rows;
  });

const PatternTable = ({ patterns }) => (
  <va-table>
    <va-table-row slot="headers">
      <span>Pattern</span>
      <span>Code</span>
      <span>Guidance</span>
      <span>Design</span>
      <span>Maturity</span>
    </va-table-row>
    {flattenPatterns(patterns).map(p => (
      <va-table-row key={p.name}>
        <span>
          {p.formLink && <Link to={p.formLink}>{p.name}</Link>}
          {!p.formLink &&
            p.stagingHref && <ExtLink href={p.stagingHref}>{p.name}</ExtLink>}
          {!p.formLink && !p.stagingHref && p.name}
        </span>
        <span>
          {p.codeLinks &&
            p.codeLinks.map(({ href, label }, i) => (
              <React.Fragment key={href}>
                {i > 0 && <br />}
                <CodeLink path={href} text={label} />
              </React.Fragment>
            ))}
        </span>
        <span>
          {p.guidanceHref && Array.isArray(p.guidanceHref)
            ? p.guidanceHref.map((item, i) => {
                const href = typeof item === 'string' ? item : item.href;
                const label =
                  typeof item === 'string' ? 'design.va.gov' : item.label;
                return (
                  <React.Fragment key={href}>
                    {i > 0 && <br />}
                    <ExtLink href={href}>{label}</ExtLink>
                  </React.Fragment>
                );
              })
            : p.guidanceHref && (
                <ExtLink href={p.guidanceHref}>design.va.gov</ExtLink>
              )}
        </span>
        <span>
          {p.figmaHref && <ExtLink href={p.figmaHref}>Figma</ExtLink>}
        </span>
        <span>
          {p.maturityCategory && (
            <MaturityTag
              category={p.maturityCategory}
              level={p.maturityLevel}
            />
          )}
        </span>
      </va-table-row>
    ))}
  </va-table>
);

const childContent = (
  <>
    <h2 id="purpose-and-usage-of-sample-form">
      Purpose and usage of sample form
    </h2>
    <p>
      This form showcases simple patterns in action, highlighting their
      implications on form pages. It is not a starting template for creating
      complete forms, but a visual guide to replicate simple patterns setup and
      page structure.
    </p>
    <p>
      Maturity categories follow the{' '}
      <ExtLink href="https://design.va.gov/about/maturity-scale">
        VA Design System maturity scale
      </ExtLink>
      .
    </p>

    <h2 id="field-patterns">Field patterns</h2>
    <PatternTable patterns={fieldPatterns} />

    <h2 id="form-patterns">Form patterns</h2>
    <PatternTable patterns={compositePatterns} />
  </>
);

export const IntroductionPage = () => {
  return (
    <article className="schemaform-intro vads-grid-container">
      <FormTitle title="Explore Pattern Demonstrations in Our Sample Form" />
      {childContent}
    </article>
  );
};

export default IntroductionPage;

MaturityTag.propTypes = {
  category: PropTypes.string.isRequired,
  level: PropTypes.string,
};

ExtLink.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
};

CodeLink.propTypes = {
  path: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

PatternTable.propTypes = {
  patterns: PropTypes.arrayOf(PropTypes.object).isRequired,
};
