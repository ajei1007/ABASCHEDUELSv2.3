import type { FC } from 'react';
import Button, { type ButtonProps } from '@mui/material/Button';

export interface ICustomButtonProps extends ButtonProps {}

const CustomButton: FC<ICustomButtonProps> = (props) => {
  const { children, variant } = props;
  return (
    <Button
      {...props}
      variant={variant || 'contained'}
      className={props.className}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
