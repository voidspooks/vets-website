import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  getTooltipByName,
  createNewTooltip,
  incrementTooltip,
  updateTooltipVisibility,
} from '../actions/tooltip';

const MAX_IPE_VIEWS = 3;

/**
 * Manages the IPE tooltip lifecycle shared by dismissible alert components:
 * fetch-or-create the named tooltip, track visibility and id in local state,
 * increment the view counter when the tooltip is visible (up to maxViews),
 * and hide it on demand.
 *
 * Visibility and id are kept in local hook state (not Redux) so that multiple
 * mounted alerts remain isolated — stale global state from a prior navigation
 * cannot bleed into an unrelated alert.
 *
 * @param {string} tooltipName - Name key used to look up or create the tooltip
 * @param {Object} [options]
 * @param {boolean} [options.skip=false] - Skip the fetch/create effect entirely
 *   (use when the alert cannot be shown and view counts should not be inflated)
 * @param {number} [options.maxViews=MAX_IPE_VIEWS] - Auto-hide the tooltip after
 *   this many views. Pass Infinity to disable auto-hiding.
 * @returns {{ tooltipVisible: boolean, tooltipId: string|undefined, dismiss: Function }}
 */
const useTooltipLifecycle = (
  tooltipName,
  { skip = false, maxViews = MAX_IPE_VIEWS } = {},
) => {
  const dispatch = useDispatch();
  const [tooltip, setTooltipState] = useState({
    visible: false,
    id: undefined,
  });

  useEffect(
    () => {
      if (skip) return undefined;

      let cancelled = false;

      const fetchOrCreateTooltip = async () => {
        const existing = await dispatch(getTooltipByName(tooltipName));
        if (cancelled) return;

        if (existing?.id) {
          if (!existing.hidden && existing.counter >= maxViews) {
            dispatch(updateTooltipVisibility(existing.id));
            return;
          }
          setTooltipState({ visible: !existing.hidden, id: existing.id });
          if (!existing.hidden) {
            dispatch(incrementTooltip(existing.id));
          }
        } else if (!existing) {
          const created = await dispatch(createNewTooltip(tooltipName));
          if (cancelled) return;
          if (created?.id) {
            setTooltipState({ visible: !created.hidden, id: created.id });
            if (!created.hidden) {
              dispatch(incrementTooltip(created.id));
            }
          }
        }
      };

      fetchOrCreateTooltip();
      return () => {
        cancelled = true;
      };
    },
    [dispatch, tooltipName, skip, maxViews],
  );

  const dismiss = useCallback(
    () => {
      if (tooltip.id) {
        dispatch(updateTooltipVisibility(tooltip.id));
        setTooltipState(prev => ({ ...prev, visible: false }));
      }
    },
    [dispatch, tooltip.id],
  );

  return { tooltipVisible: tooltip.visible, tooltipId: tooltip.id, dismiss };
};

export default useTooltipLifecycle;
