import { useCallback } from 'react';
import moment from 'moment';
import { useAppSelector } from 'store/hooks';
import { optimizerJobsSelector } from 'store/selectors/optimizerSelectors';

export function useOptimizerFindJobByGivenDate() {
  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );
  const storeOptimizerJobs = useAppSelector(optimizerJobsSelector);
  const currentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const currentBranchValue = currentBranches?.[0]?.value;

  const findOptimizerJobByGivenDate = useCallback(
    ({
      startDate,
      endDate,
      endDateInclusive = true,
    }: {
      startDate: any;
      endDate: any;
      endDateInclusive?: boolean;
    }) => {
      if (!startDate || !endDate) {
        return null;
      }

      const startDateMoment = moment(startDate).tz(storeSettingsValuesTimezone);
      let endDateMoment = moment(endDate).tz(storeSettingsValuesTimezone);

      // If endDateInclusive is false, subtract 1 day from endDate
      if (!endDateInclusive) {
        endDateMoment = endDateMoment.subtract(1, 'day');

        // Ensure endDate is not less than startDate
        if (endDateMoment.isBefore(startDateMoment)) {
          endDateMoment = startDateMoment.clone();
        }
      }

      return (
        storeOptimizerJobs.find((job) => {
          if (job.branch?.value !== currentBranchValue) {
            return false; // Skip jobs not in the current branch
          }

          const jobStartDate = moment(job.startDate).tz(
            storeSettingsValuesTimezone,
          );
          const jobEndDate = moment(job.endDate).tz(
            storeSettingsValuesTimezone,
          );

          // Check if the job's date range overlaps with the given date range
          // Overlap occurs when: job start <= given end AND job end >= given start
          const startOverlap = jobEndDate.isSameOrAfter(startDateMoment);
          const endOverlap = jobStartDate.isSameOrBefore(endDateMoment);

          return startOverlap && endOverlap;
        }) || null
      );
    },
    [storeOptimizerJobs, storeSettingsValuesTimezone, currentBranchValue],
  );

  const hasOptimizerJobRunning = useCallback(
    (
      event: any,
      {
        getStartDate = (event: any) => event?.extendedProps?.startRecur1,
        getEndDate = (event: any) => event?.extendedProps?.endRecur1,
        endDateInclusive = false,
      } = {},
    ) => {
      let startDate = getStartDate(event);
      if (startDate) {
        startDate = moment
          .tz(startDate, storeSettingsValuesTimezone)
          .startOf('day')
          .format();
      }

      let endDate = getEndDate(event);
      if (endDate) {
        endDate = moment
          .tz(endDate, storeSettingsValuesTimezone)
          .startOf('day')
          .format();
      }

      return (
        startDate &&
        endDate &&
        !!findOptimizerJobByGivenDate({
          startDate,
          endDate,
          endDateInclusive,
        })
      );
    },
    [storeSettingsValuesTimezone, findOptimizerJobByGivenDate],
  );

  return {
    findOptimizerJobByGivenDate,
    hasOptimizerJobRunning,
  };
}
