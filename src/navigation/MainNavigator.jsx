import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import firebase from "firebase";
import AppStack from "./AppStack";
import AuthStack from "./AuthStack";
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

export default MainNavigator;
