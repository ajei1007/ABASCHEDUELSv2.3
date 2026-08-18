import {
  useRef,
  useState,
  useMemo,
  useCallback,
  useContext,
  createContext,
} from 'react';

export const ChatMessengerConfirmModalContext = createContext<{
  modalShown: boolean;
  showModal: (payload: { message: string }) => Promise<
    | {
        isSubmit: true;
      }
    | {
        isSubmit: false;
        stale: boolean;
      }
  >;
  setShowHandler: (
    handler: (payload: { message: string }) => Promise<any>,
  ) => void;
}>({
  modalShown: false,
  showModal: async () => ({ isSubmit: false, stale: false }),
  setShowHandler: () => {},
});

export const useChatMessengerConfirmModalContext = () => {
  return useContext(ChatMessengerConfirmModalContext);
};

export const ChatMessengerConfirmModalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const showHandler = useRef<
    (payload: { message: string }) => Promise<
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

  const [modalShown, setModalShown] = useState(false);

  const showModal = useCallback(async (payload: { message: string }) => {
    setModalShown(true);
    try {
      return await showHandler.current(payload);
    } finally {
      setModalShown(false);
    }
  }, []);

  const setShowHandler = useCallback(
    (handler: (payload: { message: string }) => Promise<any>) => {
      showHandler.current = handler;
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      modalShown,
      showModal,
      setShowHandler,
    }),
    [modalShown, showModal, setShowHandler],
  );

  return (
    <ChatMessengerConfirmModalContext.Provider value={contextValue}>
      {children}
    </ChatMessengerConfirmModalContext.Provider>
  );
};
