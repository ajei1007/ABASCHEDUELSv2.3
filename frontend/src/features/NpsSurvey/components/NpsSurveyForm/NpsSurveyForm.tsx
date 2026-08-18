import React, { useMemo } from 'react';
import { Formik } from 'formik';
import type { FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Stack, Alert, Collapse } from '@mui/material';
import SurveyFormHeader from './SurveyFormHeader';
import SurveyFormActions from './SurveyFormActions';
import SurveyFormContent from './SurveyFormContent';
import type { IApiSurveyQuestionItem } from 'types/api';

// Types
interface NpsSurveyFormProps {
  questions: IApiSurveyQuestionItem[];
  isLoading: boolean;
  isSubmitted: boolean;
  errorMessage?: string | null;
  handleSubmit: (
    values: NpsSurveyFormValues,
    formikHelpers: FormikHelpers<NpsSurveyFormValues>,
  ) => void;
  handleClose: () => void;
}

interface NpsSurveyFormValues {
  feedback: string;
  [key: string]: string | number | null;
}

const getInitialValues = (
  questions: IApiSurveyQuestionItem[] = [],
): NpsSurveyFormValues => {
  return {
    feedback: '',
    ...questions.reduce(
      (acc, q) => {
        acc[`rating_${q.id}`] = null;
        return acc;
      },
      {} as Record<string, null>,
    ),
  };
};

const getValidationSchema = (questions: IApiSurveyQuestionItem[] = []) => {
  const validationShape: Record<string, any> = {
    feedback: Yup.string(),
  };
  questions.forEach((q) => {
    validationShape[`rating_${q.id}`] = Yup.number()
      .min(0, 'Minimum 0')
      .max(10, 'Maximum 10')
      .required('Required');
  });
  return Yup.object().shape(validationShape);
};

const NpsSurveyForm: React.FC<NpsSurveyFormProps> = ({
  questions,
  isLoading,
  isSubmitted,
  errorMessage,
  handleSubmit,
  handleClose,
}) => {
  // Memoize initialValues and validationSchema
  const initialValues = useMemo(() => getInitialValues(questions), [questions]);
  const validationSchema = useMemo(
    () => getValidationSchema(questions),
    [questions],
  );

  return (
    <>
      <SurveyFormHeader hideCloseButton={!errorMessage} onClose={handleClose} />
      <Collapse in={!!errorMessage} unmountOnExit>
        <Stack
          sx={{
            px: '1.25rem',
            py: '0.5rem',
          }}
        >
          <Alert severity='error'>{errorMessage}</Alert>
        </Stack>
      </Collapse>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(form) => (
          <>
            <SurveyFormContent
              questions={questions}
              form={form}
              isSubmitted={isSubmitted}
            />
            <SurveyFormActions
              isLoading={isLoading}
              isDisabled={isSubmitted || isLoading || form.isSubmitting}
              onSubmit={form.handleSubmit}
            />
          </>
        )}
      </Formik>
    </>
  );
};

export default NpsSurveyForm;
