import React, { useEffect, useState, Component } from "react";
import { connect } from "react-redux";
import {
  Dimensions,
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert
} from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { colors } from "../constants/theme";
import firebase from "firebase";
import { Loading } from "../components/loading";
import { Entypo } from "@expo/vector-icons";

import * as SMS from "expo-sms";

const { width, height } = Dimensions.get("screen");

const Contact = ({ id, name, phoneNumber, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.contactCard}>
      <Text
        style={{
          color: colors.whiteText,
          paddingVertical: 5,
          fontWeight: "600",
          fontSize: 16
        }}
      >
        {name}
      </Text>
      <Text
        style={{
          color: colors.placeholderColor,
          paddingVertical: 5,
          fontSize: 13
        }}
      >
        {phoneNumber ? phoneNumber : "No Phone Number Available"}
      </Text>
    </TouchableOpacity>
  );
};

class Contacts extends Component {
  state = {
    contacts: null,
    loading: false,
    canSendSMS: false
  };

  async componentDidMount() {
    this.setState({ contacts: this.props.contacts });

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      this.setState({ canSendSMS: true });
    } else {
      console.log(
        `SMS is not available on this Device, Some functionalities might not work properly!`
      );
    }
  }

  sendSMSAsync = async (phone, message) => {
    const { result } = await SMS.sendSMSAsync([phone], message);
    alert(result);
  };

  handlePress = async (phone) => {
    this.setState({ loading: true });
    const user = await firebase
      .firestore()
      .collection("Users")
      .where("phoneNumber", "==", phone)
      .get();
    this.setState({ loading: false });
    if (user.docs.length > 0) alert(`user exists`);
    else if (this.state.canSendSMS)
      this.sendSMSAsync(phone, `Auto Generated Message!`);
  };

  render() {
    return (
      <View style={{ ...styles.container, width, height }}>
        <SafeAreaView>
          <View
            style={{
              width,
              padding: 10,
              marginVertical: 20,
              flexDirection: "row"
            }}
          >
            <View style={{ flex: 0.1 }}>
              <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <Entypo color={colors.primary} name="chevron-left" size={26} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={styles.title}>ANGELS</Text>
            </View>
          </View>
          {this.state.loading ? <Loading /> : <View />}
          <FlatList
            data={this.state.contacts}
            renderItem={({ item }) => (
              <Contact
                name={item.name}
                phoneNumber={
                  item.phoneNumbers ? item.phoneNumbers[0].digits : null
                }
                onPress={() => this.handlePress(item.phoneNumbers[0].digits)}
              />
            )}
          />
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background
  },
  contactCard: {
    backgroundColor: colors.secondaryBackground,
    marginVertical: 20,
    width: width / 1.1,
    padding: 10,
    borderRadius: 8,
    shadowColor: "#333",
    shadowOffset: {
      width: 3,
      height: 3
    },
    shadowOpacity: 0.9,
    alignSelf: "center"
  },
  title: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: "bold"
  }
});

const mapStateToProps = (state) => {
  return { ...state };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

const connectComponent = connect(mapStateToProps, mapDispatchToProps);

export default connectComponent(Contacts);
