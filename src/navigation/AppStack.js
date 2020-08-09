import React from "react";

import { createStackNavigator } from "@react-navigation/stack";
import { Welcome, Home, Contacts } from "../screens";

const { Navigator, Screen } = createStackNavigator();

const AppStack = () => (
  <Navigator screenOptions={{ headerShown: false }}>
    <Screen name="Welcome" component={Welcome} />
    <Screen name="Home" component={Home} />
    <Screen name="contacts" component={Contacts} />
  </Navigator>
);

export default AppStack;
