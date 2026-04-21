import {
  VaSearchFilter,
  VaSearchInput,
  VaSort,
} from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { focusElement } from '@department-of-veterans-affairs/platform-utilities/ui';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import InquiriesList from './InquiriesList';
import { filterAndSort } from '../../utils/inbox';

/**
 * @import {Inquiry} from './InquiryCard
 */

/**
 * @typedef {Object} Props
 * @property {('Business' | 'Personal')[]} inquiryTypes
 * @property {string[]} categoryOptions
 * @property {string[]} statusOptions
 * @property {Inquiry[]} inquiries
 */

/**
 * @param {Props} props
 */
export default function InboxLayoutNew({
  inquiries,
  inquiryTypes,
  categoryOptions,
  statusOptions,
}) {
  const [sortOrder, setSortOrder] = useState(
    filterAndSort.sortOptions.lastUpdate.newest,
  );

  const showInquiryTypes =
    inquiryTypes.includes('Business') && inquiryTypes.includes('Personal');

  const [filters, setFilters] = useState({
    statuses: [],
    categories: [],
    types: showInquiryTypes ? ['Business'] : [],
    query: '',
  });

  const filtersRef = useRef(null);
  const filtersHeader = 'Filters';

  // Traverse down the DOM (defaults to shadow root with light as fallback)
  function shadowQuery(root, ...selectors) {
    let node = root;
    for (const selector of selectors) {
      if (!node) return null;
      const searchRoot = node.shadowRoot ?? node;
      node = searchRoot.querySelector(selector) ?? node.querySelector(selector);
    }
    return node;
  }

  useEffect(() => {
    const searchFilter = filtersRef.current;

    const tryClick = () => {
      const button = shadowQuery(
        searchFilter,
        'va-accordion',
        'va-accordion-item',
        'div',
        'h2',
        'button',
      );
      // Only the mobile version has the header text in the button. On desktop, the header text is an h2
      if (button?.textContent.startsWith(filtersHeader)) {
        button.click();
      }
    };

    const observer = new MutationObserver((_, obs) => {
      if (searchFilter?.classList.contains('hydrated')) {
        tryClick();
        obs.disconnect();
      }
    });

    if (!searchFilter) return () => observer.disconnect();

    if (searchFilter.classList.contains('hydrated')) {
      tryClick();
    } else {
      observer.observe(searchFilter, { attributes: true });
    }

    return () => observer.disconnect();
  }, []);

  if (!inquiries.length) {
    return (
      <div className="vads-u-margin-bottom--5">
        <va-alert
          disable-analytics="false"
          full-width="false"
          status="info"
          visible="true"
          slim
        >
          <p className="vads-u-margin-y--0">
            You haven’t submitted a question yet.
          </p>
        </va-alert>
      </div>
    );
  }

  const results = filterAndSort({
    inquiriesArray: inquiries,
    filters: { ...filters, inquiryTypes: filters.types },
    sortOrder,
  });

  const uiFilterOptions = [
    {
      id: 'Status',
      label: 'Status',
      category: statusOptions.map(opt => ({
        id: opt,
        label: opt,
        active: filters.statuses.includes(opt),
      })),
    },
    {
      id: 'Category',
      label: 'Category',
      category: categoryOptions.map(opt => ({
        id: opt,
        label: opt,
        active: filters.categories.includes(opt),
      })),
    },
  ];

  if (inquiryTypes.length > 1) {
    uiFilterOptions.push({
      id: 'Inquiry type',
      label: 'Inquiry type',
      category: inquiryTypes.map(opt => ({
        id: opt,
        label: opt,
        active: filters.types.includes(opt),
      })),
    });
  }

  return (
    <div id="inbox">
      <div id="filters-column">
        <VaSearchFilter
          header={filtersHeader}
          ref={filtersRef}
          filterOptions={uiFilterOptions}
          onVaFilterApply={e => {
            const activeFilters = e.detail.reduce(
              (accumulator, current) => {
                const options = current.category.map(({ label }) => label);
                if (/category/i.test(current.label)) {
                  accumulator.categories = options;
                } else if (/status/i.test(current.label)) {
                  accumulator.statuses = options;
                } else if (/inquiry type/i.test(current.label)) {
                  accumulator.types = options;
                }
                return accumulator;
              },
              {
                categories: [],
                statuses: [],
                types: [],
              },
            );
            setFilters(prev => ({ ...prev, ...activeFilters }));
            focusElement('#search-description');
          }}
          onVaFilterClearAll={() => {
            setFilters(prev => ({
              ...prev,
              categories: [],
              statuses: [],
              types: [],
            }));
            focusElement('#search-description');
          }}
        />
      </div>
      <div id="results-column">
        <h2 className="vads-u-margin--0">Your Ask VA inbox</h2>
        <div id="search-container">
          <p className="vads-u-margin--0 vads-u-margin-bottom--1">
            Enter a keyword, phrase, or question
          </p>
          <VaSearchInput
            big
            label="Enter a keyword, phrase, or question"
            onSubmit={e => {
              setFilters(prev => ({ ...prev, query: e.target.value }));
              focusElement('#search-description');
            }}
          />
        </div>
        <div className="divider" />
        {!!results.length && (
          <div className="vads-u-margin-top--neg1">
            <VaSort
              width="xl"
              value={sortOrder}
              onVaSortSelect={e => {
                setSortOrder(e.target.value);
                focusElement('#search-description');
              }}
            >
              <option value={filterAndSort.sortOptions.lastUpdate.newest}>
                Last Updated (newest to oldest)
              </option>
              <option value={filterAndSort.sortOptions.lastUpdate.oldest}>
                Last Updated (oldest to newest)
              </option>
            </VaSort>
          </div>
        )}
        <InquiriesList
          inquiries={results}
          query={filters.query}
          {...{ sortOrder, filters }}
        />
      </div>
    </div>
  );
}

InboxLayoutNew.propTypes = {
  categoryOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  inquiryTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  statusOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  inquiries: InquiriesList.propTypes.inquiries,
};
