import set from 'platform/utilities/data/set';
import get from 'platform/utilities/data/get';
import { ARRAY_PATH, NEW_CONDITION_OPTION } from '../../../constants';

const isNewConditionItem = item =>
  item?.ratedDisability === NEW_CONDITION_OPTION ||
  (!item?.ratedDisability && !!item?.condition);

const isIncreaseItem = item => {
  const v = item?.ratedDisability;
  return !!v && v !== NEW_CONDITION_OPTION;
};

const isMeaningfulItem = item =>
  isNewConditionItem(item) || isIncreaseItem(item);

export const computeClaimTypeFromItems = (items = []) => ({
  'view:claimingNew': items.some(isNewConditionItem),
  'view:claimingIncrease': items.some(isIncreaseItem),
});

export const updateClaimTypeFromArray = (_oldData, newData) => {
  const items = get(ARRAY_PATH, newData);
  if (!Array.isArray(items)) return newData;

  const meaningfulItems = items.filter(isMeaningfulItem);
  if (items.length > 0 && meaningfulItems.length === 0) {
    return newData;
  }

  const next = computeClaimTypeFromItems(meaningfulItems);
  const curr = newData?.['view:claimType'];

  const same =
    curr?.['view:claimingNew'] === next['view:claimingNew'] &&
    curr?.['view:claimingIncrease'] === next['view:claimingIncrease'];

  return same ? newData : set('view:claimType', next, newData);
};
