import React, { type ReactNode } from 'react';
import {Tooltip, IconButton} from '@mui/material'

interface CustomIconButtonProps {
  children: ReactNode;
  name: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  id?: string;
  [key: string]: any; // For additional props
}

export const CustomIconButton: React.FC<CustomIconButtonProps> = ({
  children,
  name,
  onClick,
  disabled = false,
  style,
  id,
  ...props
}) => {
  return (
    <Tooltip arrow title={name} placement="top">
      <span id={id}>
        <IconButton
          aria-label={name}
          onClick={onClick}
          disabled={disabled}
          style={style}
          {...props}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
};