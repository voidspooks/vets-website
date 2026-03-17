import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import NeedHelp from '../components/common/NeedHelp';

const CDPLayoutContext = createContext();

export const CDPLayoutProvider = ({ children, showNeedHelp = true }) => {
  return (
    <CDPLayoutContext.Provider value={{}}>
      {/* add breadcrumbs later */}
      {children}
      {showNeedHelp && <NeedHelp />}
    </CDPLayoutContext.Provider>
  );
};

CDPLayoutProvider.propTypes = {
  children: PropTypes.node,
  showNeedHelp: PropTypes.bool,
};

export const useCDPLayout = () => {
  return useContext(CDPLayoutContext);
};
