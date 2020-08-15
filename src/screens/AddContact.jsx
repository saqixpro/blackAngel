import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  Dimensions,
  Alert,
  Image
} from "react-native";
import { TouchableOpacity, TextInput } from "react-native-gesture-handler";
import { colors } from "../constants/theme";
import firebase from "firebase";
import { Loading } from "../components/loading";
import { StackActions, NavigationAction } from "@react-navigation/native";

const { width, height } = Dimensions.get("screen");

export class AddContact extends Component {
  state = {
    users: null,
    angels: [],
    uid: null,
    currentUser: null,
    loading: false
  };

  fetchAllUsersFromFirebase = async () => {
    const data = await firebase.firestore().collection("Users").get();
    const users = [];
    const docs = data.docs.map((doc) => users.push(doc));
    this.setState({ users });
  };

  findUserByUID = async (uid) => {
    const user = await firebase
      .firestore()
      .collection("Users")
      .where("UID", "==", uid)
      .get();

    if (!user.empty) {
      const _usr = user.docs.find((user) => user.data().UID == uid);
      return _usr;
    }
  };

  fetchCurrentUser = async () => {
    const userID = await firebase.auth().currentUser.uid;
    const user = await firebase
      .firestore()
      .collection("Users")
      .doc(userID)
      .get();
    this.setState({ currentUser: user.data() });
  };

  handleAdd = async () => {
    if (this.state.uid) {
      this.setState({ loading: true });
      const _usr = await this.findUserByUID(this.state.uid);

      // Add That User To The Angels List Of This User
      this.setState({ angels: [...this.state.angels, _usr.id] });

      // Send Notification To That User
      let response = fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: _usr.data().token,
          sound: "default",
          title: `Black Angel`,
          body: `${
            this.state.currentUser ? this.state.currentUser.username : "Someone"
          } has Added You as their Angel!`
        })
      });

      await firebase
        .firestore()
        .collection("Users")
        .doc(firebase.auth().currentUser.uid)
        .set({ Angels: this.state.angels }, { merge: true });

      this.props.navigation.navigate("Home");
    }
  };

  componentDidMount = async () => {
    await this.fetchAllUsersFromFirebase();
    await this.fetchCurrentUser();
    this.setState({ angels: [...this.state.currentUser.Angels] });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 0.4, justifyContent: "center", alignItems: "center" }}
        >
          <Image
            source={require("../assets/images/test.png")}
            style={{ width: 160, height: 160 }}
          />
        </View>
        {this.state.loading ? <Loading /> : null}
        <View
          style={{
            flex: 0.6,
            justifyContent: "flex-start",
            alignItems: "center"
          }}
        >
          <Text style={styles.title}>
            Enter Angel's ID to Add To Your Angel List
          </Text>
          <View>
            <TextInput
              placeholderTextColor={colors.placeholderColor}
              maxLength={5}
              onChangeText={(text) => this.setState({ uid: text })}
              placeholder="Enter User uid"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <View style={{ flexDirection: "row", width: "100%" }}>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <TouchableOpacity
                onPress={this.handleAdd}
                style={styles.smallButton}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
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
  input: {
    borderRadius: 20,
    width: width / 1.05,
    fontSize: 18,
    marginVertical: 30,
    borderBottomColor: colors.placeholderColor,
    borderBottomWidth: 2,
    color: colors.whiteText,
    textAlign: "center",
    padding: 10
  },
  title: {
    color: colors.whiteText,
    marginVertical: 30,
    fontSize: 18,
    fontWeight: "600"
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    alignItems: "center",
    borderRadius: 20,
    width: width / 1.8,
    marginVertical: 20
  },
  smallButton: {
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: colors.whiteText,
    fontWeight: "600",
    fontSize: 25
  }
});
