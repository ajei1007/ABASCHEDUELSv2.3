import React from 'react';
import { useFormikContext } from 'formik';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

interface YesNoMuiProps {
  name: string;
  clearedField?: string;
  clearedFieldValue?: any;
  label?: any;
  isNested?: boolean;
  formIndex?: number;
  values: any;
  formValues?: any;
  setValues: (vals: any) => void;
  setFieldValue: (field: string, value: any) => void;
  disabled?: boolean;
  onChange?: (val: any) => void;
}

const YesNoMui: React.FC<YesNoMuiProps> = (props) => {
  const {
    name,
    label,
    clearedField,
    clearedFieldValue,
    isNested,
    formIndex,
    disabled,
  } = props;
  const { values, setValues, setFieldValue } = useFormikContext<any>();

  const currentValue = isNested
    ? values.constraints[formIndex!]?.[name]
    : values[name];

  const stringValue = currentValue === true ? 'true' : 'false';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value === 'true';

    if (newVal) {
      setFieldValue(isNested ? `constraints.${formIndex}.${name}` : name, true);
    } else {
      const updatedObj = isNested
        ? { ...values.constraints[formIndex!] }
        : { ...values };

      updatedObj[name] = false;

      if (clearedField) {
        updatedObj[clearedField] = clearedFieldValue ?? null;
      }

      // Set default values for min/max
      if (name.includes('enableMinMax')) {
        const minField = name.replace('enableMinMax', 'min');
        const maxField = name.replace('enableMinMax', 'max');

        updatedObj[minField] = 1;
        updatedObj[maxField] = 1;
      }

      if (name === 'forever') {
        const currentDate = new Date();
        const nextDay = new Date(currentDate);
        nextDay.setDate(currentDate.getDate() + 1);

        updatedObj.start = currentDate;
        updatedObj.end = nextDay;
      }

      if (isNested) {
        const updatedConstraints = [...values.constraints];
        updatedConstraints[formIndex!] = updatedObj;
        setValues({
          ...values,
          constraints: updatedConstraints,
        });
      } else {
        setValues(updatedObj);
      }
    }
  };

  return (
    <FormControl
      component='fieldset'
      disabled={disabled ?? false}
      sx={{
        '& .MuiSvgIcon-root': {
          fontSize: 14,
        },
      }}
    >
      {/* Optional Label */}
      {/* {label && <FormLabel component="legend">{label}</FormLabel>} */}

      <RadioGroup
        row
        style={{ flexWrap: 'nowrap' }}
        name={name}
        value={stringValue}
        onChange={handleChange}
      >
        <FormControlLabel
          value='true'
          control={<Radio />}
          label='Yes'
          sx={{ fontSize: '12px' }}
        />
        <FormControlLabel
          value='false'
          control={<Radio />}
          label='No'
          sx={{ fontSize: '12px' }}
        />
      </RadioGroup>
    </FormControl>
  );
};

export default YesNoMui;
