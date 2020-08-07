import React from "react";

import { createStackNavigator } from "@react-navigation/stack";
import { Welcome, Home } from "../screens";

const { Navigator, Screen } = createStackNavigator();

const AppStack = () => (
  <Navigator screenOptions={{ headerShown: false }}>
    <Screen name="Welcome" component={Welcome} />
    <Screen name="Home" component={Home} />
  </Navigator>
);

export default AppStack;
