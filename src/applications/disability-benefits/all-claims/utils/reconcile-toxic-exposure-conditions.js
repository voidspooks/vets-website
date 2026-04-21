import set from 'platform/utilities/data/set';
import omit from 'platform/utilities/data/omit';

import { sippableId } from './index';
import { NULL_CONDITION_STRING } from '../constants';

const TE_CONDITIONS_PATH = 'toxicExposure.conditions';
const PRESERVED_KEYS = ['none'];

const getConditions = formData => formData?.toxicExposure?.conditions;

// Mirrors the id derivation in content/toxicExposure.jsx's
// makeTEConditionsUISchema so the "valid" set stays in lockstep with the
// checkbox options the Veteran actually sees. sippableId is derived from
// the condition name only — sideOfBody is not part of the key.
export const sippableIdForDisability = disability => {
  const condition = disability?.condition;
  if (typeof condition === 'string' && condition.trim() !== '') {
    return sippableId(condition.trim());
  }
  return sippableId(NULL_CONDITION_STRING);
};

const validSippableIdSet = (disabilities = []) =>
  new Set(disabilities.map(sippableIdForDisability));

const removeOrphanKeys = (conditions, validIds) => {
  const orphanKeys = Object.keys(conditions).filter(
    key => !validIds.has(key) && !PRESERVED_KEYS.includes(key),
  );
  if (orphanKeys.length === 0) return conditions;
  return omit(orphanKeys, conditions);
};

// Used by the SiP migration, where there is no prior form state to diff
// against — we can only drop keys that no longer correspond to any current
// newDisabilities entry. Bails out when newDisabilities is missing (e.g.
// prefill data before the Veteran has added conditions) to avoid sweeping
// TE entries that are valid but whose conditions haven't been populated yet.
export const sweepOrphanedTEConditions = formData => {
  const conditions = getConditions(formData);
  if (!conditions) return formData;

  const disabilities = formData?.newDisabilities;
  if (!Array.isArray(disabilities)) return formData;

  const validIds = validSippableIdSet(disabilities);
  const next = removeOrphanKeys(conditions, validIds);
  if (next === conditions) return formData;

  return set(TE_CONDITIONS_PATH, next, formData);
};

// Used at edit time from the V2 conditions summary page. Handles both
// rename (migrates the old sippableId value onto the new one) and delete
// (drops orphaned keys) so the Toxic Exposure conditions page never sees
// stale checkbox state. Renames are collected first and applied atomically
// so a slot swap cannot clobber itself.
export const reconcileToxicExposureConditions = (oldFormData, newFormData) => {
  const conditions = getConditions(newFormData);
  if (!conditions) return newFormData;

  const oldDisabilities = oldFormData?.newDisabilities || [];
  const newDisabilities = newFormData?.newDisabilities || [];

  let next = { ...conditions };
  let changed = false;

  if (oldDisabilities.length === newDisabilities.length) {
    const renames = [];
    for (let i = 0; i < newDisabilities.length; i += 1) {
      const oldId = sippableIdForDisability(oldDisabilities[i]);
      const newId = sippableIdForDisability(newDisabilities[i]);
      if (oldId !== newId && conditions[oldId] !== undefined) {
        renames.push({ oldId, newId, value: conditions[oldId] });
      }
    }
    if (renames.length > 0) {
      renames.forEach(({ oldId }) => {
        delete next[oldId];
      });
      renames.forEach(({ newId, value }) => {
        next[newId] = value;
      });
      changed = true;
    }
  }

  const validIds = validSippableIdSet(newDisabilities);
  const swept = removeOrphanKeys(next, validIds);
  if (swept !== next) {
    next = swept;
    changed = true;
  }

  if (!changed) return newFormData;
  return set(TE_CONDITIONS_PATH, next, newFormData);
};
