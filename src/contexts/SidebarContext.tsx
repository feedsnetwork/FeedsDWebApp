import React, { useState, createContext, Dispatch } from 'react';
type SidebarContext = {
  sidebarToggle: any;
  selfChannels: any;
  subscribedChannels: any;
  selectedChannel: any;
  walletAddress: any;
  publishPostNumber: number;
  postsInSelf: any;
  postsInSubs: any;
  subscriberInfo: any;
  myAvatar: any;
  userInfo: any;
  queryStep: any;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setSelfChannels: Dispatch<any>;
  setSubscribedChannels: Dispatch<any>;
  setSelectChannel: Dispatch<any>;
  setWalletAddress: Dispatch<any>;
  setPublishPostNumber: Dispatch<any>;
  setPostsInSelf: Dispatch<any>;
  setPostsInSubs: Dispatch<any>;
  setSubscriberInfo: Dispatch<any>;
  setMyAvatar: Dispatch<any>;
  setUserInfo: Dispatch<any>;
  setQueryStep: Dispatch<any>;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SidebarContext = createContext<SidebarContext>(
  {} as SidebarContext
);

export const SidebarProvider = (props) => {
  
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const [selfChannels, setSelfChannels] = useState([]);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [selectedChannel, setSelectChannel] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [publishPostNumber, setPublishPostNumber] = useState(0);
  const [postsInSelf, setPostsInSelf] = useState({});
  const [postsInSubs, setPostsInSubs] = useState({});
  const [myAvatar, setMyAvatar] = useState('');
  const [subscriberInfo, setSubscriberInfo] = useState({});
  const [userInfo, setUserInfo] = useState('');
  const [queryStep, setQueryStep] = useState(0);

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
        selectedChannel,
        walletAddress,
        publishPostNumber,
        postsInSelf,
        postsInSubs,
        myAvatar,
        subscriberInfo,
        userInfo,
        queryStep,
        toggleSidebar, 
        closeSidebar, 
        setSelfChannels, 
        setSubscribedChannels, 
        setSelectChannel,
        setWalletAddress,
        setPublishPostNumber,
        setPostsInSelf,
        setPostsInSubs,
        setSubscriberInfo,
        setMyAvatar,
        setUserInfo,
        setQueryStep
      }}
    >
      {props.children}
    </SidebarContext.Provider>
  );
};
