import { Box, IconButton, Typography, Stack } from '@mui/material';
import CustomButton from 'components/Button';
import React, { useState } from 'react';
import EyeMovingSvg from '../../assets/companies/logos/ABASchedules.svg';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import WalkthroughControlModal from './components/WalkthroughControlModal/WalkthroughControlModal';
import style from './Walkthrough.module.scss';
import ABASchedulesLogo from 'components/ABASchedulesLogo/ABASchedulesLogo';
import AnimatedUpButton from './components/AnimatedUpButton/AnimatedUpButton';
import ABASchedulesSVG from 'assets/companies/logos/ABASchedules.svg';
import WalkthroughFeatureModal from './components/WalkthroughFeatureModal/WalkthroughFeatureModal';

const newsteps = [
  {
    label: 'Click the brain to learn more about our key features ',
  },
  {
    label:
      'Read about the feature and watch a video to become and become a scheduling expert!',
  },
  {
    label: 'Practice using the feature! ',
  },
];

interface ITooltip {
  continuous: boolean;
  index: number;
  isLastStep: boolean;
  size: number;
  step: any;
  backProps: any;
  closeProps: any;
  primaryProps: any;
  skipProps: any;
  tooltipProps: any;
}
const Tooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
  skipProps,
}: ITooltip) => (
  <Box
    {...tooltipProps}
    sx={{
      height: '100%',
      width: '360px',
      background: '#fff',
      padding: '1rem',
      borderRadius: '15px',
      boxShadow: '0px 0px 18px 0px #fcfcfc',
    }}
  >
    <Box sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
      {!isLastStep && index === 0 && (
        <IconButton {...skipProps}>
          <HighlightOffIcon sx={{ color: '#4d53e0' }} />
        </IconButton>
      )}
    </Box>
    <Stack alignItems='center' spacing={1}>
      {index === 0 && (
        <Box width='120px' height='120px'>
          <img src={EyeMovingSvg} width='100%' height='100%' alt='logo' />
        </Box>
      )}
      {step.title && (
        <Typography
          variant='h6'
          color='#16365f'
          textAlign='center'
          letterSpacing={1.1}
          fontWeight={550}
        >
          {step.title}
        </Typography>
      )}
      <Typography
        fontSize={index === 0 ? '14px' : '16px'}
        color={index === 0 ? 'rgba(84, 89, 94, 0.60)' : '#16365f'}
        textAlign='center'
        lineHeight={index === 0 ? '21px' : '20px'}
      >
        {step.content}
      </Typography>
    </Stack>
    <Stack flexDirection='row' justifyContent='space-between'>
      <Stack>
        {!isLastStep && index >= 1 && (
          <CustomButton {...skipProps} variant='outlined'>
            Close
          </CustomButton>
        )}
      </Stack>
      <Stack flexDirection='row' justifyContent='space-between' columnGap={1}>
        {index > 0 && (
          <CustomButton {...backProps} variant='outlined'>
            Back
          </CustomButton>
        )}
        {continuous ||
          (index > 0 && (
            <CustomButton {...primaryProps} variant='contained'>
              Next
            </CustomButton>
          ))}
      </Stack>
      {index === 0 && (
        <CustomButton
          {...primaryProps}
          variant='contained'
          fullWidth
          sx={{ mt: 1 }}
        >
          Yeah, thanks!
        </CustomButton>
      )}
    </Stack>
  </Box>
);

interface WalkthroughProps {
  // steps: Step[];
  run?: boolean;
  continuous?: boolean;
  onTourEnd: () => void;
}
const Walkthrough = () => {
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [newTour, setNewTour] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [showLeftModal, setShowLeftModal] = useState(false);

  // const handleJoyrideCallback = (data: CallBackProps) => {
  //   if (data.type === EVENTS.TOUR_END || data.type === EVENTS.TOOLTIP_CLOSE) {
  //     setIsTourRunning(false);
  //     setCurrentStep(0);
  //     setNewTour(true);
  //     if (onTourEnd) {
  //       onTourEnd();
  //     }
  //   } else if (
  //     data.type === EVENTS.STEP_AFTER ||
  //     data.type === EVENTS.TARGET_NOT_FOUND
  //   ) {
  //     const nextStepIndex =
  //       data.index + (data.action === ACTIONS.PREV ? -1 : 1);
  //     setCurrentStep(nextStepIndex);
  //   }
  // };

  const handleClickOpen = () => {
    setOpenModal(!openModal);
  };
  return (
    <>
      {/* <Joyride
        continuous={continuous}
        run={isTourRunning}
        steps={steps}
        stepIndex={currentStep}
        callback={handleJoyrideCallback}
        tooltipComponent={Tooltip}
        showProgress
        showSkipButton
        scrollToFirstStep
        disableOverlay
        styles={{
          options: {
            backgroundColor: '#fff',
            overlayColor: 'transpatent',
            primaryColor: 'red',
            textColor: '#4d53e0',
          },
          spotlight: {
            backgroundColor: 'transparent',
          },
        }}
      /> */}
      {newTour && (
        <CustomButton variant='text' onClick={handleClickOpen}>
          <Stack flexDirection='row' alignItems='center' spacing={1}>
            <img src={ABASchedulesSVG} alt='logo' className={style.helpLogo} />
            <span className={style.helpText}>Need help?</span>
          </Stack>
        </CustomButton>
      )}
      {/* {newTour && (
        <Box className={style.stepperButtonParent}>
          {showLeftModal && !openModal && (
            <WalkthroughControlModal
              activeStep={currentStep}
              steps={newsteps}
            />
          )}
          {!openModal && (
            <Stack
              flexDirection='column'
              justifyContent='start'
              alignItems='start'
            >
              <AnimatedUpButton
                handleOpen={() => setShowLeftModal(!showLeftModal)}
                open={showLeftModal}
              />
              <Box className={style.imgContainer} onClick={handleClickOpen}>
                <ABASchedulesLogo />
              </Box>
            </Stack>
          )}
        </Box>
      )} */}
      {openModal && (
        <WalkthroughFeatureModal
          openModal={openModal}
          onClose={handleClickOpen}
          featureSteps={newsteps}
        />
      )}
    </>
  );
};

export default Walkthrough;
