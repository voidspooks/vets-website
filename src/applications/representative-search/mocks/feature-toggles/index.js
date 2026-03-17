const generateFeatureToggles = (toggles = {}) => {
  const {
    findARepresentativeEnableFrontend = false,
    findARepresentativeEnabled = false,
  } = toggles;

  return {
    data: {
      type: 'feature_toggles',
      features: [
        {
          name: 'find_a_representative_enable_frontend',
          value: findARepresentativeEnableFrontend,
        },
        {
          name: 'find_a_representative_enabled',
          value: findARepresentativeEnabled,
        },
      ],
    },
  };
};

module.exports = { generateFeatureToggles };
