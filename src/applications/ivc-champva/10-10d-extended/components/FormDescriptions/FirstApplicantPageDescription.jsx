import PropTypes from 'prop-types';
import useApplicantRoleSync from '../../hooks/useApplicantRoleSync';
import content from '../../locales/en/content.json';

const DESC_TEXT = content['applicants--personal-info-description'];

const FirstApplicantPageDescription = ({ formContext }) => {
  const perItemIndex = Number(formContext.pagePerItemIndex);
  useApplicantRoleSync(perItemIndex);

  return DESC_TEXT;
};

FirstApplicantPageDescription.propTypes = {
  formContext: PropTypes.shape({
    pagePerItemIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
};

export default FirstApplicantPageDescription;
