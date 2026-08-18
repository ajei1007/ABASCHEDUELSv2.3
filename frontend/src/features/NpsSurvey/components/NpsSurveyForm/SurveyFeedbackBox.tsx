import { Stack, Typography, Box } from '@mui/material';

interface SurveyFeedbackBoxProps {
  form: any;
  isSubmitted: boolean;
  index?: number; // Optional index prop for order number
}

const SurveyFeedbackBox = ({
  form,
  isSubmitted,
  index,
}: SurveyFeedbackBoxProps) => (
  <Stack spacing={1.5}>
    <Typography
      component='label'
      htmlFor='feedback'
      sx={{
        borderLeft: '4px solid #42a5f5', // light blue
        pl: 2.5,
        py: 0.5,
        minWidth: '2.5rem',
        borderRadius: '4px',
        color: '#16365f', // dark blue
      }}
      fontWeight={600}
      fontSize='1.1rem'
      mb={1.5}
    >
      {index !== undefined ? index + 1 : ''}. What's the primary reason for your
      score?
    </Typography>
    <Box
      id='feedback'
      placeholder='Tell us more about your experience...'
      component='textarea'
      sx={{
        width: '100%',
        minHeight: '7.5rem',
        borderRadius: '8px',
        border: '1px solid #ccc',
        background: '#fff',
        padding: '12px 12px',
        fontSize: '1rem!important',
        lineHight: '1.5',
        resize: 'none',
        fontFamily: 'inherit',
        color: '#222',
      }}
      value={form.values.feedback}
      onChange={form.handleChange}
      name='feedback'
      disabled={isSubmitted}
    ></Box>
  </Stack>
);

export default SurveyFeedbackBox;
