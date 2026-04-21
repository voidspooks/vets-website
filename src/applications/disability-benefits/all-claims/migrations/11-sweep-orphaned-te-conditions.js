/**
 * Prior to this migration, the new conditions workflow (V2) summary page
 * did not reconcile toxicExposure.conditions with newDisabilities when a
 * Veteran revised or deleted a condition. Resumed forms could land on the
 * Toxic Exposure conditions page with orphaned <sippableId>: true entries
 * that prevented the user from selecting "I'm not claiming any conditions
 * related to toxic exposure" — the hidden orphan and the "none" selection
 * both tripped noneAndConditionError.
 *
 * This migration reconciles SiP payloads in place by dropping any
 * toxicExposure.conditions key that does not match the sippableId of a
 * current newDisabilities entry. The "none" key is preserved.
 */
import { sweepOrphanedTEConditions } from '../utils/reconcile-toxic-exposure-conditions';

export default function sweepOrphanedToxicExposureConditions(savedData) {
  return {
    ...savedData,
    formData: sweepOrphanedTEConditions(savedData.formData),
  };
}
