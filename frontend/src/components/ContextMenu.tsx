import {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import type { ForwardedRef } from 'react';
import {
  Backdrop,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import type { MenuProps } from '@mui/material';
import { useLatestCallback } from 'hooks/useLatestCallback';

export interface IContextMenuProps
  extends Pick<MenuProps, 'anchorReference' | 'anchorEl' | 'anchorPosition'> {
  options?: {
    label: string;
    icon?: React.FC<any>;
    value: any;
    hasAccess?: boolean;
    disabled?: boolean;
  }[];
}

export interface IContextMenuRef {
  show(menuProps: IContextMenuProps): Promise<
    | {
        isSelected: true;
        payload: any;
      }
    | {
        isSelected: false;
        stale: boolean;
      }
  >;
}

const ContextMenuBackdrop = ({ handleClose }: { handleClose: () => void }) => {
  return (
    <Backdrop
      open={true}
      sx={{
        backgroundColor: 'transparent',
      }}
      onClick={handleClose}
      onContextMenu={(e) => {
        e.preventDefault();
        handleClose();
      }}
    />
  );
};

const createContextMenuBackdrop = ({
  handleClose,
}: {
  handleClose: () => void;
}) => {
  return () => <ContextMenuBackdrop handleClose={handleClose} />;
};

const ContextMenu = function ContextMenu(
  _: any,
  ref: ForwardedRef<IContextMenuRef>,
) {
  useImperativeHandle(ref, () => {
    return {
      show,
    };
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [menuProps, setMenuProps] = useState<IContextMenuProps>({});
  const [promiseResolver, setPromiseResolver] = useState<{
    resolve: (
      data:
        | {
            isSelected: true;
            payload: any;
          }
        | {
            isSelected: false;
            stale: boolean;
          },
    ) => void;
  }>({
    resolve: () => {},
  });

  const resetTimer = useRef(-1);

  const show = useLatestCallback((menuProps) => {
    window.clearTimeout(resetTimer.current);

    if (isOpen) {
      promiseResolver.resolve({
        isSelected: false,
        stale: true,
      });
    }

    setMenuProps(menuProps);
    setIsOpen(true);
    setIsMounted(true);
    let resolve: (
      data:
        | {
            isSelected: true;
            payload: any;
          }
        | {
            isSelected: false;
            stale: boolean;
          },
    ) => void = () => {};
    const promise = new Promise<
      | {
          isSelected: true;
          payload: any;
        }
      | {
          isSelected: false;
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
      setMenuProps({});
    }, 200);
  }, []);

  const handleClose = useLatestCallback(() => {
    close();
    promiseResolver.resolve({
      isSelected: false,
      stale: false,
    });
  });

  const handleSelect = useLatestCallback((payload) => {
    close();
    promiseResolver.resolve({
      isSelected: true,
      payload,
    });
  });

  return isMounted ? (
    <Menu
      open={isOpen}
      onClose={handleClose}
      anchorEl={menuProps.anchorEl}
      anchorReference={menuProps.anchorReference}
      anchorPosition={menuProps.anchorPosition}
      components={{
        Backdrop: createContextMenuBackdrop({ handleClose }),
      }}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
      {menuProps.options?.map((option) => (
        <MenuItem
          key={option.label}
          sx={{
            paddingRight: 4,
          }}
          disabled={option.disabled}
          onClick={() => handleSelect(option.value)}
        >
          {option.icon ? (
            <ListItemIcon>
              <option.icon fontSize='small' />
            </ListItemIcon>
          ) : null}
          <ListItemText>{option.label}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  ) : null;
};

export default forwardRef(ContextMenu);
