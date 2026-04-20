import React from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import TabItem from './TabItem';

export default function TabNav() {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const query = typeParam ? `?type=${typeParam}` : '';

  return (
    <nav aria-label="Claim">
      <ul className="tabs">
        <TabItem shortcut={1} tabpath={`../status${query}`} title="Status" />
        <TabItem shortcut={2} tabpath={`../files${query}`} title="Files" />
        <TabItem
          shortcut={3}
          tabpath={`../overview${query}`}
          title="Overview"
        />
      </ul>
    </nav>
  );
}

TabNav.propTypes = {};
