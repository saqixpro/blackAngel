import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AppStack from "./AppStack";
import { Dimensions, View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { colors } from "../constants/theme";
import firebase from "firebase";

const { width } = Dimensions.get("screen");

const { Navigator, Screen } = createDrawerNavigator();

const Content = () => (
  <View style={styles.container}>
    <View style={styles.offset} />
    <View style={styles.content}>
      <TouchableOpacity
        onPress={() => firebase.auth().signOut()}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export const Drawer = ({}) => (
  <Navigator
    drawerContent={Content}
    drawerStyle={{
      width: width / 1.3
    }}
    initialRouteName="AppStack"
  >
    <Screen name="AppStack" component={AppStack} />
  </Navigator>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: colors.secondaryBackground
  },
  offset: {
    flex: 0.8
  },
  content: {
    flex: 0.2,
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    paddingHorizontal: width / 5,
    borderRadius: 20
  },
  buttonText: {
    color: colors.whiteText,
    fontSize: 18,
    fontWeight: "600"
  }
});
