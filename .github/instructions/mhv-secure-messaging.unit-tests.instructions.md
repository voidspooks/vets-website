---
applyTo: "src/applications/mhv-secure-messaging/tests/{actions,components,containers,hooks,reducers,util}/**"
---

# MHV Secure Messaging — Unit Test Patterns

## Test Utilities (`util/testUtils.js`)

**CRITICAL**: Use these helpers for all web component interactions in tests — web components use shadow DOM and custom events that standard RTL methods don't handle.

| Helper | Purpose |
|---|---|
| `inputVaTextInput(container, value, selector)` | Set value on `va-text-input` and dispatch `input` event |
| `selectVaSelect(container, value, selector)` | Trigger `vaSelect` event on `va-select` |
| `comboBoxVaSelect(container, value, selector)` | Handle `va-combo-box` selection |
| `checkVaCheckbox(checkboxGroup, bool)` | Toggle `va-checkbox` |
| `getProps(element)` | Get React props from element |

## Rendering Components

Use `renderWithStoreAndRouter` from platform testing:

```javascript
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';

renderWithStoreAndRouter(<Component />, {
  initialState: { sm: { /* state */ } },
  reducers: reducer,
  path: '/messages',
});
```

## Store Setup

Create Redux store with combined reducers. Must include `commonReducer` for feature flags:

```javascript
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { commonReducer } from 'platform/startup/store';

const store = createStore(
  combineReducers({ ...reducer, commonReducer }),
  initialState,
  applyMiddleware(thunk),
);
```

## Mocking & Stubbing with Sinon

### Sandbox Pattern (Recommended)

```javascript
import sinon from 'sinon';

describe('MyComponent', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore(); // Automatically restores all stubs/spies
  });

  it('tests something', () => {
    const mySpy = sandbox.spy(myModule, 'myFunction');
    const myStub = sandbox.stub(myModule, 'otherFunction').returns('value');
    // ...
  });
});
```

### API Mocking

```javascript
import { mockApiRequest } from '@department-of-veterans-affairs/platform-testing/helpers';

mockApiRequest(responseData);           // Success
mockApiRequest({}, false);              // Error
mockApiRequest({ method: 'POST', data: {}, status: 200 }); // Custom
```

### Common Stub Targets

- `sandbox.stub(SmApi, 'getFolder').resolves(mockData)` — API functions
- `sandbox.stub(useFeatureToggles, 'default').returns({ ... })` — feature flags
- `sandbox.spy(datadogRum, 'addAction')` — Datadog tracking
- `sandbox.stub(window, 'print')` — browser APIs
- `sandbox.spy(history, 'push')` — router navigation

### CRITICAL: Always Restore Stubs

- Use sandbox pattern for automatic restoration
- If using manual stubs, restore in `afterEach()`: `myStub.restore()`
- Check before restoring: `if (stub && stub.restore) stub.restore()`

## Assertions

- Use chai `expect()` for assertions
- Mocha for test structure (`describe`, `it`, `beforeEach`, `afterEach`)
- Sinon spy assertions: `expect(spy.calledOnce).to.be.true`, `expect(spy.calledWith(args)).to.be.true`
- Attribute assertions: `expect(element).to.have.attribute('error', 'Error message')`

## Fixtures

- Located in `tests/fixtures/` directory
- JSON files for mock API responses
- Import pattern: `import mockData from '../fixtures/data.json'`

## Testing with Feature Flags

Set feature flags in test store's initial state:

```javascript
const initialState = {
  featureToggles: {
    customFoldersRedesignEnabled: true,
  },
  sm: { /* ... */ },
};
```

Include `commonReducer` in combined reducers (it holds feature toggle state).

## Testing RouterLink / RouterLinkAction

Validate navigation by checking `history.location.pathname` after click:

```javascript
const { container, history } = renderWithStoreAndRouter(
  <RouterLink href="/inbox" text="Go to inbox" />,
  { initialState, reducers: reducer, path: '/messages' }
);
const link = container.querySelector('va-link');
link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
expect(history.location.pathname).to.equal('/inbox');
```

## Testing with Real Timers (setTimeout / setInterval)

**When to use:** Testing components that use `setTimeout` or `setInterval` for delayed state updates.

**Pattern:** Use real timers with `waitFor` and extended `timeout` — do NOT use `sinon.useFakeTimers()`.

```javascript
// ✅ CORRECT — real timers with extended waitFor
await waitFor(
  () => {
    const srSpan = container.querySelector('span[aria-live="polite"]');
    expect(srSpan.textContent).to.equal(expectedText);
  },
  { timeout: 4000 }, // must exceed the component's setTimeout delay
);
```

**Anti-pattern:**
```javascript
// ❌ sinon.useFakeTimers() breaks React state updates — setState calls
// inside setTimeout callbacks never flush, causing assertions to fail silently
const clock = sinon.useFakeTimers();
clock.tick(3000);
// React state is stale — the component never re-rendered
```

**Why:** `sinon.useFakeTimers()` replaces the global timer functions, which prevents React's internal scheduler from flushing state updates triggered inside `setTimeout` callbacks. Tests appear to pass but assertions run against stale DOM.

## Disambiguating `getByText` with sr-only Spans

When a component renders the same text in both a visual element and an `aria-live` sr-only span, `getByText(text)` will find multiple elements once the sr-only content populates. Use `data-testid` selectors to disambiguate:

```javascript
// ✅ Unambiguous — targets the visual <p> only
const alertText = container.querySelector('[data-testid="alert-text"]');
expect(alertText.textContent).to.equal(expectedContent);

// ✅ Or use getByText with selector option
expect(screen.getByText(content, { selector: '[data-testid="alert-text"]' })).to.exist;

// ❌ Fragile once sr-only span populates with matching text
expect(screen.getByText(content)).to.exist; // "Found multiple elements"
```

## Stubbing SmApi Functions in Components

**When to use:** Testing a component that calls SmApi functions directly (not via Redux actions).

When a component imports SmApi functions via `import * as SmApi from '../../api/SmApi'` and calls them as `SmApi.getTooltipsList()`, Sinon stubs on the namespace object (`sandbox.stub(SmApi, 'getTooltipsList')`) will intercept the calls.

However, if a component uses a **named import** (`import { getThreadList } from '../../api/SmApi'`) and calls the function directly, Sinon stubs on the SmApi namespace may not intercept it — the named import captures a direct binding at module load time.

**Pattern:** Use dynamic import inside `useEffect` for functions that need to be stubbable:

```javascript
// ✅ Component — stubbable via sandbox.stub(SmApi, 'getThreadList')
const { getThreadList } = await import('../../api/SmApi');
const response = await getThreadList({ folderId: 0 });
```

**Anti-pattern:**
```javascript
// ❌ Static named import — stub may not intercept
import { getThreadList } from '../../api/SmApi';
const response = await getThreadList({ folderId: 0 });
// sandbox.stub(SmApi, 'getThreadList') does NOT intercept this
```

**Why:** Discovered in #138299 — switching `getThreadList` from dynamic to static import caused the "finds and stores message ID" test to fail because the stub was not intercepted.

## `createStore` initialState Pitfall

**When to use:** Writing reducer unit tests with `createStore`.

Passing `{}` as the `initialState` argument to `createStore` overrides the reducer's default state, causing assertions against default values to fail.

**Pattern:**
```javascript
// ✅ Let reducer use its own defaults
const mockStore = (initialState) => {
  return createStore(myReducer, initialState, applyMiddleware(thunk));
};
const store = mockStore();        // initialState is undefined → reducer defaults used
```

**Anti-pattern:**
```javascript
// ❌ Empty object overrides reducer defaults
const mockStore = (initialState = {}) => {
  return createStore(myReducer, initialState, applyMiddleware(thunk));
};
const store = mockStore();        // initialState is {} → reducer defaults lost
```

**Why:** Caught in #138299 — `createStore(reducer, {})` made the reducer return `{}` instead of its `initialState` object, causing `deep.equal` assertions to fail.

## File Naming Convention

- Unit tests: `ComponentName.unit.spec.jsx` or `helperName.unit.spec.js`
- Place tests in mirrored directory structure under `tests/`
