import { expect } from 'chai';

import { renderMarkdownToSafeHtml } from '../../../chatbot/utils/markdownRenderer';

describe('chatbot markdownRenderer', () => {
  it('renders markdown link with secure external attributes', () => {
    const html = renderMarkdownToSafeHtml('[VA.gov](https://www.va.gov)');

    expect(html).to.contain('href="https://www.va.gov"');
    expect(html).to.contain('target="_blank"');
    expect(html).to.contain('rel="noopener noreferrer"');
  });

  it('sanitizes javascript links', () => {
    const html = renderMarkdownToSafeHtml('[Click me](javascript:alert(1))');

    expect(html).to.not.contain('<a ');
    expect(html).to.contain('[Click me](javascript:alert(1))');
  });

  it('escapes embedded html and keeps plain text', () => {
    const html = renderMarkdownToSafeHtml(
      'Hello <script>alert(1)</script> world',
    );

    expect(html).to.contain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).to.not.contain('<script>');
  });

  it('returns empty string for non-string values', () => {
    expect(renderMarkdownToSafeHtml(null)).to.equal('');
    expect(renderMarkdownToSafeHtml(undefined)).to.equal('');
    expect(renderMarkdownToSafeHtml(42)).to.equal('');
  });
});
