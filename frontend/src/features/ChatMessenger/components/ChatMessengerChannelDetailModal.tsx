import { useEffect, useRef } from 'react';
import ModalWrapper from 'components/ModalWrapper';
import type { IModalWrapperRef } from 'components/ModalWrapper';
import { useChatMessengerChannelDetailModalContext } from '../context/ChatMessengerChannelDetailModalContext';
import ChatMessengerChannelDetailModalContent from './ChatMessengerChannelDetailModalContent';
import type { IChatMessengerChannelDetailModalContentPropsForRef } from './ChatMessengerChannelDetailModalContent';

const ChatMessengerChannelDetailModal = () => {
  const modalRef =
    useRef<
      IModalWrapperRef<IChatMessengerChannelDetailModalContentPropsForRef, any>
    >(null);

  const { setShowHandler } = useChatMessengerChannelDetailModalContext();

  useEffect(() => {
    if (modalRef.current?.show) {
      setShowHandler(modalRef.current.show);
    }
  }, [setShowHandler]);

  return (
    <ModalWrapper
      ref={modalRef}
      renderModal={(
        isOpen,
        modalProps: IChatMessengerChannelDetailModalContentPropsForRef,
        handleClose,
        handleConfirm,
      ) => (
        <ChatMessengerChannelDetailModalContent
          isOpen={isOpen}
          handleClose={handleClose}
          handleConfirm={handleConfirm}
          {...modalProps}
        />
      )}
    />
  );
};

export default ChatMessengerChannelDetailModal;
