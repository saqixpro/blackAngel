import React from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import { colors } from "../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
const { width, height } = Dimensions.get("screen");

const Welcome = (props) => {
  const handlePress = () => {
    props.navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainApp}>
        <View style={[styles.centerAlign, { height: height / 1.15 }]}>
          <Image
            source={require("../assets/images/test.png")}
            style={styles.image}
          />
          <TouchableOpacity onPress={handlePress} style={styles.button}>
            <Text style={styles.buttonText}>Enter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainApp: {
    width,
    position: "absolute",
    top: height / 10,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background
  },
  container: {
    backgroundColor: colors.primary,
    width,
    height
  },
  centerAlign: {
    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    width: 300,
    height: 300
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    paddingHorizontal: 80,
    borderRadius: 20,
    marginVertical: 50
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.whiteText
  }
});

export default Welcome;
