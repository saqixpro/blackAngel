import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import firebase from "firebase";
import AppStack from "./AppStack";
import AuthStack from "./AuthStack";
import { connect } from "react-redux";
import Loader from "./Loader";

const MainNavigator = (props) => {
  const [loggedIn, setLoggedIn] = useState(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) setLoggedIn(true);
      else setLoggedIn(false);
    });
  });

  return (
    <NavigationContainer>
      {loggedIn ? (
        <AppStack />
      ) : loggedIn === false ? (
        <AuthStack />
      ) : (
        <Loader />
      )}
    </NavigationContainer>
  );
};

const mapStateToProps = (state) => {
  return state;
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

const connectComponent = connect(mapStateToProps, mapDispatchToProps);

export default connectComponent(MainNavigator);
