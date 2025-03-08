import { useState } from "react";
import {
  Text,
  Alert,
  StyleSheet,
  View,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import db from "@/database/db";

import Theme from "@/assets/theme";

const avatarDict = {"Positive Percy": "Stays positive even in the hardest times",
  "Sassy Mary": "Gets a little feisty and will put you to work",
  "Gentle Joey": "Understanding and very forgiving at all times",
  };

const avatarImages = {
  "Positive Percy": require("@/assets/avatar/positive-percy.png"),
  "Sassy Mary": require("@/assets/avatar/sassy-mary.png"),
  "Gentle Joey": require("@/assets/avatar/gentle-joey.png"),
};

export default function AvatarChoice({avatar, alignment, chooseAvatar, chosen}) {

  const selectAvatar = () => {
    chooseAvatar(avatar);
    console.log(avatar)
  }

  const signInWithEmail = async () => {
    setLoading(true);
    try {
      const { data, error } = await db.auth.signInWithPassword({
        email: email,
        password: password,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        Alert.alert(error.message);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <View style={styles.biggerContainer}>
      {alignment === "left" ? (
        <>
          <TouchableOpacity style={[styles.grayRectangle, chosen && styles.selected]} onPress={selectAvatar}>
            <View style={styles.textSectionLeft}>
              <Text style={styles.name}>{avatar}</Text>
              <Text>{avatarDict[avatar]}</Text>
            </View>
          </TouchableOpacity>
          <Image source={avatarImages[avatar]} style={styles.imgLeft} />
        </>
      ) : (
        <>
          <TouchableOpacity style={[styles.grayRectangle, chosen && styles.selected]} onPress={selectAvatar}>
            <View style={styles.textSectionRight}>
              <Text style={styles.name}>{avatar}</Text>
              <Text>{avatarDict[avatar]}</Text>
            </View>
          </TouchableOpacity>
          <Image source={avatarImages[avatar]} style={styles.imgRight} />
        </>
      )}
    </View>
  );


}

const styles = StyleSheet.create({
  name: {
    fontWeight: "bold",
    fontSize: 25,
    paddingBottom: 10,
  },
  biggerContainer: {
    height: 180,
    justifyContent: "center",
  },
  textSectionLeft: {
    marginLeft: 80,
    justifyContent: "center",
  },
  textSectionRight: {
    marginRight: 80,
    textAlign: "right",
    justifyContent: "center",
  },
  grayRectangle: {
    justifyContent: "center",
    padding: 20,
    margin: 30,
    borderRadius: 20,
    backgroundColor: Theme.colors.lightGray,
  },
  selected: {
    backgroundColor: Theme.colors.darkGray,
  },
  imgLeft: {
    position: "absolute",
    maxHeight: 200,
    resizeMode: "contain",
    top: -20,
    left: -20,
    zIndex: 1,
  },
  imgRight: {
    position: "absolute",
    maxHeight: 200,
    resizeMode: "contain",
    top: -20,
    right: -20,
    zIndex: 1,
  },
});
