import React, { useEffect, useState, Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Alert,
  Share,
  Animated
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { colors } from "../constants/theme";
import { Header, Prompt, MessageBOX } from "../components";
import { TouchableOpacity } from "react-native-gesture-handler";
const { width, height } = Dimensions.get("screen");
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import firebase from "firebase";
import { Loading } from "../components/loading";
import { StackActions, StackRouter } from "@react-navigation/native";

class DistanceCalculator {
  static calculateDistanceBetweenTwoPoints = (
    lat1,
    lat2,
    long1,
    long2,
    unit
  ) => {
    if (lat1 == lat2 && long1 == long2) {
      return 0;
    } else {
      let radlat1 = (Math.PI * lat1) / 180;
      let radlat2 = (Math.PI * lat2) / 180;

      let theta = long1 - long2;

      let radtheta = (Math.PI * theta) / 180;

      let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") {
        dist = dist * 1.609344;
      }
      if (unit == "N") {
        dist = dist * 0.8684;
      }
      return dist;
    }
  };
}

class Home extends Component {
  state = {
    hasLocationPermission: false,
    locationResult: null,
    mapRegion: null,
    currentUser: null,
    publicLocation: false,
    publicAngels: [],
    angels: [],
    animation: new Animated.Value(0),
    d_animation: new Animated.Value(0),
    modalVisible: false,
    problem: null,
    loading: false,
    boxVisibility: false,
    currentAngel: null,
    nearbyUsers: null
  };

  blinkAnimation = () => {
    Animated.loop(
      Animated.timing(this.state.animation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      })
    ).start();
  };

  dangerousAnimation = () => {
    Animated.loop(
      Animated.timing(this.state.d_animation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      })
    ).start();
  };

  getPublicAngels = async () => {
    const currentUser = await firebase
      .firestore()
      .collection("Users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    const angels = currentUser.data().Angels;

    angels
      ? angels.map(async (_angel) => {
          const angel = await firebase
            .firestore()
            .collection("Users")
            .doc(_angel)
            .get();

          if (angel)
            this.setState({
              publicAngels: [...this.state.publicAngels, angel]
            });
        })
      : null;
  };

  RequestHelp = async () => {
    // const userID = await firebase.auth().currentUser.uid;

    this.setState({ modalVisible: true, publicLocation: true });

    // Send Notification to Angels

    this.state.publicAngels.map((angel) => {
      let response = fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: angel.data().token,
          sound: "default",
          title: `${
            this.state.currentUser ? this.state.currentUser.username : "User"
          } From Black Angel`,
          body: `${this.state.problem}`
        })
      });
    });
  };

  fetchUsersWhoHaveProblemInTwentyMileRadius = async () => {
    let users = await firebase.firestore().collection("Users").get();

    // Compare Each one's Distance With User's

    const currentUser = users.docs.find(
      (user) => user.id === firebase.auth().currentUser.uid
    );

    users = users.docs.filter((user) => user.id !== currentUser.id);

    const nearbyUsers = users.filter((user) => {
      const distance = DistanceCalculator.calculateDistanceBetweenTwoPoints(
        user.data().location.latitude,
        currentUser.data().location.latitude,
        user.data().location.longitude,
        currentUser.data().location.longitude,
        "M"
      );

      return distance <= 20;
    });

    this.setState({ nearbyUsers });
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
    this.setState({ loading: true });
    await this._getLocationAsync();
    await this.getCurrentUser();
    await this.getPublicAngels();

    this.blinkAnimation();
    this.dangerousAnimation();

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

    await this.fetchUsersWhoHaveProblemInTwentyMileRadius();

    this.setState({ loading: false });
  }

  handlePlusButton = async () => {
    // Test Distance
    const userID = firebase.auth().currentUser.uid;
    const user = await firebase
      .firestore()
      .collection("Users")
      .doc(userID)
      .get();

    const userUID = user.data().UID ? user.data().UID : null;

    if (userUID) Share.share({ url: userUID, message: `${userUID}` });
    else Alert.alert(`User does not have a uid`);
  };

  handleSubmit = async () => {
    this.state.currentUser
      ? await firebase
          .firestore()
          .collection("Users")
          .doc(firebase.auth().currentUser.uid)
          .set({ problem: true }, { merge: true })
      : null;

    const users = await firebase.firestore().collection("Users").get();

    if (!users.empty)
      users.docs.map((user) => {
        const distance = DistanceCalculator.calculateDistanceBetweenTwoPoints(
          this.state.mapRegion.latitude,
          user.data().location.latitude,
          this.state.mapRegion.longitude,
          user.data().location.longitude
        );

        if (distance <= 20) {
          // alert(`${angel.data().username} will get a notification`);
          let response = fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              to: user.data().token,
              sound: "default",
              title: `${
                this.state.currentUser
                  ? this.state.currentUser.username
                  : "User"
              } From Black Angel`,
              body: `${this.state.problem}`
            })
          });
        }
        this.setState({ modalVisible: false });
      });

    Alert.alert(
      `A Notification Your Angels and Other Nearby Users Have Been Sent!`
    );
  };

  markSafePrompt = (id) => {
    this.setState({ boxVisibility: true, currentAngel: id });
  };

  markSafe = async () => {
    const { currentAngel } = this.state;

    await firebase
      .firestore()
      .collection("Users")
      .doc(currentAngel)
      .set({ problem: false }, { merge: true });

    this.setState({ problem: null, currentAngel: null, boxVisibility: false });

    const response = StackActions.replace("Home");
    this.props.navigation.dispatch(response);
  };

  render() {
    const circleIntropolate = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.8]
    });

    const dangerous_ColorBlink = this.state.d_animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1.15]
    });

    const DangerousBlink = {
      opacity: this.state.d_animation,
      transform: [
        {
          scale: dangerous_ColorBlink
        }
      ]
    };

    const BlinkStyle = {
      opacity: this.state.animation,
      transform: [
        {
          scale: circleIntropolate
        }
      ]
    };

    return (
      <View style={styles.container}>
        <Header navigation={this.props.navigation} />

        <MessageBOX
          problem="Something isn't right!"
          visibility={this.state.boxVisibility}
          onPress={this.markSafe}
          username="Test User"
        />

        <Prompt
          onSubmit={this.handleSubmit}
          visibility={this.state.modalVisible}
          onChangeText={(text) => this.setState({ problem: text })}
        />

        {this.state.loading ? <Loading /> : null}

        <MapView
          initialRegion={this.state.mapRegion}
          mapType="standard"
          showsBuildings={true}
          showsMyLocationButton={true}
          showsUserLocation={!this.state.publicLocation}
          showsTraffic={true}
          userLocationAnnotationTitle={
            this.state.problem
              ? this.state.problem
              : this.state.currentUser
              ? this.state.currentUser.username
              : "Loading..."
          }
          style={styles.mapView}
        >
          {this.state.publicAngels
            ? this.state.publicAngels.map((angel) => (
                <Marker
                  coordinate={{
                    longitude: angel.data().location.longitude,
                    latitude: angel.data().location.latitude
                  }}
                  title={angel.data().username}
                  description={angel.data().phoneNumber}
                  onTouchStart={() =>
                    angel.data().problem ? this.markSafePrompt(angel.id) : null
                  }
                >
                  <Animated.View
                    style={[
                      styles.userLocationMarker,
                      angel.data().problem ? DangerousBlink : BlinkStyle
                    ]}
                  >
                    <View style={styles.userLoactionMarkerBorder} />
                    <View
                      style={[
                        styles.userLocationMarkerCore,
                        {
                          backgroundColor: angel.data().problem
                            ? "red"
                            : colors.angel
                        }
                      ]}
                    />
                  </Animated.View>
                </Marker>
              ))
            : null}

          {this.state.nearbyUsers
            ? this.state.nearbyUsers.map((user) => (
                <Marker
                  coordinate={{
                    longitude: user.data().location.longitude,
                    latitude: user.data().location.latitude
                  }}
                  title={user.data().username}
                  description={user.data().phoneNumber}
                >
                  <Animated.View
                    style={[
                      styles.userLocationMarker,
                      user.data().problem ? DangerousBlink : BlinkStyle
                    ]}
                  >
                    <View style={styles.userLoactionMarkerBorder} />
                    <View
                      style={[
                        styles.userLocationMarkerCore,
                        {
                          backgroundColor: user.data().problem
                            ? "red"
                            : colors.user
                        }
                      ]}
                    />
                  </Animated.View>
                </Marker>
              ))
            : null}

          {this.state.mapRegion && this.state.publicLocation ? (
            <Marker
              coordinate={{
                latitude: this.state.mapRegion.latitude,
                longitude: this.state.mapRegion.longitude
              }}
              title={
                this.state.currentUser
                  ? this.state.currentUser.username
                  : "username"
              }
              description={this.state.problem ? this.state.problem : null}
            >
              <Animated.View style={[styles.userLocationMarker, BlinkStyle]}>
                <View style={styles.userLoactionMarkerBorder} />
                <View style={[styles.userLocationMarkerCore]} />
              </Animated.View>
            </Marker>
          ) : null}
        </MapView>
        <View style={styles.bottomBar}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => this.RequestHelp()}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Help</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={this.handlePlusButton}
              style={{
                ...styles.button
              }}
            >
              <Text style={styles.buttonText}>+</Text>
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
    backgroundColor: colors.background,
    width,
    height
  },
  mapView: {
    width,
    height,
    margin: 0,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: -1
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 20,
    paddingHorizontal: 5,
    flexDirection: "row"
  },
  buttonContainer: {
    flex: 0.33,
    alignItems: "center"
  },
  button: {
    backgroundColor: colors.background,
    padding: 10,
    paddingHorizontal: 25,
    borderRadius: 10
  },
  buttonText: {
    color: colors.whiteText,
    fontWeight: "600",
    fontSize: 16
  },
  userLocationMarker: {
    width: 28,
    backgroundColor: "#fff",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2
    },
    shadowOpacity: 0.9,
    height: 28,
    borderRadius: 50
  },
  userLoactionMarkerBorder: {
    backgroundColor: "#ffffff",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    borderRadius: 50,
    zIndex: -10
  },
  userLocationMarkerCore: {
    backgroundColor: colors.primary,
    width: 22,
    position: "absolute",
    top: 3,
    left: 3,
    right: 2,
    bottom: 2,
    height: 22,
    borderRadius: 50,
    zIndex: 10
  }
});

export default Home;
