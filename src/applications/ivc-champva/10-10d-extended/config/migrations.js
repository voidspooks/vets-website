import set from 'platform/utilities/data/set';

export default [
  // 0 -> 1, flatten certifier relationship data object
  ({ formData, metadata }) => {
    const { relationshipToVeteran } = formData.certifierRelationship ?? {};
    return {
      formData: relationshipToVeteran
        ? set('certifierRelationship', relationshipToVeteran, formData)
        : formData,
      metadata,
    };
  },
];
