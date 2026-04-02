export function formatResponseString(string, stripAll = false) {
  const decodedString = (string ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

  if (stripAll) {
    return decodedString.replace(/[\ue000\ue001]/g, '');
  }

  return decodedString
    .replace(/\ue000/g, '<strong>')
    .replace(/\ue001/g, '</strong>');
}

export function truncateResponseString(string, maxLength) {
  if (string == null) {
    return '';
  }
  if (string.length <= maxLength) {
    return string;
  }
  return `${string.slice(0, maxLength)}...`;
}

export function removeDoubleBars(string) {
  return string.replace(' | Veterans Affairs', '');
}

// Whole token is uppercase (letters/digits; internal . ' ’ - for VA.GOV, U.S.; optional trailing .)
const ALLCAPS_TOKEN = /^[A-Z0-9]+(?:[.'’-][A-Z0-9]+)*\.?$/;

const PARENTHETICAL_ACRONYM = /^\([A-Z0-9]{2,}\)$/;

// In mixed-case titles, Search.gov sometimes sends AND/OR/THE in ALL CAPS; sentence-case them
// so we do not get "VA.gov AND MyHealtheVet".
const ALL_CAPS_GRAMMAR_WORDS = new Set([
  'AND',
  'OR',
  'THE',
  'OF',
  'FOR',
  'IN',
  'ON',
  'AT',
  'TO',
  'AS',
  'AN',
  'BUT',
  'NOR',
  'NOT',
]);

function stripEdgePunctuation(token) {
  return token.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '');
}

function isEntireTokenAllCaps(token) {
  const core = stripEdgePunctuation(token);
  if (!core) return false;
  return ALLCAPS_TOKEN.test(core);
}

function hasIntentionalCaps(token) {
  // Preserve mixed-case words (e.g., "VA.gov", "eBenefits", "MyHealtheVet")
  return /[a-z][A-Z]/.test(token) || /\.[A-Za-z]/.test(token);
}

function isParentheticalAcronymToken(token) {
  return PARENTHETICAL_ACRONYM.test(token);
}

/**
 * Sentence case for search titles:
 * - Title-case words → lowercase (only the first letter of the string is capitalized).
 * - All-caps tokens next to title case are treated as acronyms and stay uppercase (e.g. ABCDE, CHAMPVA).
 * - If the entire string is uppercase (no lowercase letters), lowercase words for sentence case,
 *   but keep (BVA)-style parenthetical acronyms and dotted forms like U.S. / VA.GOV.
 */
export function toSentenceCase(input = '') {
  if (!input) return '';

  const hasAnyLowercase = /[a-z]/.test(input);
  const parts = String(input).split(/(\s+)/);

  const transformed = parts
    .map(part => {
      if (/^\s+$/.test(part)) return part;

      if (hasIntentionalCaps(part)) return part;

      if (hasAnyLowercase) {
        if (isEntireTokenAllCaps(part)) {
          const core = stripEdgePunctuation(part);
          if (ALL_CAPS_GRAMMAR_WORDS.has(core)) return part.toLowerCase();
          return part;
        }
        return part.toLowerCase();
      }

      if (isParentheticalAcronymToken(part)) return part;
      if (isEntireTokenAllCaps(part) && part.includes('.')) return part;
      if (isEntireTokenAllCaps(part)) return part.toLowerCase();

      return part.toLowerCase();
    })
    .join('');

  return transformed.replace(/[A-Za-z]/, match => match.toUpperCase());
}
