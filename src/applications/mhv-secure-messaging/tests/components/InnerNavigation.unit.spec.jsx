import React from 'react';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import { expect } from 'chai';
import InnerNavigation from '../../components/InnerNavigation';
import reducer from '../../reducers';
import { Paths } from '../../util/constants';

describe('InnerNavigation', () => {
  const folderListWithUnread = [
    { id: 0, name: 'Inbox', count: 10, unreadCount: 5, systemFolder: true },
    { id: -1, name: 'Sent', count: 3, unreadCount: 0, systemFolder: true },
    { id: -2, name: 'Drafts', count: 2, unreadCount: 0, systemFolder: true },
    { id: -3, name: 'Deleted', count: 1, unreadCount: 0, systemFolder: true },
  ];

  const folderListNoUnread = [
    { id: 0, name: 'Inbox', count: 10, unreadCount: 0, systemFolder: true },
    { id: -1, name: 'Sent', count: 3, unreadCount: 0, systemFolder: true },
    { id: -2, name: 'Drafts', count: 2, unreadCount: 0, systemFolder: true },
    { id: -3, name: 'Deleted', count: 1, unreadCount: 0, systemFolder: true },
  ];

  const setup = (folderList, path = Paths.INBOX) => {
    return renderWithStoreAndRouter(<InnerNavigation />, {
      initialState: {
        sm: {
          folders: { folderList },
          search: {},
        },
      },
      reducers: reducer,
      path,
    });
  };

  it('displays unread count next to Inbox when there are unread messages', () => {
    const screen = setup(folderListWithUnread);
    const inboxLink = screen.getByText('Inbox (5)');
    expect(inboxLink).to.exist;
  });

  it('does not display count next to Inbox when unread count is 0', () => {
    const screen = setup(folderListNoUnread);
    const inboxLink = screen.getByText('Inbox');
    expect(inboxLink).to.exist;
    expect(screen.queryByText(/Inbox \(/)).to.be.null;
  });

  it('sets aria-label on Inbox link when there are unread messages', () => {
    const screen = setup(folderListWithUnread);
    const inboxLink = screen.getByText('Inbox (5)');
    expect(inboxLink).to.have.attribute('aria-label', 'Inbox (5 unread)');
  });

  it('does not set aria-label on Inbox link when unread count is 0', () => {
    const screen = setup(folderListNoUnread);
    const inboxLink = screen.getByText('Inbox');
    expect(inboxLink).to.not.have.attribute('aria-label');
  });

  it('does not display unread count on Sent or More folders tabs', () => {
    const screen = setup(folderListWithUnread);
    expect(screen.getByText('Sent')).to.exist;
    expect(screen.getByText('More folders')).to.exist;
    expect(screen.queryByText(/Sent \(/)).to.be.null;
    expect(screen.queryByText(/More folders \(/)).to.be.null;
  });

  it('handles undefined folderList gracefully', () => {
    const screen = setup(undefined);
    const inboxLink = screen.getByText('Inbox');
    expect(inboxLink).to.exist;
    expect(screen.queryByText(/Inbox \(/)).to.be.null;
  });
});
