import { setData } from 'platform/forms-system/src/js/actions';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const VIEW_FIELD = 'view:certifierRole';
const APPLICANT = 'applicant';

const hasOwn = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj || {}, key);

/**
 * Keeps the first applicant's `view:certifierRole` in sync when:
 * - the current per-item page index is 0, and
 * - `formData.certifierRole` is `'applicant'`, and
 * - `formData.applicants[0].view:certifierRole` is not already set.
 *
 * @param {number} perItemIndex Current page-per-item index from form context.
 * @returns {void}
 */
const useApplicantRoleSync = perItemIndex => {
  const dispatch = useDispatch();
  const formData = useSelector(state => state.form.data);

  useEffect(
    () => {
      if (perItemIndex !== 0) return;

      const certifierRole = formData?.certifierRole;
      if (certifierRole !== APPLICANT) return;

      const applicants = Array.isArray(formData?.applicants)
        ? formData.applicants
        : [];

      const firstApplicant = applicants[0] || {};
      if (hasOwn(firstApplicant, VIEW_FIELD)) return;

      const updatedApplicants = [...applicants];
      updatedApplicants[0] = {
        ...firstApplicant,
        [VIEW_FIELD]: APPLICANT,
      };

      dispatch(setData({ ...formData, applicants: updatedApplicants }));
    },
    [dispatch, formData, perItemIndex],
  );
};

export default useApplicantRoleSync;
