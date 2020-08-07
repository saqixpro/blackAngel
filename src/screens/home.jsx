import React from "react";
import { StyleSheet, View, Text, Dimensions, StatusBar } from "react-native";
import MapView from "react-native-maps";
import { colors } from "../constants/theme";
import { Header } from "../components";
import { TouchableOpacity } from "react-native-gesture-handler";
const { width, height } = Dimensions.get("screen");

const Home = (props) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />
      <MapView mapType="hybrid" style={styles.mapView}></MapView>
      <View style={styles.bottomBar}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Help</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Angels</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background
  },
  mapView: {
    width,
    height: height / 1.05
  },
  bottomBar: {
    position: "absolute",
    bottom: 20,
    width: width / 1.05,
    marginHorizontal: 10,
    borderRadius: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    height: height / 8,
    flexDirection: "row"
  },
  buttonContainer: {
    flex: 0.5,
    alignItems: "center"
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    paddingHorizontal: 35,
    borderRadius: 15
  },
  buttonText: {
    color: colors.whiteText,
    fontWeight: "600",
    fontSize: 16
  }
});

export default Home;
