import CustomInput from 'components/CustomInputModal/CustomInput';
import React from 'react';
import type {ItemProps} from '../../../types/formik/item';

const TextViewItem: React.FC<ItemProps> = ({ value, prefix, label }) => {

  if (!value && value !== 0 && value !== false) {
    return null;
  }

  const inputValue = `${prefix ? `${prefix} ` : ''}${value}`;
  const labelValue = label ?? 'Default Label'; 
  return (
    // <div className="form-group">
    //   <label>
    //     {label}
    //   </label>

    //   <input
    //     type="text"
    //     readOnly
    //     className="form-control-plaintext"
    //     value={inputValue}
    //   />
    // </div>
    <CustomInput name={labelValue} label={labelValue} value={inputValue} readOnly={true} type='text' required={false} error={false}/>
  );
}

export default TextViewItem;
