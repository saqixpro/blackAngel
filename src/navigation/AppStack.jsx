import React from "react";

import { createStackNavigator } from "@react-navigation/stack";
import { Welcome, Home, Contacts, UsernameScreen, Angels } from "../screens";

const { Navigator, Screen } = createStackNavigator();

const AppStack = () => (
  <Navigator screenOptions={{ headerShown: false }}>
    <Screen name="username" component={UsernameScreen} />
    <Screen name="Angels" component={Angels} />
    <Screen name="Welcome" component={Welcome} />
    <Screen name="Home" component={Home} />
    <Screen name="contacts" component={Contacts} />
  </Navigator>
);

export default AppStack;
