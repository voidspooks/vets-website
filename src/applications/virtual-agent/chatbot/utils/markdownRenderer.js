import DOMPurify from 'dompurify';
import MarkdownIt from 'markdown-it';

const markdownRenderer = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: false,
});

const getLinkTargetAttributes = href => {
  if (typeof href !== 'string') {
    return [];
  }

  const normalizedHref = href.trim().toLowerCase();
  const isHttpLink =
    normalizedHref.startsWith('http://') ||
    normalizedHref.startsWith('https://');

  return isHttpLink
    ? [['target', '_blank'], ['rel', 'noopener noreferrer']]
    : [];
};

const LINK_OPEN = 'link_open';

const defaultLinkOpenRenderer =
  markdownRenderer.renderer.rules[LINK_OPEN] ||
  ((tokens, idx, options, env, self) => {
    return self.renderToken(tokens, idx, options);
  });

markdownRenderer.renderer.rules[LINK_OPEN] = (
  tokens,
  idx,
  options,
  env,
  self,
) => {
  const hrefAttribute = tokens[idx].attrs?.find(([key]) => key === 'href');
  const hrefValue = hrefAttribute?.[1];

  getLinkTargetAttributes(hrefValue).forEach(([key, value]) => {
    tokens[idx].attrSet(key, value);
  });

  return defaultLinkOpenRenderer(tokens, idx, options, env, self);
};

const SANITIZE_OPTIONS = {
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOWED_TAGS: [
    'a',
    'blockquote',
    'br',
    'code',
    'em',
    'li',
    'ol',
    'p',
    'pre',
    'strong',
    'ul',
  ],
};

export const renderMarkdownToSafeHtml = markdown => {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  const renderedHtml = markdownRenderer.render(markdown);
  return DOMPurify.sanitize(renderedHtml, SANITIZE_OPTIONS);
};

export default markdownRenderer;
