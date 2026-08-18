import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';

interface IWalkthroughControlModal {
  activeStep: number;
  steps: Array<Type>;
}

interface Type {
  label: string;
}

const WalkthroughControlModal = ({
  activeStep,
  steps,
}: IWalkthroughControlModal) => {
  const boxRef = useRef<HTMLDivElement>(null);
  return (
    <Box
      ref={boxRef}
      sx={{
        width: '300px',
        overflowY: 'auto',
        backgroundColor: '#fff',
        boxShadow: '0px 0px 18px 0px #bdbdbd',
        padding: 2,
        zIndex: 1000,
        borderRadius: '8px',
      }}
    >
      <Typography variant='h6' textAlign='center'>
        Getting Started
      </Typography>
      <Typography variant='body1' textAlign='center'>
        Get Acquainted with Key Features and Essential Tasks!
      </Typography>
      <Stack>
        <Stepper activeStep={activeStep} orientation='vertical'>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Stack>
    </Box>
  );
};

export default WalkthroughControlModal;
