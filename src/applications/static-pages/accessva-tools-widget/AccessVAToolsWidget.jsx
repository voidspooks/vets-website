import React from 'react';
import { VaAccordion } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { ACCESSVA_LINKS } from './AccessVALinks';
import './accessva-tools-widget.scss';

export function AccessVAToolsWidget() {
  return (
    <div className="accessva-tools-widget">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="vads-u-margin-bottom--2">
        <ul className="va-nav-breadcrumbs-list">
          <li>
            <a href="https://www.va.gov">VA.gov home</a>
          </li>
          <li>AccessVA tools and services</li>
        </ul>
      </nav>

      {/* Page Header */}
      <h1 className="vads-u-margin-bottom--2">AccessVA tools and services</h1>
      <p className="va-introtext vads-u-margin-bottom--4">
        Select your category to sign in to VA online services.
      </p>

      {/* Accordion */}
      <VaAccordion>
        <va-accordion-item
          header="Veterans, family members, and service members"
          id="veterans-accordion"
        >
          <ul className="usa-list">
            {ACCESSVA_LINKS.veterans.map((link, index) => (
              <li key={index}>
                <a href={link.url} className="vads-u-color--link-default">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </va-accordion-item>

        <va-accordion-item
          header="Business partners, employees, and contractors"
          id="business-accordion"
        >
          <ul className="usa-list">
            {ACCESSVA_LINKS.business.map((link, index) => (
              <li key={index}>
                <a href={link.url} className="vads-u-color--link-default">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </va-accordion-item>
      </VaAccordion>
    </div>
  );
}

export default AccessVAToolsWidget;
