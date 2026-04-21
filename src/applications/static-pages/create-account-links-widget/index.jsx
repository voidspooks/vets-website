import React from 'react';
import ReactDOM from 'react-dom';
import CreateAccountLinks from './CreateAccountLinks';

export default function createCreateAccountLinksWidget(widgetType) {
  const widgets = Array.from(
    document.querySelectorAll(`[data-widget-type="${widgetType}"]`),
  );

  if (!widgets.length) return;

  widgets.forEach(el => {
    ReactDOM.render(<CreateAccountLinks />, el);
  });
}
