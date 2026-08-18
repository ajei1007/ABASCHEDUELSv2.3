import React, { useRef, useState } from 'react';
import CustomModal from '../Modal';
import CustomButton from '../Button';
import { Formik, type FormikProps } from 'formik';
import {
  Grid2 as Grid,
  FormControl,
  Stack,
  Typography,
  Link,
} from '@mui/material';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import CustomInput from 'components/CustomInputModal/CustomInput';
import { toast } from 'react-toastify';
import { submitTicket } from 'store/slices/ticketSlice/thunks';
import {
  clearTicketState,
  finishLoomRecording,
  saveTicketDraft,
  startLoomRecording,
} from 'store/slices/ticketSlice/actions';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import LoomRecorder from 'components/VideoRecorder/VideoRecorder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import {
  supportTicketUrgencyOptions,
  supportTicketTypeOptions,
  type SupportTicketFormValues,
} from './helpers/SupportTicketFormFields';
import { supportTicketFormValidationSchema } from './helpers/SupportTicketFormValidationSchema';

const SupportTicket = ({
  modalSupportTicket,
  setModalSupportTicket,
}: {
  modalSupportTicket: boolean;
  setModalSupportTicket: (open: boolean) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const draft = useAppSelector((store) => store.ticket.draft);
  const ticket = useAppSelector((store) => store.ticket);
  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const [showLoom, setShowLoom] = useState(false);
  const [recorderKey, setRecorderKey] = useState(0);
  const formikRef = useRef<any>(null);

  const handleSubmit = async (
    values: SupportTicketFormValues,
    { setSubmitting }: any,
  ) => {
    const formData = new FormData();

    formData.append('supportType', 'support');
    formData.append('issueType', values.type.label || '');
    formData.append('board', values.type.board || '');
    formData.append('urgency', values?.urgency?.label || '');
    formData.append('summary', values.subject.trim());
    formData.append('description', values.description);
    formData.append('firstName', values.firstName);
    formData.append('lastName', values.lastName);
    formData.append('company', currentUser?.company?.name);
    formData.append('email', currentUser?.email);
    formData.append('loomVideoUrl', values.loomVideoUrl);
    formData.append('date', moment().format('YYYY-MM-DD HH:mm:ss'));

    // Append each attachment file.
    values.attachments.forEach((file: File) => {
      formData.append('attachments', file);
    });

    try {
      await dispatch(submitTicket(formData));
      toast.success('Your support request has been submitted successfully!');
    } catch (err: any) {
      console.error('Error submitting ticket:', err);
      toast.error(
        'An error occurred while submitting your support request. Please try again later.',
      );
    } finally {
      setSubmitting(false);
      setModalSupportTicket(false);
    }
  };
  return (
    <>
      <CustomModal
        maxWidth='md'
        open={modalSupportTicket}
        onClose={() => {
          setModalSupportTicket(false);
          dispatch(clearTicketState());
        }}
        aria-labelledby='Support'
        aria-describedby='Support Modal'
        title='Support'
      >
        <Formik
          innerRef={formikRef}
          initialValues={draft}
          enableReinitialize
          validationSchema={supportTicketFormValidationSchema}
          onSubmit={handleSubmit}
        >
          {(form: FormikProps<SupportTicketFormValues>) => (
            <>
              <form>
                <Grid
                  container
                  spacing={2}
                  columns={{ xs: 12, sm: 12, md: 12 }}
                >
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 6,
                    }}
                  >
                    <label>Urgency</label>
                    <CustomSelect
                      isMulti={false}
                      options={supportTicketUrgencyOptions}
                      value={form.values.urgency}
                      onChange={(val: any) =>
                        form.setFieldValue('urgency', val)
                      }
                      name='urgency'
                      isInvalid={
                        !!form.touched.urgency && !!form.errors.urgency
                      }
                      onBlur={(e: any) => {
                        form.handleBlur(e);
                        dispatch(saveTicketDraft(form.values));
                      }}
                    />
                    <CustomErrorMessage name='urgency' form={form} />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 6,
                    }}
                  >
                    <label>Type of support ticket</label>
                    <CustomSelect
                      isMulti={false}
                      options={supportTicketTypeOptions}
                      value={form.values.type}
                      onChange={(val: any) => form.setFieldValue('type', val)}
                      name='type'
                      isInvalid={!!form.touched.type && !!form.errors.type}
                      onBlur={(e: any) => {
                        form.handleBlur(e);
                        dispatch(saveTicketDraft(form.values));
                      }}
                    />
                    <CustomErrorMessage name='type' form={form} />
                  </Grid>
                  {form.values.type.value === 'bug' && (
                    <>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 6,
                        }}
                      >
                        <CustomInput
                          name='firstName'
                          id='firstName'
                          value={form.values.firstName}
                          onChange={form.handleChange}
                          type='text'
                          label='First Name'
                          error={
                            !!form.touched.firstName && !!form.errors.firstName
                          }
                          placeholder='Enter your first name'
                          required={true}
                          onBlur={(e: any) => {
                            form.handleBlur(e);
                            dispatch(saveTicketDraft(form.values));
                          }}
                        />
                        <CustomErrorMessage name='firstName' form={form} />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 6,
                        }}
                      >
                        <CustomInput
                          name='lastName'
                          id='lastName'
                          value={form.values.lastName}
                          onChange={form.handleChange}
                          type='text'
                          label='Last Name'
                          error={
                            !!form.touched.lastName && !!form.errors.lastName
                          }
                          placeholder='Enter your last name'
                          required={true}
                          onBlur={(e: any) => {
                            form.handleBlur(e);
                            dispatch(saveTicketDraft(form.values));
                          }}
                        />
                        <CustomErrorMessage name='lastName' form={form} />
                      </Grid>
                    </>
                  )}
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 6,
                    }}
                  >
                    <CustomInput
                      name='subject'
                      id='subject'
                      value={form.values.subject}
                      onChange={form.handleChange}
                      type='text'
                      label='Subject'
                      error={!!form.touched.subject && !!form.errors.subject}
                      placeholder='Briefly summarize your question or issue'
                      required={true}
                      onBlur={(e: any) => {
                        form.handleBlur(e);
                        dispatch(saveTicketDraft(form.values));
                      }}
                    />
                    <CustomErrorMessage name='subject' form={form} />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 6,
                    }}
                  >
                    <label htmlFor='desc'>Description</label>
                    <textarea
                      name='description'
                      id='description'
                      rows={2}
                      value={form.values.description}
                      onChange={form.handleChange}
                      placeholder='Describe your question or issue in detail'
                      className='form-control'
                      required={true}
                      onBlur={(e: any) => {
                        form.handleBlur(e);
                        dispatch(saveTicketDraft(form.values));
                      }}
                    />
                    <CustomErrorMessage name='description' form={form} />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 6,
                    }}
                  >
                    <Stack direction='row' alignItems='row'>
                      <CustomButton
                        variant={
                          Boolean(form.values.loomVideoUrl)
                            ? 'contained'
                            : 'outlined'
                        }
                        onClick={() => {
                          dispatch(saveTicketDraft(form.values));
                          dispatch(startLoomRecording());
                          // Force a fresh LoomRecorder mount
                          setRecorderKey((k) => k + 1);

                          setModalSupportTicket(false);
                          setShowLoom(true);
                        }}
                      >
                        {Boolean(form.values.loomVideoUrl)
                          ? 'Replace Loom Video'
                          : 'Record Loom Video'}
                      </CustomButton>
                      <Stack
                        direction='row'
                        spacing={1}
                        sx={{ maxWidth: '100%' }}
                        pl={1}
                      >
                        {form.values.loomVideoUrl && (
                          <Typography
                            variant='body2'
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              columnGap: 0.5,
                            }}
                            noWrap
                            title={form.values.loomVideoUrl}
                          >
                            <InsertDriveFileIcon fontSize='small' />

                            <Link
                              href={form.values.loomVideoUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              style={{
                                maxWidth: 120,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {form.values.loomVideoUrl}
                            </Link>
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                    <CustomErrorMessage name='loomVideoUrl' form={form} />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                      md: 12,
                    }}
                    alignSelf='flex-end'
                    pt={2}
                  >
                    <FormControl>
                      <input
                        id='attachments'
                        name='attachments'
                        type='file'
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => {
                          if (
                            event.currentTarget.files &&
                            event.currentTarget.files.length > 0
                          ) {
                            const filesArray = Array.from(
                              event.currentTarget.files,
                            );
                            form.setFieldValue('attachments', filesArray);
                          } else {
                            form.setFieldValue('attachments', []);
                          }
                        }}
                        multiple
                        onBlur={(e: any) => {
                          form.handleBlur(e);
                          dispatch(saveTicketDraft(form.values));
                        }}
                      />
                      <label
                        htmlFor='attachments'
                        style={{
                          display: 'flex',
                          cursor: 'pointer',
                          alignItems: 'center',
                          marginBottom: 0,
                        }}
                      >
                        <CustomButton
                          sx={{
                            whiteSpace: 'nowrap',
                          }}
                          variant='contained'
                          onClick={() =>
                            fileInputRef.current && fileInputRef.current.click()
                          }
                        >
                          {form.values.attachments?.length > 0
                            ? form.values.attachments.length === 1
                              ? `${form.values.attachments.length} File`
                              : `${form.values.attachments.length} Files`
                            : 'Upload Files'}
                        </CustomButton>
                        <Stack
                          direction='row'
                          spacing={1}
                          flexWrap='wrap'
                          sx={{ maxWidth: '100%' }}
                          pl={1}
                        >
                          {form.values.attachments.map((file, i) => (
                            <>
                              <Typography
                                key={i}
                                variant='body2'
                                noWrap
                                title={file.name}
                                sx={{
                                  display: 'flex',
                                  columnGap: '2px',
                                }}
                              >
                                <div
                                  style={{
                                    maxWidth: 120,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {file.name}
                                </div>
                                ;
                              </Typography>
                            </>
                          ))}
                        </Stack>
                      </label>
                      <CustomErrorMessage name='attachments' form={form} />
                    </FormControl>
                  </Grid>
                </Grid>
                <Stack
                  flexDirection='row'
                  justifyContent='flex-end'
                  marginTop={2}
                  alignItems='center'
                  columnGap={1}
                >
                  <CustomButton
                    variant='contained'
                    onClick={(event) => {
                      event.preventDefault();
                      form.handleSubmit();
                    }}
                    loading={ticket.loading}
                  >
                    Send
                  </CustomButton>
                  <CustomButton
                    onClick={() => {
                      setModalSupportTicket(false);
                      dispatch(clearTicketState());
                    }}
                    variant='outlined'
                    loading={ticket.loading}
                  >
                    Cancel
                  </CustomButton>
                </Stack>
              </form>
            </>
          )}
        </Formik>
      </CustomModal>
      {showLoom && (
        <LoomRecorder
          key={recorderKey}
          onComplete={(url) => {
            formikRef.current?.setFieldValue('loomVideoUrl', url, false);
            dispatch(finishLoomRecording(url));
            setShowLoom(false);
            setTimeout(() => {
              setModalSupportTicket(true);
            }, 0);
          }}
          onCancel={() => {
            setShowLoom(false);
            setModalSupportTicket(true);
          }}
        />
      )}
    </>
  );
};

export default SupportTicket;
