import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppStack from "./AppStack";
import AuthStack from "./AuthStack";

import { connect } from "react-redux";

const MainNavigator = (props) => {
  return (
    <NavigationContainer>
      {props.loggedIn ? <AppStack /> : <AuthStack />}
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
