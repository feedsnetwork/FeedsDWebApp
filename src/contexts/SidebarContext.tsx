import React, { useState, createContext, Dispatch } from 'react';
type SidebarContext = {
  sidebarToggle: any;
  walletAddress: any;
  publishPostNumber: number;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setWalletAddress: Dispatch<any>;
  setPublishPostNumber: Dispatch<any>;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SidebarContext = createContext<SidebarContext>(
  {} as SidebarContext
);

export const SidebarProvider = (props) => {
  
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [publishPostNumber, setPublishPostNumber] = useState(0);

  const toggleSidebar = () => {
    setSidebarToggle(!sidebarToggle);
  };
  const closeSidebar = () => {
    setSidebarToggle(false);
  };
  return (
    <SidebarContext.Provider
      value={{ 
        sidebarToggle, 
        walletAddress,
        publishPostNumber,
        toggleSidebar, 
        closeSidebar, 
        setWalletAddress,
        setPublishPostNumber,
      }}
    >
      {props.children}
    </SidebarContext.Provider>
  );
};
