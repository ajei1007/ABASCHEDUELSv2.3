import type { AppDispatch, RootState } from '../../index';

export const checkNpsSurvey = ({
  chance = 1, // Default chance of 1 (100% chance to show survey)
}: {
  chance?: number;
} = {}) => {
  return (_: AppDispatch, getState: () => RootState) => {
    const state = getState();
    state.npsSurvey.eventEmitter.emit('checkNpsSurvey', {
      chance,
    });
  };
};

export const getNpsSurveyModalShown = () => {
  return (_: AppDispatch, getState: () => RootState) => {
    return getState().npsSurvey.npsSurveyModalShown;
  };
};
