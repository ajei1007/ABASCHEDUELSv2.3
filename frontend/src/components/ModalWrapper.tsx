import {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import type { ForwardedRef } from 'react';
import { useLatestCallback } from 'hooks/useLatestCallback';

export interface IModalWrapperRef<T, RT> {
  show(data: T): Promise<
    | {
        isSubmit: true;
        payload: RT;
      }
    | {
        isSubmit: false;
        stale: boolean;
      }
  >;
}

export interface IModalWrapperProps {
  renderModal: (
    isOpen: boolean,
    modalProps: any,
    handleClose: () => void,
    handleConfirm: (payload?: any) => void,
  ) => JSX.Element;
}

const ModalWrapper = function ModalWrapper<T, RT>(
  { renderModal }: IModalWrapperProps,
  ref: ForwardedRef<IModalWrapperRef<T, RT>>,
) {
  useImperativeHandle(ref, () => {
    return {
      show,
    };
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [modalProps, setModalProps] = useState<Record<string, unknown>>({});
  const [promiseResolver, setPromiseResolver] = useState<{
    resolve: (
      data:
        | {
            isSubmit: true;
            payload: any;
          }
        | {
            isSubmit: false;
            stale: boolean;
          },
    ) => void;
  }>({
    resolve: () => {},
  });

  const resetTimer = useRef(-1);

  const show = useLatestCallback((modalProps) => {
    window.clearTimeout(resetTimer.current);

    if (isOpen) {
      promiseResolver.resolve({
        isSubmit: false,
        stale: true,
      });
    }

    setModalProps(modalProps);
    setIsOpen(true);
    setIsMounted(true);
    let resolve: (
      data:
        | {
            isSubmit: true;
            payload: any;
          }
        | {
            isSubmit: false;
            stale: boolean;
          },
    ) => void = () => {};
    const promise = new Promise<
      | {
          isSubmit: true;
          payload: any;
        }
      | {
          isSubmit: false;
          stale: boolean;
        }
    >((_resolve) => {
      resolve = _resolve;
    });

    setPromiseResolver({
      resolve,
    });

    return promise;
  });

  const close = useCallback(() => {
    setIsOpen(false);
    setPromiseResolver({
      resolve: () => {},
    });
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => {
      setIsMounted(false);
      setModalProps({});
    }, 200);
  }, []);

  const handleClose = useLatestCallback(() => {
    close();
    promiseResolver.resolve({
      isSubmit: false,
      stale: false,
    });
  });

  const handleConfirm = useLatestCallback((payload) => {
    close();
    promiseResolver.resolve({
      isSubmit: true,
      payload,
    });
  });

  return isMounted
    ? renderModal(isOpen, modalProps, handleClose, handleConfirm)
    : null;
};

export default forwardRef(ModalWrapper);
