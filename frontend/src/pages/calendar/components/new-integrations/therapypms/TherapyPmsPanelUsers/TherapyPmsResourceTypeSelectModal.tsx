import { useFormik } from 'formik';
import { object as yupObject } from 'yup';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CustomButton from 'components/Button';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import { resourceTypeOptions } from '../../../../constants/integrations';

export interface ItherapyPmsResourceTypeSelectModalProps {
  isOpen: boolean;
  title: string;
  handleClose: () => void;
  handleConfirm: (payload: string) => void;
}

export type TtherapyPmsResourceTypeSelectModalPropsForRef = Omit<
  ItherapyPmsResourceTypeSelectModalProps,
  'isOpen' | 'handleClose' | 'handleConfirm'
>;

interface IFormValues {
  resourceType: { value: string; label: string } | null;
}

const validationSchema = yupObject({
  resourceType: yupObject().nullable().required('Resource type is required'),
});

const TherapyPmsResourceTypeSelectModal = ({
  isOpen,
  title,
  handleClose,
  handleConfirm,
}: ItherapyPmsResourceTypeSelectModalProps) => {
  const handleSubmit = (values: IFormValues) => {
    handleConfirm(values.resourceType!.value);
  };

  const formik = useFormik<IFormValues>({
    initialValues: {
      resourceType: null,
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <Dialog
      open={isOpen}
      aria-labelledby='Select Resource Type'
      aria-describedby='Select Resource Type'
      title={title}
      scroll='body'
      fullWidth
      maxWidth='xs'
      onClose={() => null}
    >
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        padding='16px 24px 0 24px'
      >
        <DialogTitle
          style={{
            padding: '0',
            color: '#16365f',
            textTransform: 'capitalize',
          }}
        >
          {title}
        </DialogTitle>
        <IconButton onClick={handleClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>
      <DialogContent style={{ overflowY: 'unset' }}>
        <Stack spacing={2} pt={0.5} pb={1}>
          <CustomSelect
            options={resourceTypeOptions}
            value={formik.values.resourceType}
            onChange={(data: any) => formik.setFieldValue('resourceType', data)}
            placeholder='Select Resource Type'
            isClearable
            isInvalid={
              !!formik.touched.resourceType && !!formik.errors.resourceType
            }
            menuPortalTarget={document.body}
          />
        </Stack>
      </DialogContent>
      <DialogActions style={{ padding: '0 24px 16px 24px' }}>
        <CustomButton onClick={handleClose} variant='outlined'>
          Cancel
        </CustomButton>
        <CustomButton onClick={() => formik.handleSubmit()} variant='contained'>
          Submit
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default TherapyPmsResourceTypeSelectModal;
