import { FC, useState, createContext, Dispatch } from 'react';
type OverPageContext = {
  pageType: string;
  openAddChannelView: () => void;
  closeOverPage: () => void;
  setPageType: Dispatch<any>;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OverPageContext = createContext<OverPageContext>(
  {} as OverPageContext
);

export const OverPageProvider: FC<React.PropsWithChildren> = (props) => {
  const [pageType, setPageType] = useState('');
  const openAddChannelView = () => {
    setPageType('AddChannel');
  };
  const closeOverPage = () => {
    setPageType('');
  };

  return (
    <OverPageContext.Provider
      value={{ pageType, openAddChannelView, closeOverPage, setPageType }}
    >
      {props.children}
    </OverPageContext.Provider>
  );
};
