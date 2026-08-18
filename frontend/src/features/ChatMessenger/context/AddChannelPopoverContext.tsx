import { useMemo, useContext, createContext } from 'react';

export const AddChannelPopoverContext = createContext({
  close: () => {},
});

export const useAddChannelPopoverContext = () => {
  return useContext(AddChannelPopoverContext);
};

export const AddChannelPopoverContextProvider = ({
  close,
  children,
}: {
  close: () => void;
  children: React.ReactNode;
}) => {
  const value = useMemo(
    () => ({
      close,
    }),
    [close],
  );

  return (
    <AddChannelPopoverContext.Provider value={value}>
      {children}
    </AddChannelPopoverContext.Provider>
  );
};
