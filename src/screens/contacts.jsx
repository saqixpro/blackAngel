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
import {
  FlatList,
  TouchableOpacity,
  TextInput
} from "react-native-gesture-handler";
import { colors } from "../constants/theme";
import firebase from "firebase";
import { Loading } from "../components/loading";
import { Entypo, FontAwesome } from "@expo/vector-icons";

import * as SMS from "expo-sms";

const { width, height } = Dimensions.get("screen");

const Contact = ({ id, name, phoneNumber, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.contactCard}>
      <View style={{ flex: 0.5, alignItems: "flex-start" }}>
        <Text
          style={{
            color: colors.whiteText,
            paddingVertical: 5,
            fontWeight: "600",
            fontSize: 16
          }}
        >
          {"   " + name}
        </Text>
      </View>
      <View style={{ flex: 0.5, alignItems: "center" }}>
        <Text
          style={{
            color: colors.placeholderColor,
            paddingVertical: 5,
            fontSize: 13
          }}
        >
          {phoneNumber ? phoneNumber : "No Phone Number Available"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

class Contacts extends Component {
  state = {
    contacts: null,
    loading: false,
    canSendSMS: false,
    searchFilter: null
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
    if (user.docs.length > 0) {
      user.docs.map((doc) => {
        let response = fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            to: doc.data().token,
            sound: "default",
            title: `Black Angel`,
            body: `Auto Generated Message!`
          })
        });
      });
    } else if (this.state.canSendSMS)
      await this.sendSMSAsync(phone, `Auto Generated Message!`);
  };

  handleSearch = (text) => {
    const { contacts } = this.props;

    const findContacts = contacts.filter((contact) =>
      contact.name.includes(text)
    );

    this.setState({ contacts: findContacts });
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
          <View style={styles.searchInput}>
            <View style={{ flex: 0.1 }}>
              <FontAwesome
                style={{ padding: 10, color: colors.placeholderColor }}
                name="search"
                size={18}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                onChangeText={(text) => this.handleSearch(text)}
                placeholderTextColor={colors.placeholderColor}
                placeholder="Search"
                style={styles.input}
              />
            </View>
          </View>
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
    flexDirection: "row",
    marginVertical: 15,
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
  },
  searchInput: {
    backgroundColor: colors.secondaryBackground,
    width: width / 1.1,
    padding: 5,
    flexDirection: "row",
    alignSelf: "center",
    marginVertical: 20,
    borderRadius: 10
  },
  input: {
    padding: 10,
    fontSize: 16,
    color: colors.whiteText
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
