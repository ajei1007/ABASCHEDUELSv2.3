export type ItemProps = {
  form?: {
    [rest: string]: any
  },
  name?: any,
  mapper?: {
    [rest: string]: any
  },
  schema?: any,
  fetchFn?: Function,
  children?: React.ReactNode,
  hint?: string,
  size?: string | number,
  placeholder?: string,
  label1?: string,
  autoFocus?: boolean,
  inputProps?: any,
  errorMessage?: string,
  isClearable?: boolean,
  mode?: string,
  required?: boolean,
  required2?: boolean,
  password?: string;
  autoComplete?: any;
  path?: string;
  fileProps?: any;
  max?: any;
  label?: string;
  showCreate?: boolean;
  hasPermissionToCreate?: any;
  value?: any;
  prefix?: string;
  type?: string;
  showTimeInput?: boolean;
  fieldOption?: any;
  fieldName?: any;
  labelComponent?:any;
  fieldLabel?: any;
  fieldOptionData?: any;
  extraFetchFunction?: any;
  error?: any;
  showTimeSelectOnly?: any;
  disabled?: boolean,
  onChange?: any;
  helperText?: string;
  tooltip?: string;
}
