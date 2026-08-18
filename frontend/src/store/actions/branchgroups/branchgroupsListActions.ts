import Errors from 'components/FormItems/error/errors';
import axios from 'axios';
import { BranchgroupsListActionTypes } from "types/redux/branchgroups/branchgroupsList";
import type { AppDispatch } from 'store';

async function list(filter?: any) {
  const response = await axios.get(
    `/branchgroups?page=${filter.page}&limit=${filter.limit}&branchgroups=${filter.branchgroups ? filter.branchgroups : ''}`,
  );
  return response.data;
}

async function filterBranchgroups(request: any, filter: any) {
  const response = await axios.get(`/branchgroups?page=${filter.page}&limit=${filter.limit}${request}`);
  return response.data;
}

const actions = {

  doFilter: (request: any, filter: any) => async (
    dispatch: AppDispatch
  ) => {
    try {

      const response = await filterBranchgroups(request, filter);

      dispatch({
        type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FILTERED,
        payload: {
          rows: response.rows,
        },
      });
    } catch (error: any) {
      Errors.handle(error);
      dispatch({
        type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FETCH_ERROR,
      })
    }
  },

  doFetch: (filter: any, keepPagination = false) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FETCH_STARTED,
        payload: { filter, keepPagination },
      });

      const response = await list(filter);

      dispatch({
        type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FETCH_ERROR,
      });
    }
  },

  doDelete: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_DELETE_STARTED,
      });

      await axios.delete(`/branchgroups/${id}`)

      dispatch({
        type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_DELETE_SUCCESS,
      });

      const response = await list();
      dispatch({
        type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });

    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_DELETE_ERROR,
      });
    }
  },
  doOpenConfirm: (id: string) => async (dispatch: AppDispatch) => {
    dispatch({
      type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_OPEN_CONFIRM,
      payload: {
        id: id
      },
    });
  },
  doCloseConfirm: () => async (dispatch: AppDispatch) => {
    dispatch({
      type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_CLOSE_CONFIRM,
    });
  },
};


export default actions;
