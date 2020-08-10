import React, { useEffect, useState, Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  StatusBar,
  Alert
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { colors } from "../constants/theme";
import { Header } from "../components";
import { TouchableOpacity } from "react-native-gesture-handler";
const { width, height } = Dimensions.get("screen");
import { connect } from "react-redux";
import * as ActionTypes from "../store/actiontypes";
import * as Contacts from "expo-contacts";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import firebase, { firestore } from "firebase";
import { FontAwesome5 } from "@expo/vector-icons";

class Home extends Component {
  state = {
    hasLocationPermission: false,
    locationResult: null,
    mapRegion: null,
    currentUser: null,
    publicLocation: false,
    publicAngels: null
  };

  checkPublicLocationAsync = async () => {
    const userID = firebase.auth().currentUser.uid;
    const user = await firebase
      .firestore()
      .collection("Users")
      .doc(userID)
      .get();

    const { publicLocation } = user.data();

    if (!publicLocation)
      await user.ref.set({ publicLocation: false }, { merge: true });

    this.setState({ publicLocation });
  };

  getPublicAngels = async () => {
    const users = await firebase
      .firestore()
      .collection("Users")
      .where("publicLocation", "==", true)
      .get();

    // Exclude Current User (in case if he is publicly available)

    const angels = users.docs.filter(
      (angel) => angel.data().phoneNumber !== this.state.currentUser.phoneNumber
    );

    this.setState({ publicAngels: angels });
  };

  makeLocationPublic = async () => {
    const userID = await firebase.auth().currentUser.uid;

    await firebase
      .firestore()
      .collection("Users")
      .doc(userID)
      .set({ publicLocation: !this.state.publicLocation }, { merge: true });

    this.setState({ publicLocation: !this.state.publicLocation });

    Alert.alert(
      this.state.publicLocation
        ? `Your Location is Now Public, \n Other Angels Can See You Now!`
        : `Your Location is Now Private, \n Other Angels Can't See You Now!`
    );
  };

  getCurrentUser = async () => {
    const user = await firebase
      .firestore()
      .collection("Users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    this.setState({ currentUser: user.data() });
  };

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        locationResult: `Permission to access location was denied`
      });
    } else {
      this.setState({ hasLocationPermission: true });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ locationResult: JSON.stringify(location) });
    // Center the map on the location we just fetched.
    this.setState({
      mapRegion: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    });
  };

  async componentDidMount() {
    await this.checkPublicLocationAsync();
    await this._getLocationAsync();
    await this.getCurrentUser();
    await this.getPublicAngels();

    const userID = await firebase.auth().currentUser.uid;

    await firebase
      .firestore()
      .collection("Users")
      .doc(userID)
      .set(
        {
          location: {
            latitude: this.state.mapRegion.latitude,
            longitude: this.state.mapRegion.longitude
          }
        },
        { merge: true }
      );

    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers]
      });

      if (data.length > 0) {
        this.props.setContacts(data);
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Header onLocationPress={() => this._getLocationAsync()} />
        <MapView
          initialRegion={this.state.mapRegion}
          mapType="terrain"
          followsUserLocation={true}
          style={styles.mapView}
        >
          {this.state.publicAngels
            ? this.state.publicAngels.map((angel) => (
                <Marker
                  coordinate={{
                    longitude: angel.data().location.longitude,
                    latitude: angel.data().location.latitude
                  }}
                  title="Angel"
                  description={angel.data().phoneNumber}
                >
                  <FontAwesome5
                    name="dove"
                    style={{ color: colors.primary }}
                    size={26}
                  />
                </Marker>
              ))
            : null}

          {this.state.mapRegion ? (
            <Marker
              coordinate={{
                latitude: this.state.mapRegion.latitude,
                longitude: this.state.mapRegion.longitude
              }}
              title="Username"
              description={
                this.state.currentUser
                  ? this.state.currentUser.phoneNumber
                  : null
              }
            >
              <FontAwesome5
                name="map-marker-alt"
                style={{ color: colors.primary }}
                size={26}
              />
            </Marker>
          ) : null}
        </MapView>
        <View style={styles.bottomBar}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => this.makeLocationPublic()}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {this.state.publicLocation ? "Hide" : "Help"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("contacts")}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Angels</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

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

const mapStateToProps = (state) => {
  return { ...state };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setContacts: (contacts) =>
      dispatch({ type: ActionTypes.SetContacts, payload: { contacts } })
  };
};

const connectComponent = connect(mapStateToProps, mapDispatchToProps);

export default connectComponent(Home);
