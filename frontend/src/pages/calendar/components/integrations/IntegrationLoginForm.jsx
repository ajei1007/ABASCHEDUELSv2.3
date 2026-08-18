import CustomButton from 'components/Button';
import { Form, Formik } from 'formik';
import { Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import * as yup from 'yup';
import CustomInput from 'components/CustomInputModal/CustomInput';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import { integrateNow, syncUsers } from 'store/actions/integrationAction';
import { IntegrationTypes } from 'utils/integrations';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import { useMemo } from 'react';
import { syncPastUpdatesOptions } from 'pages/calendar/constants';

const loginSchema = (platform, theraQuestionAndAnswers) => {
  const yupShape = {
    password_integration: yup.string().required('Password is required'),
  };
  if (platform === IntegrationTypes.THERALYTICS) {
    yupShape.username_integration = yup
      .string()
      .required('Username is required');
    if (theraQuestionAndAnswers) {
      yupShape.selectedQuestion = yup
        .object()
        .nullable()
        .required('Please select one of the questions!');
      yupShape.answer = yup.string().required('Answer is required');
    }
  } else {
    yupShape.email_integration = yup.string().required('Email is required');
  }
  return yup.object().shape(yupShape);
};

const IntegrationLoginForm = ({
  toggleModal,
  syncEventUpdatedInThePast,
  setSyncEventUpdatedInThePast,
}) => {
  const dispatch = useAppDispatch();
  const fetchingIntegrationLoading = useAppSelector(
    (state) => state.integration.fetchingIntegrationLoading,
  );
  const selectedIntegrationSoftware = useAppSelector(
    (state) => state.integration.selectedIntegrationSoftware,
  );
  const integrationAuthType = useAppSelector(
    (state) => state.integration.integrationAuthType,
  );
  const theraQuestionAndAnswers = useAppSelector(
    (state) => state.integration.theraQuestionAndAnswers,
  );

  const handleSubmit = (values) => {
    let data = {
      username: values.username_integration,
      email: values.email_integration,
      password: values.password_integration,
    };

    if (
      selectedIntegrationSoftware === IntegrationTypes.THERALYTICS &&
      theraQuestionAndAnswers
    ) {
      data = {
        ...data,
        QuestionID: values?.selectedQuestion?.id,
        Answer: values.answer,
      };
    }

    if (integrationAuthType === 'sync') {
      dispatch(syncUsers(data, syncEventUpdatedInThePast.value));
    } else {
      dispatch(integrateNow(data, syncEventUpdatedInThePast.value));
    }
  };

  const questions = useMemo(() => {
    if (theraQuestionAndAnswers?.answers) {
      return theraQuestionAndAnswers.answers.map((opt) => ({
        id: opt.id,
        value: opt.value,
        label: opt.question,
      }));
    }
    return [];
  }, [theraQuestionAndAnswers]);

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={{
        email_integration: '',
        username_integration: '',
        password_integration: '',
        selectedQuestion: '',
        answer: '',
      }}
      enableReinitialize
      validationSchema={loginSchema(
        selectedIntegrationSoftware,
        theraQuestionAndAnswers,
      )}
    >
      {(form) => (
        <Form onSubmit={form.handleSubmit}>
          <Stack direction='column' spacing='1.5rem'>
            {selectedIntegrationSoftware !== IntegrationTypes.THERALYTICS && (
              <div>
                <CustomInput
                  name='email_integration'
                  id='email_integration'
                  value={form.values.email_integration}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  type='text'
                  label='Email'
                  error={
                    !!form.touched.email_integration &&
                    !!form.errors.email_integration
                  }
                />
                <CustomErrorMessage name='email_integration' form={form} />
              </div>
            )}
            {selectedIntegrationSoftware === IntegrationTypes.THERALYTICS && (
              <div>
                <CustomInput
                  name='username_integration'
                  id='username_integration'
                  value={form.values.username_integration}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  type='text'
                  label='Username'
                  error={
                    !!form.touched.username_integration &&
                    !!form.errors.username_integration
                  }
                  disabled={theraQuestionAndAnswers}
                />
                <CustomErrorMessage name='username_integration' form={form} />
              </div>
            )}
            <div>
              <CustomInput
                id='password_integration'
                label='Password'
                value={form.values.password_integration}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                type='text'
                name='password_integration'
                error={
                  !!form.touched.password_integration &&
                  !!form.errors.password_integration
                }
                disabled={theraQuestionAndAnswers}
              />
              <CustomErrorMessage name='password_integration' form={form} />
            </div>
            {theraQuestionAndAnswers && (
              <>
                <div>
                  <label>Question</label>
                  <CustomSelect
                    isMulti={false}
                    options={questions}
                    value={form.values.selectedQuestion}
                    onChange={(val) =>
                      form.setFieldValue('selectedQuestion', val)
                    }
                    name={'selectedQuestion'}
                    isInvalid={
                      !!form.touched.selectedQuestion &&
                      !!form.errors.selectedQuestion
                    }
                  />
                  <CustomErrorMessage name='selectedQuestion' form={form} />
                </div>
                <div>
                  <CustomInput
                    name='answer'
                    id='answer'
                    value={form.values.answer}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    type='text'
                    label='Answer'
                    error={
                      !!form.touched.magicQuestionsAnswer &&
                      !!form.errors.magicQuestionsAnswer
                    }
                  />
                  <CustomErrorMessage name='answer' form={form} />
                </div>
              </>
            )}
          </Stack>
          <Stack
            flexDirection='row'
            justifyContent={
              integrationAuthType !== 'sync' ? 'space-between' : 'flex-end'
            }
            alignItems='center'
            marginTop={2}
            width={'100%'}
          >
            {integrationAuthType !== 'sync' && (
              <Stack flexDirection='row' alignItems='center' columnGap={1}>
                <label>Sync events updated in the past </label>
                <Stack width='120px'>
                  <CustomSelect
                    options={syncPastUpdatesOptions}
                    value={syncEventUpdatedInThePast}
                    onChange={(val) => setSyncEventUpdatedInThePast(val)}
                  />
                </Stack>
              </Stack>
            )}
            <Stack
              flexDirection='row'
              justifyContent='flex-end'
              alignItems='center'
              columnGap={1}
            >
              <CustomButton
                onClick={form.handleSubmit}
                variant='contained'
                loading={fetchingIntegrationLoading}
              >
                {integrationAuthType === 'sync' ? 'Sync' : 'Integrate'}
              </CustomButton>
              <CustomButton
                onClick={toggleModal}
                variant='outlined'
                loading={fetchingIntegrationLoading}
              >
                Cancel
              </CustomButton>
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};

export default IntegrationLoginForm;
