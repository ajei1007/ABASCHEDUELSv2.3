import type { FC, InputHTMLAttributes } from "react";
import styles from "./CustomInput.module.scss";
import classNames from "classnames";
import { Typography, InputAdornment, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  clearable?: boolean;
  onClear?: () => void;
}

const CustomInput: FC<InputProps> = ({
  name = "",
  label = "",
  required = false,
  error = false,
  helperText = null,
  clearable = false,
  value,
  onChange,
  onClear,
  ...rest
}) => {
  return (
    <div className={styles.inputWrapper} style={{ position: "relative" }}>
      {label && (
        <label className={classNames(styles.label)} htmlFor={name}>
          {`${label}${required ? " *" : ""}`}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          className={classNames(styles.input, { [styles.error]: error })}
          id={name}
          value={value}
          onChange={onChange}
          {...rest}
        />
        {/* Clear Button */}
        {clearable && value && (
          <IconButton
            onClick={onClear}
            size="small"
            sx={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </div>
      {helperText && (
        <Typography fontSize="0.85rem" pt={"0.5rem"} color="#6b859e">
          {helperText}
        </Typography>
      )}
    </div>
  );
};

export default CustomInput;
