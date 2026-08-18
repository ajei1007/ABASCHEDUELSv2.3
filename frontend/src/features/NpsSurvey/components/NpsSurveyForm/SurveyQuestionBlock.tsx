import { Stack, Typography } from '@mui/material';
import NpsSurveyRatingButton from '../NpsSurveyRatingButton';

interface SurveyQuestionBlockProps {
  id: string;
  question: string;
  form: any;
  index?: number; // Add index prop for order number
}

const SurveyQuestionBlock = ({
  id,
  question,
  form,
  index,
}: SurveyQuestionBlockProps) => {
  const hasError = form.touched[`rating_${id}`] && form.errors[`rating_${id}`];
  return (
    <Stack direction='column' rowGap={1.5}>
      <Typography
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
      >
        {index !== undefined ? index + 1 : ''}. {question}
        <Typography component='span' color='#d32f2f' ml={0.5} fontSize='1.1rem'>
          *
        </Typography>
      </Typography>
      <Stack
        direction='row'
        justifyContent='space-between'
        sx={{ fontSize: '0.875rem', color: 'gray', mb: 0.5 }}
      >
        <span>Not at all likely</span>
        <span>Extremely likely</span>
      </Stack>
      <Stack
        flexDirection='row'
        width='100%'
        justifyContent='center'
        sx={{
          outline: hasError ? '2px solid' : undefined,
          outlineColor: hasError ? '#d32f2f' : undefined,
          outlineOffset: hasError ? '3px' : undefined,
          borderRadius: hasError ? '8px' : undefined,
        }}
        aria-invalid={hasError ? 'true' : undefined}
      >
        {Array.from({ length: 11 }, (_, i) => (
          <Stack
            width='calc(100% / 11)'
            flexDirection='column'
            rowGap={1.5}
            px={0.75}
            key={i}
          >
            <NpsSurveyRatingButton
              value={i}
              isSelected={form.values[`rating_${id}`] === i}
              onClick={() => form.setFieldValue(`rating_${id}`, i)}
            />
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: 'gray',
                textAlign: 'center',
                mt: 0.5,
              }}
            >
              {i}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default SurveyQuestionBlock;
