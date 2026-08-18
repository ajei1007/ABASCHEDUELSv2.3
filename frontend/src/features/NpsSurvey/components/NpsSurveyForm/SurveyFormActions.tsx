import { DialogActions } from '@mui/material';
import CustomButton from 'components/Button';

export interface ISurveyFormActionsProps {
  isLoading: boolean;
  isDisabled: boolean;
  onSubmit: () => void;
}

const SurveyFormActions = ({
  isLoading,
  isDisabled,
  onSubmit,
}: ISurveyFormActionsProps) => {
  return (
    <DialogActions
      sx={{
        padding: '0 24px 24px 24px',
      }}
    >
      <CustomButton
        sx={{
          width: '100%',
          height: '3.5rem',
          fontSize: '1rem!important',
        }}
        loading={isLoading}
        disabled={isDisabled}
        onClick={onSubmit}
        variant='contained'
      >
        Submit Feedback
      </CustomButton>
    </DialogActions>
  );
};

export default SurveyFormActions;
