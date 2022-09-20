import { FC, useState, createContext, Dispatch } from 'react';
type SidebarContext = {
  sidebarToggle: any;
  selfChannels: any;
  subscribedChannels: any;
  focusedChannelId: number;
  selectedChannel: any;
  walletAddress: any;
  publishPostNumber: number;
  postsInHome: any;
  postsInSelf: any;
  myAvatar: any;
  userInfo: any;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setSelfChannels: Dispatch<any>;
  setSubscribedChannels: Dispatch<any>;
  setFocusChannelId: Dispatch<any>;
  setSelectChannel: Dispatch<any>;
  setWalletAddress: Dispatch<any>;
  setPublishPostNumber: Dispatch<any>;
  setPostsInHome: Dispatch<any>;
  setPostsInSelf: Dispatch<any>;
  setMyAvatar: Dispatch<any>;
  setUserInfo: Dispatch<any>;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SidebarContext = createContext<SidebarContext>(
  {} as SidebarContext
);

export const SidebarProvider: FC = ({ children }) => {
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const [selfChannels, setSelfChannels] = useState([]);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [focusedChannelId, setFocusChannelId] = useState(null);
  const [selectedChannel, setSelectChannel] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [publishPostNumber, setPublishPostNumber] = useState(0);
  const [postsInHome, setPostsInHome] = useState([]);
  const [postsInSelf, setPostsInSelf] = useState({});
  const [myAvatar, setMyAvatar] = useState('');
  const [userInfo, setUserInfo] = useState('');

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
        subscribedChannels, 
        focusedChannelId, 
        selectedChannel,
        walletAddress,
        publishPostNumber,
        postsInHome,
        postsInSelf,
        myAvatar,
        userInfo,
        toggleSidebar, 
        closeSidebar, 
        setSelfChannels, 
        setSubscribedChannels, 
        setFocusChannelId, 
        setSelectChannel,
        setWalletAddress,
        setPublishPostNumber,
        setPostsInHome,
        setPostsInSelf,
        setMyAvatar,
        setUserInfo
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
