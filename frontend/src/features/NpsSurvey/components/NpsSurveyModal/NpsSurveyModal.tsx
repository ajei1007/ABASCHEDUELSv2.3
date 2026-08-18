import { Dialog } from '@mui/material';
import NpsSurveyModalContent from './NpsSurveyModalContent';
import type { IApiSurveyQuestionItem } from 'types/api';

export interface INpsSurveyModalProps {
  isOpen: boolean;
  questions: IApiSurveyQuestionItem[];
  handleClose: () => void;
  handleConfirm: () => void;
}

export interface INpsSurveyModalPropsForRef
  extends Pick<INpsSurveyModalProps, 'questions'> {}

const NpsSurveyModal = ({
  isOpen,
  questions,
  handleClose,
  handleConfirm,
}: INpsSurveyModalProps) => {
  return (
    <Dialog
      open={isOpen}
      scroll='body'
      fullWidth
      slotProps={{
        paper: {
          sx: {
            maxWidth: '900px',
            width: '100%',
          },
        },
      }}
      onClose={() => null}
      disableEscapeKeyDown
    >
      <NpsSurveyModalContent
        questions={questions}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    </Dialog>
  );
};

export default NpsSurveyModal;
