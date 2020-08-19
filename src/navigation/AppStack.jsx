import React from "react";

import {
  createStackNavigator,
  TransitionPresets
} from "@react-navigation/stack";
import {
  Welcome,
  Home,
  Contacts,
  UsernameScreen,
  Angels,
  AddContact
} from "../screens";

const { Navigator, Screen } = createStackNavigator();

const AppStack = () => (
  <Navigator
    screenOptions={{
      headerShown: false,
      ...TransitionPresets.RevealFromBottomAndroid
    }}
  >
    <Screen name="username" component={UsernameScreen} />
    <Screen name="Angels" component={Angels} />
    <Screen name="Welcome" component={Welcome} />
    <Screen name="Home" component={Home} />
    <Screen name="contacts" component={Contacts} />
    <Screen name="AddContact" component={AddContact} />
  </Navigator>
);

export default AppStack;
