import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Fade } from '@mui/material';
import Cookies from 'js-cookie';
import axios from 'axios';
import NpsSurveyForm from '../NpsSurveyForm/NpsSurveyForm';
import NpsSurveySuccess from '../NpsSurveySuccess';
import { selectErrorMessage } from 'components/FormItems/error/errors';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import type { IApiSurveyQuestionItem } from 'types/api';

interface NpsSurveyModalProps {
  questions: IApiSurveyQuestionItem[];
  handleClose: () => void;
  handleConfirm: () => void;
}

const NpsSurveyModal = ({
  questions,
  handleClose,
  handleConfirm,
}: NpsSurveyModalProps) => {
  const dispatch = useAppDispatch();
  const npsSurveyEventEmitter = useAppSelector(
    (store) => store.npsSurvey.eventEmitter,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handles survey form submission
  const handleSubmit = useCallback(
    async (values: Record<string, any>) => {
      if (isLoading || isSubmitted) {
        return;
      }

      // Extract feedback and all rating fields
      const { feedback, ...rest } = values;
      const ratings = Object.entries(rest)
        .filter(([key]) => key.startsWith('rating_'))
        .map(([key, value]) => ({
          id: key.replace('rating_', ''),
          rating: value,
        }));

      // Check if all ratings are filled
      if (ratings.some((r) => r.rating === null || r.rating === undefined)) {
        toast.error(
          'Please select a rating for all questions before submitting.',
        );
        return;
      }

      setIsLoading(true);
      try {
        // Send the survey data to the server
        await axios.post('surveydata', {
          data: {
            ratings, // array of { id, rating }
            feedback: feedback || undefined,
          },
        });

        // Set a cookie to prevent showing the survey again for 1 day
        Cookies.set('nps_blocked', '1', {
          expires: 1 / 6, // 4 hours
          sameSite: 'Lax',
          secure: true,
        });

        setIsSubmitted(true);
        setErrorMessage(null);
        toast.success('Thank you for your feedback!');
      } catch (error: any) {
        const errorMessage = selectErrorMessage(error);
        toast.error(errorMessage);
        setErrorMessage(errorMessage);
        console.error('Error submitting survey:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, isSubmitted, dispatch, npsSurveyEventEmitter],
  );

  // Handles closing the survey modal from the form
  const handleCloseFromForm = useCallback(() => {
    // Set a cookie to prevent showing the survey again for 1.5 days
    Cookies.set('nps_blocked', '1', {
      expires: 1 / 6, // 4 hours
      sameSite: 'Lax',
      secure: true,
    });
    // reset state
    setIsSubmitted(false);
    handleClose();
  }, [handleClose]);

  return (
    <>
      {!isSubmitted ? (
        <NpsSurveyForm
          questions={questions}
          isLoading={isLoading}
          isSubmitted={isSubmitted}
          errorMessage={errorMessage}
          handleSubmit={handleSubmit}
          handleClose={handleCloseFromForm}
        />
      ) : (
        <Fade in={true} timeout={400}>
          <div>
            <NpsSurveySuccess handleClose={handleConfirm} />
          </div>
        </Fade>
      )}
    </>
  );
};

export default NpsSurveyModal;
