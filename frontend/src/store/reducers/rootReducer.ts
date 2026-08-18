import { combineReducers } from 'redux';
import { store } from '../index';
import authReducer from 'store/reducers/authReducer';
import navigationReducer from 'store/reducers/navigationReducer';
import eventpair from 'store/reducers/eventpair/eventpairReducers';
import statusevents from 'store/reducers/statusevents/statuseventsReducers';
import timeoff from 'store/reducers/timeoff/timeoffReducers';
import priorities from 'store/reducers/priorities/prioritiesReducers';
import users from 'store/reducers/users/usersReducers';
import companies from 'store/reducers/companies/companiesReducers';
import groupings from 'store/reducers/groupings/groupingsReducers';
import cancellationtypes from 'store/reducers/cancellationtypes/cancellationtypesReducers';
import roles from 'store/reducers/roles/rolesReducers';
import branches from 'store/reducers/branches/branchesReducers';
import availabilities from 'store/reducers/availabilities/availabilitiesReducers';
import events from 'store/reducers/events/eventsReducers';
import subgroups from 'store/reducers/subgroups/subgroupsReducers';
import custom from 'store/reducers/custom/customReducers';
import capacityconstraints from 'store/reducers/capacityconstraints/capacityconstraintsReducers';
import cancellations from 'store/reducers/cancellations/cancellationsReducers';
import timeofftypes from 'store/reducers/timeofftypes/timeofftypesReducers';
import mobiletokens from 'store/reducers/mobiletokens/mobiletokensReducers';
import branchtype from 'store/reducers/branchtype/branchtypeReducers';
import totaltypes from 'store/reducers/totaltypes/totaltypesReducers';
import branchgroups from 'store/reducers/branchgroups/branchgroupsReducers';
import drivetimebranch from 'store/reducers/drivetimebranch/drivetimebranchReducers';
import drivetimelocation from 'store/reducers/drivetimelocation/drivetimelocationReducers';
import industries from 'store/reducers/industries/industriesReducers';
import undoRedo from 'store/reducers/undoRedo';
import settings from 'store/reducers/settingReducer';
import distanceMatrix from 'store/reducers/distanceMatrix/distanceMatrixReducers';
import optimizer from './optimizerReducer';
import integration from 'store/reducers/integrationReducer';
import approvals from 'store/reducers/approvalsReducer';
import founderServiceLines from 'store/reducers/founderServiceLines/founderServiceLinesReducers';
import notifications from 'store/reducers/notificationsReducer';
import requests from 'store/reducers/requestsReducer';
import calendar from '../slices/calendar';
import calendarOverlayingPanels from '../slices/calendarOverlayingPanels';
import calendarUndoRedo from '../slices/calendarUndoRedo';
import ticket from '../slices/ticketSlice';
import newIntegration from '../slices/newIntegration';
import statistics from '../slices/statistics';
import npsSurvey from '../slices/npsSurvey';
import onboardingChecklist from '../slices/onboardingChecklist';
import solutionGenerator from '../slices/solutionGenerator';
import flagging from '../slices/flagging';

export const createRootReducer = () =>
  combineReducers({
    auth: authReducer,
    navigation: navigationReducer,
    eventpair,
    timeoff,
    priorities,
    users,
    companies,
    groupings,
    cancellationtypes,
    roles,
    branches,
    availabilities,
    events,
    subgroups,
    statusevents,
    capacityconstraints,
    cancellations,
    calendar,
    calendarOverlayingPanels,
    calendarUndoRedo,
    timeofftypes,
    mobiletokens,
    branchtype,
    totaltypes,
    custom,
    branchgroups,
    drivetimebranch,
    drivetimelocation,
    statistics,
    industries,
    undoRedo,
    settings,
    flagging,
    distanceMatrix,
    optimizer,
    integration,
    approvals,
    founderServiceLines,
    notifications,
    requests,
    ticket,
    newIntegration,
    npsSurvey,
    onboardingChecklist,
    solutionGenerator,
  });

export type RootState = ReturnType<typeof store.getState>;
