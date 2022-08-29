import { FC, useState, createContext, Dispatch } from 'react';
type SidebarContext = {
  sidebarToggle: any;
  selfChannels: any;
  focusedChannelId: number;
  selectedChannel: any;
  walletAddress: any;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setSelfChannels: Dispatch<any>;
  setFocusChannelId: Dispatch<any>;
  setSelectChannel: Dispatch<any>;
  setWalletAddress: Dispatch<any>;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SidebarContext = createContext<SidebarContext>(
  {} as SidebarContext
);

export const SidebarProvider: FC = ({ children }) => {
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const [selfChannels, setSelfChannels] = useState([]);
  const [focusedChannelId, setFocusChannelId] = useState(null);
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
        selfChannels, 
        focusedChannelId, 
        selectedChannel,
        walletAddress,
        toggleSidebar, 
        closeSidebar, 
        setSelfChannels, 
        setFocusChannelId, 
        setSelectChannel,
        setWalletAddress
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
