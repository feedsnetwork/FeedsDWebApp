import React, { useState, createContext, Dispatch } from 'react';
type SidebarContext = {
  sidebarToggle: any;
  walletAddress: any;
  publishPostNumber: number;
  needQueryChannel: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setWalletAddress: Dispatch<any>;
  setPublishPostNumber: Dispatch<any>;
  setNeedQueryChannel: Dispatch<any>;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SidebarContext = createContext<SidebarContext>(
  {} as SidebarContext
);

export const SidebarProvider = (props) => {
  const [needQueryChannel, setNeedQueryChannel] = useState(true);
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
        needQueryChannel,
        toggleSidebar, 
        closeSidebar, 
        setWalletAddress,
        setPublishPostNumber,
        setNeedQueryChannel
      }}
    >
      {props.children}
    </SidebarContext.Provider>
  );
};
