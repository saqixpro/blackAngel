import * as ActionTypes from "./actiontypes";

const initialState = {
  contacts: []
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SetContacts:
      return { ...state, contacts: action.payload.contacts };
    default:
      return state;
  }
};
