import * as ActionTypes from "./actiontypes";

const initialState = {
  loggedIn: false
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.LoginUser:
      return { ...state, loggedIn: true, currentUser: action.payload.user };
    case ActionTypes.LogOutUser:
      return { ...state, loggedIn: false };
    case ActionTypes.SetContacts:
      return { ...state, contacts: action.payload.contacts };
    default:
      return state;
  }
};
