import { useRef, useState, useMemo, useContext, createContext } from 'react';

export const ChatMessengerChannelDetailModalContext = createContext<{
  actionsDisabled: boolean;
  showModal: () => Promise<
    | {
        isSubmit: true;
      }
    | {
        isSubmit: false;
        stale: boolean;
      }
  >;
  setShowHandler: (handler: (payload?: any) => Promise<any>) => void;
  setActionsDisabled: (disabled: boolean) => void;
}>({
  actionsDisabled: false,
  showModal: async () => ({ isSubmit: false, stale: false }),
  setShowHandler: () => {},
  setActionsDisabled: () => {},
});

export const useChatMessengerChannelDetailModalContext = () => {
  return useContext(ChatMessengerChannelDetailModalContext);
};

export const ChatMessengerChannelDetailModalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const showHandler = useRef<
    () => Promise<
      | {
          isSubmit: true;
        }
      | {
          isSubmit: false;
          stale: boolean;
        }
    >
  >(async () => ({
    isSubmit: false,
    stale: false,
  }));

  const [actionsDisabled, setActionsDisabled] = useState(false);

  const contextValue = useMemo(
    () => ({
      actionsDisabled,
      showModal: () => showHandler.current(),
      setShowHandler: (handler: () => Promise<any>) => {
        showHandler.current = handler;
      },
      setActionsDisabled: (disabled: boolean) => {
        setActionsDisabled(disabled);
      },
    }),
    [actionsDisabled],
  );

  return (
    <ChatMessengerChannelDetailModalContext.Provider value={contextValue}>
      {children}
    </ChatMessengerChannelDetailModalContext.Provider>
  );
};
