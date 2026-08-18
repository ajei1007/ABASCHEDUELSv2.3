export const setOperations = (operations) => {
  return (dispatch) => {
    dispatch({
      type: 'SET_OPERATIONS',
      operations,
    });
  };
};
export const setOperationCurrentIndex = (currentIndex) => {
  return (dispatch) => {
    dispatch({
      type: 'SET_OPERATION_CURRENT_INDEX',
      currentIndex,
    });
  };
};
