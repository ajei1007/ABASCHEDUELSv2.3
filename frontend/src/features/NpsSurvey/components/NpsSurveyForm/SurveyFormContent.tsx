import { DialogContent, Stack } from '@mui/material';
import SurveyQuestionBlock from './SurveyQuestionBlock';
import SurveyFeedbackBox from './SurveyFeedbackBox';

interface SurveyFormContentProps {
  questions: Array<{ id: string; question: string }>;
  form: any;
  isSubmitted: boolean;
}

const SurveyFormContent = ({
  questions,
  form,
  isSubmitted,
}: SurveyFormContentProps) => {
  return (
    <DialogContent style={{ overflowY: 'unset' }}>
      <Stack direction='column' pt={0} pb={1} rowGap='3rem'>
        {questions.map((q, index) => (
          <SurveyQuestionBlock
            key={q.id}
            id={q.id}
            question={q.question}
            form={form}
            index={index} // Pass index for order number
          />
        ))}
        <SurveyFeedbackBox
          index={questions.length}
          form={form}
          isSubmitted={isSubmitted}
        />
      </Stack>
    </DialogContent>
  );
};

export default SurveyFormContent;
