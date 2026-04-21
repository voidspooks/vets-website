import { waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import ReactDOM from 'react-dom';
import widgetTypes from 'platform/site-wide/widgetTypes';
import createCreateAccountLinksWidget from '../index';

describe('createCreateAccountLinksWidget', () => {
  beforeEach(() => {
    sinon.spy(ReactDOM, 'render');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    ReactDOM.render.restore();
  });

  it('does not render when no matching element exists', async () => {
    const div = document.createElement('div');
    div.setAttribute('data-widget-type', 'not-this-widget');
    document.body.appendChild(div);

    createCreateAccountLinksWidget(widgetTypes.CREATE_ACCOUNT_LINKS);

    await waitFor(() => {
      expect(ReactDOM.render.notCalled).to.be.true;
    });
  });

  it('renders CreateAccountLinks component', async () => {
    const div = document.createElement('div');
    div.setAttribute('data-widget-type', widgetTypes.CREATE_ACCOUNT_LINKS);
    document.body.appendChild(div);

    createCreateAccountLinksWidget(widgetTypes.CREATE_ACCOUNT_LINKS);

    await waitFor(() => {
      expect(ReactDOM.render.calledOnce).to.be.true;
      const component = ReactDOM.render.getCall(0).args[0];
      expect(component.type.name).to.eql('CreateAccountLinks');
    });
  });

  it('renders multiple widgets on the same page', async () => {
    ['div1', 'div2'].forEach(id => {
      const div = document.createElement('div');
      div.id = id;
      div.setAttribute('data-widget-type', widgetTypes.CREATE_ACCOUNT_LINKS);
      document.body.appendChild(div);
    });

    createCreateAccountLinksWidget(widgetTypes.CREATE_ACCOUNT_LINKS);

    await waitFor(() => {
      expect(ReactDOM.render.calledTwice).to.be.true;
    });
  });
});
