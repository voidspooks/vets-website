import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { MemoryRouter } from 'react-router-dom';
import FoldersList from '../../components/FoldersList';

describe('FoldersList', () => {
  const folders = [
    { id: -2, name: 'Drafts', count: 32, unreadCount: 18, systemFolder: true },
    {
      id: -3,
      name: 'Deleted',
      count: 5,
      unreadCount: 2,
      systemFolder: true,
    },
    {
      id: 100,
      name: 'My Custom',
      count: 8,
      unreadCount: 3,
      systemFolder: false,
    },
  ];

  const setup = (props = {}) => {
    return render(
      <MemoryRouter>
        <FoldersList folders={folders} {...props} />
      </MemoryRouter>,
    );
  };

  describe('show draft counts', () => {
    it('displays total draft count for Drafts folder', () => {
      const screen = setup({ showUnread: true });
      const draftsItem = screen.getByTestId('Drafts');
      expect(draftsItem.textContent).to.include('(32)');
    });

    it('does not display count for non-Drafts folders', () => {
      const screen = setup({ showUnread: true });
      const deletedItem = screen.getByTestId('Deleted');
      const customItem = screen.getByTestId('My Custom');
      expect(deletedItem.textContent).to.not.include('(');
      expect(customItem.textContent).to.not.include('(');
    });
  });
});
