import React from 'react';
import { expect } from 'chai';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import sinon from 'sinon';
import { MemoryRouter } from 'react-router-dom-v5-compat';

import * as UserSelectors from '@department-of-veterans-affairs/platform-user/selectors';
import SelectPreferenceView from '../../../components/SelectPreferenceView';
import * as MilestoneActions from '../../../actions/ch31-case-milestones';
import {
  CH31_CASE_MILESTONES_RESET_STATE,
  MILESTONE_COMPLETION_TYPES,
  YOUTUBE_ORIENTATION_VIDEO_URL,
} from '../../../constants';

// Mirror the private constants so test values always stay in sync with the component.
const ORIENTATION_TYPE = {
  WATCH_VIDEO: 'Watch the VA orientation video online',
  COMPLETE_DURING_MEETING:
    'Watch the VA orientation video during the initial evaluation counselor meeting ',
};

const sandbox = sinon.createSandbox();

const makeStore = state => {
  const dispatch = sandbox.spy();
  return {
    getState: () => state || {},
    subscribe: () => () => {},
    dispatch,
  };
};

const renderWithProviders = (ui, state = {}) => {
  const store = makeStore(state);
  const result = render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
  );
  return { ...result, store };
};

/**
 * Fires vaValueChange on the va-radio host element.
 * va-radio is a shadow DOM component so we dispatch directly on the host
 * and rely on the React binding's listener rather than event bubbling.
 */
function selectVaRadio(container, value) {
  const vaRadio = container.querySelector('va-radio');
  fireEvent(
    vaRadio,
    new CustomEvent('vaValueChange', {
      detail: { value },
      bubbles: true,
      composed: true,
    }),
  );
}

/**
 * Fires vaChange on the va-checkbox host element.
 * The component handler reads e.target.checked, so we set the property
 * on the element before dispatching — shadow DOM means there is no inner
 * <input> accessible from outside the shadow root.
 */
function changeVaCheckbox(container, checked) {
  const vaCheckbox = container.querySelector('va-checkbox');
  vaCheckbox.checked = checked;
  fireEvent(
    vaCheckbox,
    new CustomEvent('vaChange', {
      bubbles: true,
      composed: true,
    }),
  );
}

describe('SelectPreferenceView', () => {
  beforeEach(() => {
    sandbox.stub(UserSelectors, 'selectUser').returns({ uuid: 'user-123' });
    sandbox
      .stub(MilestoneActions, 'submitCh31CaseMilestones')
      .callsFake(({ milestoneCompletionType, postpone, user }) => ({
        type: 'SUBMIT_CH31_CASE_MILESTONES',
        payload: { milestoneCompletionType, postpone, user },
      }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  // ---------------------------------------------------------------------------
  // Initial render
  // ---------------------------------------------------------------------------

  it('renders the va-radio group with the correct label', () => {
    const { container } = renderWithProviders(<SelectPreferenceView />, {
      ch31CaseMilestones: { loading: false, error: null },
    });

    const vaRadio = container.querySelector('va-radio');
    expect(vaRadio).to.exist;
    expect(vaRadio.getAttribute('label')).to.equal(
      'How would you like to complete the orientation?',
    );
  });

  it('renders both radio options with the correct values', () => {
    const { container } = renderWithProviders(<SelectPreferenceView />, {
      ch31CaseMilestones: { loading: false, error: null },
    });

    const options = container.querySelectorAll('va-radio-option');
    expect(options).to.have.lengthOf(2);
    expect(options[0].getAttribute('value')).to.equal(
      ORIENTATION_TYPE.COMPLETE_DURING_MEETING,
    );
    expect(options[1].getAttribute('value')).to.equal(
      ORIENTATION_TYPE.WATCH_VIDEO,
    );
  });

  it('does not show the video content before any selection is made', () => {
    const { container } = renderWithProviders(<SelectPreferenceView />, {
      ch31CaseMilestones: { loading: false, error: null },
    });

    expect(container.querySelector('va-link')).to.not.exist;
    expect(container.querySelector('va-checkbox')).to.not.exist;
  });

  it('always renders the submit button', () => {
    const { container } = renderWithProviders(<SelectPreferenceView />, {
      ch31CaseMilestones: { loading: false, error: null },
    });

    expect(container.querySelector('va-button')).to.exist;
  });

  // ---------------------------------------------------------------------------
  // Watch-video selection
  // ---------------------------------------------------------------------------

  it('shows the YouTube video link when the watch-video option is selected', async () => {
    const { container } = renderWithProviders(<SelectPreferenceView />, {
      ch31CaseMilestones: { loading: false, error: null },
    });

    selectVaRadio(container, ORIENTATION_TYPE.WATCH_VIDEO);

    await waitFor(() => {
      const vaLink = container.querySelector('va-link');
      expect(vaLink).to.exist;
      expect(vaLink.getAttribute('href')).to.equal(
        YOUTUBE_ORIENTATION_VIDEO_URL,
      );
    });
  });

  it('shows the attestation checkbox when the watch-video option is selected', async () => {
    const { container } = renderWithProviders(<SelectPreferenceView />, {
      ch31CaseMilestones: { loading: false, error: null },
    });

    selectVaRadio(container, ORIENTATION_TYPE.WATCH_VIDEO);

    await waitFor(() => {
      expect(container.querySelector('va-checkbox')).to.exist;
    });
  });

  it('hides the video content when switching back to the in-meeting option', async () => {
    const { container } = renderWithProviders(<SelectPreferenceView />, {
      ch31CaseMilestones: { loading: false, error: null },
    });

    selectVaRadio(container, ORIENTATION_TYPE.WATCH_VIDEO);
    await waitFor(() => expect(container.querySelector('va-link')).to.exist);

    selectVaRadio(container, ORIENTATION_TYPE.COMPLETE_DURING_MEETING);

    await waitFor(() => {
      expect(container.querySelector('va-link')).to.not.exist;
      expect(container.querySelector('va-checkbox')).to.not.exist;
    });
  });

  // ---------------------------------------------------------------------------
  // Checkbox validation
  // ---------------------------------------------------------------------------

  it('shows a checkbox error when submitting without attestation on the watch-video path', async () => {
    const { container } = renderWithProviders(<SelectPreferenceView />, {
      ch31CaseMilestones: { loading: false, error: null },
    });

    selectVaRadio(container, ORIENTATION_TYPE.WATCH_VIDEO);
    await waitFor(
      () => expect(container.querySelector('va-checkbox')).to.exist,
    );

    fireEvent.click(container.querySelector('va-button'));

    await waitFor(() => {
      expect(
        container.querySelector('va-checkbox').getAttribute('error'),
      ).to.equal(
        'You must acknowledge and attest that you have watched the video.',
      );
    });
  });

  it('clears the checkbox error once the checkbox is checked', async () => {
    const { container } = renderWithProviders(<SelectPreferenceView />, {
      ch31CaseMilestones: { loading: false, error: null },
    });

    selectVaRadio(container, ORIENTATION_TYPE.WATCH_VIDEO);
    await waitFor(
      () => expect(container.querySelector('va-checkbox')).to.exist,
    );

    // Produce the error state first.
    fireEvent.click(container.querySelector('va-button'));
    await waitFor(() => {
      expect(container.querySelector('va-checkbox').getAttribute('error')).to
        .exist;
    });

    changeVaCheckbox(container, true);

    await waitFor(() => {
      expect(container.querySelector('va-checkbox').getAttribute('error')).to.be
        .null;
    });
  });

  it('clears the checkbox error when the radio selection changes', async () => {
    const { container } = renderWithProviders(<SelectPreferenceView />, {
      ch31CaseMilestones: { loading: false, error: null },
    });

    selectVaRadio(container, ORIENTATION_TYPE.WATCH_VIDEO);
    await waitFor(
      () => expect(container.querySelector('va-checkbox')).to.exist,
    );

    fireEvent.click(container.querySelector('va-button'));
    await waitFor(() => {
      expect(container.querySelector('va-checkbox').getAttribute('error')).to
        .exist;
    });

    // Switching selection should reset internal state (and unmount the checkbox).
    selectVaRadio(container, ORIENTATION_TYPE.COMPLETE_DURING_MEETING);

    await waitFor(() => {
      expect(container.querySelector('va-checkbox')).to.not.exist;
    });
  });

  // ---------------------------------------------------------------------------
  // Dispatch behaviour
  // ---------------------------------------------------------------------------

  it('dispatches submit with postpone: true for the in-person meeting path', () => {
    const state = { ch31CaseMilestones: { loading: false, error: null } };
    const sharedStore = makeStore(state);

    const { container } = render(
      <Provider store={sharedStore}>
        <MemoryRouter>
          <SelectPreferenceView />
        </MemoryRouter>
      </Provider>,
    );

    selectVaRadio(container, ORIENTATION_TYPE.COMPLETE_DURING_MEETING);
    fireEvent.click(container.querySelector('va-button'));

    expect(
      sharedStore.dispatch.calledWith({
        type: 'SUBMIT_CH31_CASE_MILESTONES',
        payload: {
          milestoneCompletionType: MILESTONE_COMPLETION_TYPES.STEP_3,
          postpone: true,
          user: { uuid: 'user-123' },
        },
      }),
    ).to.be.true;
  });

  it('dispatches submit with postpone: false when the video is attested', async () => {
    const state = { ch31CaseMilestones: { loading: false, error: null } };
    const sharedStore = makeStore(state);

    const { container } = render(
      <Provider store={sharedStore}>
        <MemoryRouter>
          <SelectPreferenceView />
        </MemoryRouter>
      </Provider>,
    );

    selectVaRadio(container, ORIENTATION_TYPE.WATCH_VIDEO);
    await waitFor(
      () => expect(container.querySelector('va-checkbox')).to.exist,
    );

    changeVaCheckbox(container, true);
    fireEvent.click(container.querySelector('va-button'));

    expect(
      sharedStore.dispatch.calledWith({
        type: 'SUBMIT_CH31_CASE_MILESTONES',
        payload: {
          milestoneCompletionType: MILESTONE_COMPLETION_TYPES.STEP_3,
          postpone: false,
          user: { uuid: 'user-123' },
        },
      }),
    ).to.be.true;
  });

  it('does not dispatch submit when watch-video is selected without attestation', async () => {
    const state = { ch31CaseMilestones: { loading: false, error: null } };
    const sharedStore = makeStore(state);

    const { container } = render(
      <Provider store={sharedStore}>
        <MemoryRouter>
          <SelectPreferenceView />
        </MemoryRouter>
      </Provider>,
    );

    selectVaRadio(container, ORIENTATION_TYPE.WATCH_VIDEO);
    await waitFor(
      () => expect(container.querySelector('va-checkbox')).to.exist,
    );

    fireEvent.click(container.querySelector('va-button'));

    expect(
      sharedStore.dispatch.calledWith({
        type: 'SUBMIT_CH31_CASE_MILESTONES',
      }),
    ).to.be.false;
  });

  it('dispatches CH31_CASE_MILESTONES_RESET_STATE on radio change', () => {
    const state = { ch31CaseMilestones: { loading: false, error: null } };
    const sharedStore = makeStore(state);

    const { container } = render(
      <Provider store={sharedStore}>
        <MemoryRouter>
          <SelectPreferenceView />
        </MemoryRouter>
      </Provider>,
    );

    selectVaRadio(container, ORIENTATION_TYPE.WATCH_VIDEO);

    expect(
      sharedStore.dispatch.calledWith({
        type: CH31_CASE_MILESTONES_RESET_STATE,
      }),
    ).to.be.true;
  });

  it('dispatches CH31_CASE_MILESTONES_RESET_STATE when the checkbox changes', async () => {
    const state = { ch31CaseMilestones: { loading: false, error: null } };
    const sharedStore = makeStore(state);

    const { container } = render(
      <Provider store={sharedStore}>
        <MemoryRouter>
          <SelectPreferenceView />
        </MemoryRouter>
      </Provider>,
    );

    selectVaRadio(container, ORIENTATION_TYPE.WATCH_VIDEO);
    await waitFor(
      () => expect(container.querySelector('va-checkbox')).to.exist,
    );

    changeVaCheckbox(container, true);

    expect(
      sharedStore.dispatch.calledWith({
        type: CH31_CASE_MILESTONES_RESET_STATE,
      }),
    ).to.be.true;
  });

  // ---------------------------------------------------------------------------
  // Error and loading states
  // ---------------------------------------------------------------------------

  it('renders an error alert when ch31CaseMilestonesState has an error', () => {
    const { container } = renderWithProviders(<SelectPreferenceView />, {
      ch31CaseMilestones: { loading: false, error: true },
    });

    const alert = container.querySelector('va-alert');
    expect(alert).to.exist;
    expect(alert.getAttribute('status')).to.equal('error');
  });

  it('does not render an error alert when there is no error', () => {
    const { container } = renderWithProviders(<SelectPreferenceView />, {
      ch31CaseMilestones: { loading: false, error: null },
    });

    expect(container.querySelector('va-alert')).to.not.exist;
  });

  it('passes the loading attribute to the submit button while the request is in flight', () => {
    const { container } = renderWithProviders(<SelectPreferenceView />, {
      ch31CaseMilestones: { loading: true, error: null },
    });

    const btn = container.querySelector('va-button');
    // VaButton is a shadow DOM component; the React binding forwards the
    // boolean prop as an attribute on the host element.
    expect(btn.getAttribute('loading')).to.not.be.null;
  });
});
