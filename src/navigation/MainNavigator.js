import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppStack from "./AppStack";

const MainNavigator = () => (
  <NavigationContainer>
    <AppStack />
  </NavigationContainer>
);

export default MainNavigator;
