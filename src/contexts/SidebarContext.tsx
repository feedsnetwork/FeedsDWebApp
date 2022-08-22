import { FC, useState, createContext, Dispatch } from 'react';
type SidebarContext = {
  sidebarToggle: any;
  focusedChannel: any;
  selectedChannel: any;
  walletAddress: any;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setFocusChannel: Dispatch<any>;
  setSelectChannel: Dispatch<any>;
  setWalletAddress: Dispatch<any>;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SidebarContext = createContext<SidebarContext>(
  {} as SidebarContext
);

export const SidebarProvider: FC = ({ children }) => {
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const [focusedChannel, setFocusChannel] = useState(null);
  const [selectedChannel, setSelectChannel] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

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
        focusedChannel, 
        selectedChannel,
        walletAddress,
        toggleSidebar, 
        closeSidebar, 
        setFocusChannel, 
        setSelectChannel,
        setWalletAddress
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
