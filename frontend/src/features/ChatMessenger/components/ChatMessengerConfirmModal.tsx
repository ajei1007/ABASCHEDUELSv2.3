import { useEffect, useRef } from 'react';
import ModalWrapper from 'components/ModalWrapper';
import type { IModalWrapperRef } from 'components/ModalWrapper';
import { useChatMessengerConfirmModalContext } from '../context/ChatMessengerConfirmModalContext';
import ChatMessengerConfirmModalContent from './ChatMessengerConfirmModalContent';
import type { IChatMessengerConfirmModalContentPropsForRef } from './ChatMessengerConfirmModalContent';

const ChatMessengerConfirmModal = ({
  anchorEl,
}: {
  anchorEl?: HTMLButtonElement | null;
}) => {
  const modalRef =
    useRef<IModalWrapperRef<IChatMessengerConfirmModalContentPropsForRef, any>>(
      null,
    );

  const { setShowHandler } = useChatMessengerConfirmModalContext();

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
        modalProps: IChatMessengerConfirmModalContentPropsForRef,
        handleClose,
        handleConfirm,
      ) => (
        <ChatMessengerConfirmModalContent
          isOpen={isOpen}
          anchorEl={anchorEl}
          handleClose={handleClose}
          handleConfirm={handleConfirm}
          {...modalProps}
        />
      )}
    />
  );
};

export default ChatMessengerConfirmModal;
