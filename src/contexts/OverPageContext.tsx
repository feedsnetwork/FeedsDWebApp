import { FC, useState, createContext } from 'react';
type OverPageContext = {
  isAddChannelView: boolean;
  openAddChannelView: () => void;
  closeAddChannelView: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const OverPageContext = createContext<OverPageContext>(
  {} as OverPageContext
);

export const OverPageProvider: FC = ({ children }) => {
  const [isAddChannelView, setAddChannelView] = useState(false);
  const openAddChannelView = () => {
    setAddChannelView(true);
  };
  const closeAddChannelView = () => {
    setAddChannelView(false);
  };

  return (
    <OverPageContext.Provider
      value={{ isAddChannelView, openAddChannelView, closeAddChannelView }}
    >
      {children}
    </OverPageContext.Provider>
  );
};
