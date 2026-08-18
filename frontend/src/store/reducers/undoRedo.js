
const initialState = {
  operations: [],
  currentIndex: 0,
};

export default function runtime(state = initialState, action) {
  switch (action.type) {
    case 'SET_OPERATIONS':
      return { ...state, operations: action.operations };
    case 'SET_OPERATION_CURRENT_INDEX':
      return { ...state, currentIndex: action.currentIndex };
    default:
      return state;
  }
}
