import axios, { AxiosError } from 'axios';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import {
  breakDurationOptions,
  breakQuantityOptions,
  lunchDurationOptions,
  oneBreakHoursOptions,
  twoBreakHoursOptions,
} from 'pages/calendar/constants';
import _, { isArray } from 'lodash';
import { toast } from 'react-toastify';
import { OptimizerActionTypes } from 'types/redux/optimizer';
import config from 'config';
import type { IOptimizerJobItem } from 'types';

export const toggleOptimizerModal = () => {
  return (dispatch: any, getState: any) => {
    const optimizerModal = getState().optimizer.optimizerModal;
    dispatch({
      type: OptimizerActionTypes.SET_OPTIMIZER_MODAL,
      optimizerModal: !optimizerModal,
    });
  };
};

export const hideOptimizerModal = () => {
  return (dispatch: any, _: any) => {
    dispatch({
      type: OptimizerActionTypes.SET_OPTIMIZER_MODAL,
      optimizerModal: false,
    });
  };
};

export const toggleOptimizerResultsModal = () => {
  return (dispatch: any, getState: any) => {
    const optimizerResultsModal = getState().optimizer.optimizerResultsModal;
    dispatch({
      type: OptimizerActionTypes.SET_OPTIMIZER_RESULTS_MODAL,
      optimizerResultsModal: !optimizerResultsModal,
    });
  };
};

export const toggleOptimizerResultsEmptyModal = () => {
  return (dispatch: any, getState: any) => {
    const optimizerResultsEmptyModal =
      getState().optimizer.optimizerResultsEmptyModal;
    dispatch({
      type: OptimizerActionTypes.SET_OPTIMIZER_RESULTS_EMPTY_MODAL,
      optimizerResultsEmptyModal: !optimizerResultsEmptyModal,
    });
  };
};

export const toggleOptimizerResultsDisabledConstraintsModal = () => {
  return (dispatch: any, getState: any) => {
    const optimizerResultsDisabledConstraintsModal =
      getState().optimizer.optimizerResultsDisabledConstraintsModal;
    dispatch({
      type: OptimizerActionTypes.SET_OPTIMIZER_RESULTS_DISABLED_CONSTRAINTS_MODAL,
      optimizerResultsDisabledConstraintsModal:
        !optimizerResultsDisabledConstraintsModal,
    });
  };
};

export const handleOptimizerValues = (key: any, value: any) => {
  return (dispatch: any) => {
    dispatch({
      type: OptimizerActionTypes.OPTIMIZER_VALUES,
      optimizerValues: { [key]: value },
    });
  };
};

export const setActivityRoleItems = (items: any) => {
  return (dispatch: any) => {
    dispatch({
      type: OptimizerActionTypes.SET_ACTIVITY_ROLE_ITEMS,
      activityRoleItems: items,
    });
  };
};

export const resetOptimizerResults = () => {
  return (dispatch: any) => {
    dispatch({
      type: OptimizerActionTypes.RESET_OPTIMIZER_RESULTS,
    });
  };
};

export const resetOptimizerJobs = () => {
  return (dispatch: any) => {
    dispatch({
      type: OptimizerActionTypes.RESET_OPTIMIZER_JOBS,
    });
  };
};

export const setOptimizerResults = (data: any) => {
  return (dispatch: any) => {
    dispatch({
      type: OptimizerActionTypes.SET_OPTIMIZER_RESULTS,
      optimizerResults: data,
    });
  };
};

export const setOptimizerResultsSelectedIdsMap = (
  map: Record<string, boolean>,
) => {
  return (dispatch: any) => {
    dispatch({
      type: OptimizerActionTypes.SET_OPTIMIZER_RESULTS_SELECTED_IDS_MAP,
      selectedIdsMap: map,
    });
  };
};

export const toggleOptimizerResultsSelectedId = (id: string) => {
  return (dispatch: any, getState: any) => {
    const optimizerResultsSelectedIdsMap =
      getState().optimizer.optimizerResultsSelectedIdsMap;
    if (id in optimizerResultsSelectedIdsMap) {
      const newMap = {
        ...optimizerResultsSelectedIdsMap,
        [id]: !optimizerResultsSelectedIdsMap[id],
      };
      dispatch({
        type: OptimizerActionTypes.SET_OPTIMIZER_RESULTS_SELECTED_IDS_MAP,
        selectedIdsMap: newMap,
      });
    }
  };
};

export const addOptimizerJob = (optimizerJob: IOptimizerJobItem) => {
  return (dispatch: any) => {
    dispatch({
      type: OptimizerActionTypes.ADD_OPTIMIZER_JOB,
      optimizerJob,
    });
  };
};

export const updateOptimizerJob = (optimizerJob: IOptimizerJobItem) => {
  return (dispatch: any) => {
    dispatch({
      type: OptimizerActionTypes.UPDATE_OPTIMIZER_JOB,
      optimizerJob,
    });
  };
};

export const removeOptimizerJob = (optimizerJobId: string) => {
  return (dispatch: any) => {
    dispatch({
      type: OptimizerActionTypes.REMOVE_OPTIMIZER_JOB,
      optimizerJobId,
    });
  };
};

export const cancelOptimizerJob = (optimizerJobId: string) => {
  return (dispatch: any, getState: any) => {
    const job = getState().optimizer.optimizerJobs.find(
      (j: any) => j.id === optimizerJobId,
    );
    job?.abortController?.abort();
    dispatch(removeOptimizerJob(optimizerJobId));
  };
};

export const cancelAllOptimizerJobs = () => {
  return (dispatch: any, getState: any) => {
    const jobs = getState().optimizer.optimizerJobs;
    jobs.forEach((job: any) => job.abortController?.abort());
    dispatch({ type: OptimizerActionTypes.RESET_OPTIMIZER_JOBS });
    dispatch({ type: OptimizerActionTypes.RESET_OPTIMIZER_RESULTS });
  };
};

export const fetchOptimizer = () => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  return async (dispatch: any, getState: any) => {
    const response = await axios.get(`/optimizer`);
    const data = response.data.rows[0];
    let updatedData = {
      ...data,
      // startdate: getState().calendar.calendar_start,
      // enddate: moment(getState().calendar.calendar_end).add(-1, 'day').toDate(),
      is_events: data.is_events,
      part1: data.part1,
      is_overlap_constraint: data.is_overlap_constraint,
      is_minSession_constraint: data.is_minSession_constraint,
      is_delete: data.is_delete,
      allOrNothingBlocks: data.allOrNothingBlocks,
      maxEmployeeHoursPerDay: data.maxEmployeeHoursPerDay,
      maxClientHoursPerDay: data.maxClientHoursPerDay,
      maxGapEmployeeSchedule: data.maxGapEmployeeSchedule,
      maxGapClientSchedule: data.maxGapClientSchedule,
      clientsMaxAppointmentsPerDay: data.clientsMaxAppointmentsPerDay,
      employeesMaxAppointmentsPerDay: data.employeesMaxAppointmentsPerDay,
      // max_time_in_seconds: data.max_time_in_seconds || 120,
      // percentignore: data.part1 ? null : data.percentignore || null,
      breakDuration: breakDurationOptions.find(
        (val: any) => val.value === data.break_length,
      ),
      breakQuantity: breakQuantityOptions.find(
        (val: any) => val.value === data.break_length,
      ),
      oneBreakHours: oneBreakHoursOptions.find(
        (val: any) => val.value === data.break_length,
      ),
      twoBreakHours: twoBreakHoursOptions.find(
        (val: any) => val.value === data.break_length,
      ),
      nogapsequationrole: data.nogapsequationroleId,
    };
    if (updatedData.percentignore) {
      delete updatedData.percentignore;
    }
    if (data.objectiverolesmany) {
      const listRoles = data.objectiverolesmany.map((t: any, index: any) => ({
        value: t.id,
        label: t.name,
        rank: t?.optimizerObjectiverolesmanyRoles?.rank ?? index + 1,
      }));
      const sortedRoles = _.sortBy(listRoles, 'rank');
      updatedData.activityRoleItems = {
        ...updatedData.activityRoleItems,
        roles: sortedRoles,
      };
    }
    if (data.objectiveactivitiesmany) {
      const listUsers = data.objectiveactivitiesmany.map(
        (t: any, index: any) => ({
          value: t.id,
          label: t.firstName,
          rank: t?.optimizerObjectiveactivitiesmanyUsers?.rank ?? index + 1,
        }),
      );
      const sortedUsers = _.sortBy(listUsers, 'rank');
      updatedData.activityRoleItems = {
        ...updatedData.activityRoleItems,
        activities: sortedUsers,
      };
    }
    dispatch({
      type: OptimizerActionTypes.OPTIMIZER_VALUES,
      optimizerValues: updatedData,
    });
  };
};

export const saveDefaultOptimizer = (extra = {}) => {
  return async (_: any, getState: any) => {
    const optimizerValues = getState().optimizer.optimizerValues;
    const { breakDuration, breakQuantity, oneBreakHours, twoBreakHours } =
      optimizerValues;

    const timeZone =
      getState().settings?.settingValues?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;
    const calendarDate = moment(getState().calendar.calendar_start).tz(
      timeZone,
    );
    const startdate = calendarDate.format('YYYY-MM-DD');
    const enddate = calendarDate.format('YYYY-MM-DD');

    let data = {
      ...optimizerValues,
      ...extra,
      constraintlunchduration: lunchDurationOptions[0]?.value,
      break_length: breakDuration?.value,
      breakQuantity: breakQuantity?.value,
      oneBreakHours: oneBreakHours?.value > 0 ? oneBreakHours?.value : null,
      twoBreakHours: twoBreakHours?.value > 1 ? twoBreakHours?.value : null,
      objectiverole: optimizerValues?.objectiveroleId,
      objectiveactivity: optimizerValues?.objectiveactivityId,
      startdate,
      enddate,
      // percentignore: optimizerValues.part1
      //   ? null
      //   : optimizerValues.percentignore || null,
    };

    const objectiverolesmany = JSON.parse(
      JSON.stringify(data.objectiverolesmany),
    ).map((roleId: any, index: any) => ({
      roleId,
      rank: index + 1,
    }));
    data.objectiverolesmany = objectiverolesmany;

    const objectiveactivitiesmany = JSON.parse(
      JSON.stringify(data.objectiveactivitiesmany),
    ).map((userId: any, index: any) => ({
      userId,
      rank: index + 1,
    }));
    data.objectiveactivitiesmany = objectiveactivitiesmany;

    await axios.put(`/optimizer`, { data });
  };
};

// ** CREATE - Optimizer
export const optimize = (extraFilters: any, version: any) => {
  return async (dispatch: any, getState: any) => {
    const {
      teamOptimizer,
      nogapsequationrole,
      objectiveRolesRanking,
      activitiesRanking,
      //
      soft,
      high,
      disabled,
      hard,
      isolatedResources,
      runMode,
    } = extraFilters;

    const timeZone =
      getState().settings?.settingValues?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;
    const calendarStartDate = getState().calendar.calendar_start;
    const calendarEndDate = getState().calendar.calendar_end;
    const calendarDate = moment(calendarStartDate).tz(timeZone);
    const calendarDateEnd = moment(calendarEndDate).tz(timeZone);
    const startdate = calendarDate.format('YYYY-MM-DD');
    const enddate = calendarDateEnd.format('YYYY-MM-DD');
    const activityResources = getState().calendar.activityResources;
    const locationResources = getState().calendar.locationResources;
    const blockResources = getState().calendar.blockResources;
    const lazyResources = getState().calendar.lazyResources;
    const timezone = getState().settings.settingValues.timezone;
    const optimizerJobs = getState().optimizer.optimizerJobs;
    const displayDate = moment(calendarStartDate)
      .tz(timezone)
      .format('dddd, MMM D, yyyy');

    const startDateMoment = moment
      .tz(calendarStartDate, timezone)
      .startOf('day');
    const endDateMoment = moment
      .tz(calendarEndDate, timezone)
      .subtract(1, 'day')
      .endOf('day');

    // Ensure endDate is not less than startDate
    const finalEndDate = endDateMoment.isBefore(startDateMoment)
      ? startDateMoment.clone().endOf('day')
      : endDateMoment;

    const abortController = new AbortController();

    const optimizerJob: IOptimizerJobItem = {
      id: uuidv4(),
      startDate: startDateMoment.format(),
      endDate: finalEndDate.format(),
      branch: getState().calendar.current_branches[0],
      status: 'loading',
      startTs: Date.now(),
      endTs: null,
      result: null,
      abortController,
    };

    if (optimizerJobs.length >= config.maxOptimizerBackgroundJobs) {
      toast.error(
        `Max optimizer background jobs (${config.maxOptimizerBackgroundJobs}) reached. Please wait.`,
      );
      return;
    }
    dispatch(addOptimizerJob(optimizerJob));

    const companyId = getState().auth.currentUser.companyId;
    const lunch_id = getState().calendar.activityResources.find(
      (r: any) => r.firstName === 'Lunch',
    );
    const break_id = getState().calendar.activityResources.find(
      (r: any) => r.firstName === 'Break',
    );
    const drive_id = getState().calendar.activityResources.find(
      (r: any) => r.firstName === 'Drive',
    );
    const home_id = getState().calendar.activityResources.find(
      (r: any) => r.firstName === 'Home',
    );

    let resources = getState().calendar.activityResources.filter((t: any) =>
      activitiesRanking.includes(t.id),
    );
    let billable: Array<any> = [];
    let notWorking: Array<any> = [];
    let auth: Array<any> = [];
    let nonbillable: Array<any> = [];
    const onCall = getState().calendar.oncallCheckbox;
    [
      ...activityResources,
      ...locationResources,
      ...lazyResources,
      ...blockResources,
    ].forEach((r: any) => {
      if (r['notWorking'] === true) {
        notWorking.push(r.id);
      }
      if (r['auth'] === true) {
        auth.push(r.id);
      }
    });

    resources.forEach((r: any) => {
      if (r['billable'] === true) {
        billable.push(r.id);
      } else {
        nonbillable.push(r.id);
      }
    });
    const token = localStorage.getItem('token');
    const thisURL = !import.meta.env.DEV
      ? window.location.hostname
      : 'http://192.168.119.128:8080';

    let optimizerURL: string = '';
    if (version === 'v1') {
      optimizerURL = 'http://127.0.0.1:4000/optimizer/automation';
    }
    if (version === 'v2') {
      optimizerURL = 'http://127.0.0.1:5002/automation';
    }

    let ip = '';
    let instance_id = '';

    const requestPayload = {
      InstanceId: instance_id,
      host: thisURL,
      PublicIp: ip,
      ...getState().optimizer.optimizerValues,
      header: {
        Authorization: `Bearer ${token}`,
      },
      startdate,
      enddate,
      branches: getState().calendar.current_branches.map((y: any) => y.value),
      teams: teamOptimizer,
      billable,
      nonbillable,
      notWorking,
      auth,
      onCall,
      nogapsequationrole: nogapsequationrole,
      lunch_id: lunch_id ? lunch_id.id : 'not found',
      break_id: break_id ? break_id.id : 'not found',
      drive_id: drive_id ? drive_id.id : 'not found',
      home_id: home_id ? home_id.id : 'not found',
      constraintlunchduration:
        getState().optimizer.optimizerValues.constraintlunchduration || 30,
      slotduration: getState().optimizer.optimizerValues.slotduration ?? 15,
      max_time_in_seconds:
        getState().optimizer.optimizerValues.max_time_in_seconds ?? undefined,
      // percentignore: getState().optimizer.optimizerValues?.part1
      //   ? null
      //   : getState().optimizer.optimizerValues.percentignore || null,
      minsession: getState().optimizer.optimizerValues.minsession || 60,
      maxsession: getState().optimizer.optimizerValues.maxsession || 60,
      maxtime: getState().optimizer.optimizerValues.maxtime || 16,
      teamamount: getState().optimizer.optimizerValues.teamamount || 5,
      teammin: getState().optimizer.optimizerValues.teammin || 5,
      teamtolerance: getState().optimizer.optimizerValues.teamtolerance || 4,
      timeconstraints:
        getState().optimizer.optimizerValues.timeconstraints || false,
      workers: getState().optimizer.optimizerValues.workers || 8,
      allOrNothingBlocks:
        getState().optimizer.optimizerValues.allOrNothingBlocks || false,
      maxEmployeeHoursPerDay:
        getState().optimizer.optimizerValues.maxEmployeeHoursPerDay || 8,
      maxClientHoursPerDay:
        getState().optimizer.optimizerValues.maxClientHoursPerDay || 8,
      maxGapEmployeeSchedule:
        getState().optimizer.optimizerValues.maxGapEmployeeSchedule || 60,
      maxGapClientSchedule:
        getState().optimizer.optimizerValues.maxGapClientSchedule || 0,
      clientsMaxAppointmentsPerDay:
        getState().optimizer.optimizerValues.clientsMaxAppointmentsPerDay || 5,
      employeesMaxAppointmentsPerDay:
        getState().optimizer.optimizerValues.employeesMaxAppointmentsPerDay ||
        5,
      // all_or_nothing:
      //   getState().optimizer.optimizerValues.orange || false,
      uncheckWhiteSolutionConstraints: [],
      uncheckOrangeSolutionConstraints: [],
      settings: getState().settings.settingValues,
      companyId: companyId,
      objectiveRolesRanking,
      activitiesRanking,
      isolatedResources,
      //
      soft,
      highPriority: high,
      disabled,
      hard,
      mode: runMode,
    };

    let isAborted = false;
    let hasErrorOccurred = false;
    let responsePayload: any = null;
    let startTime = moment.utc().toISOString();

    try {
      if (!import.meta.env.DEV) {
        optimizerURL = '/lambda/optimizer';
      }
      // Send request with abort signal for cancellation
      const res = await axios.post(
        optimizerURL,
        { data: requestPayload },
        { signal: abortController.signal },
      );
      const data = res.data;

      if (isArray(data) && data?.length) {
        const totalCreatedEvents = data.reduce(
          (acc: number, item: any) => acc + item?.creatingEvents?.length || 0,
          0,
        );
        const totalDeletedEvents = data.reduce(
          (acc: number, item: any) => acc + item?.deletingEvents?.length || 0,
          0,
        );
        const totalUpdatedEvents = data.reduce(
          (acc: number, item: any) => acc + item?.updatingEvents?.length || 0,
          0,
        );

        responsePayload = {
          totalCreatedEvents,
          totalDeletedEvents,
          totalUpdatedEvents,
        };

        dispatch(
          updateOptimizerJob({
            ...optimizerJob,
            status: 'success',
            endTs: Date.now(),
            result: data,
          }),
        );
        toast.success(`Optimizer Job for ${displayDate} is completed!`);
      } else {
        hasErrorOccurred = true;
        responsePayload = {
          error: 'No data returned from optimizer',
        };

        dispatch(
          updateOptimizerJob({
            ...optimizerJob,
            status: 'failure',
            endTs: Date.now(),
          }),
        );
        toast.error(`Optimizer Job for ${displayDate} is failed!`);
      }
    } catch (error: any) {
      const err = error as AxiosError;

      // Handle request abortion separately - it's not an error
      if (
        error.name === 'AbortError' ||
        abortController.signal.aborted ||
        axios.isCancel(error)
      ) {
        // Do nothing on abort - let the job remain in its current state
        // This allows the calling code to handle the abortion based on context
        isAborted = true;
        return;
      }

      hasErrorOccurred = true;
      const msg = err?.response?.data as any;

      // Safely serialize error details to avoid circular references
      const errorDetails = {
        message: err?.message || 'Unknown error',
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data,
        code: err?.code,
        name: err?.name,
      };

      responsePayload = {
        error: 'An error occurred while processing the optimizer job',
        errorDetails,
      };

      toast.error(`Optimizer Job for ${displayDate} is failed!`);
      if (msg) {
        toast.error(msg);
      }

      dispatch(
        updateOptimizerJob({
          ...optimizerJob,
          status: 'failure',
          endTs: Date.now(),
        }),
      );
    } finally {
      if (!isAborted) {
        dispatch(
          captureOptimizerActionLog({
            startTime,
            endTime: moment.utc().toISOString(),
            status: hasErrorOccurred ? 'failed' : 'success',
            requestPayload,
            responsePayload,
          }),
        );
      }
    }
  };
};

export const captureOptimizerActionLog = ({
  startTime,
  endTime,
  status,
  requestPayload,
  responsePayload,
}: {
  startTime: string;
  endTime: string;
  status: 'success' | 'failed';
  requestPayload: any;
  responsePayload?: any | null;
}) => {
  return async (_: any, __: any) => {
    try {
      // Set a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 10000); // 10 second timeout

      await axios.post(
        'optimizer-action-logs/capture',
        {
          data: {
            startTime,
            endTime,
            status,
            requestPayload,
            responsePayload,
          },
        },
        {
          signal: controller.signal,
          timeout: 10000,
        },
      );

      window.clearTimeout(timeoutId);
    } catch (error) {
      // Silently fail
      console.warn(
        'Failed to capture optimizer action log (non-critical):',
        error,
      );
      // In production, we might want to track this internally without user-facing errors
      // Could potentially queue for retry or use a different logging mechanism
    }
  };
};
