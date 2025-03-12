import { useState, useEffect } from "react";
import {
  Text,
  Alert,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import db from "@/database/db";
import AvatarChoice from "@/components/AvatarChoice";
import Button from "@/components/Button";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePushNotifications } from "@/app/hooks/Notifications"; // Adjust path if needed

import Theme from "@/assets/theme";

export default function Login() {
  const { expoPushToken, notification } = usePushNotifications();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setAvatar] = useState("");
  const navigation = useNavigation();
  
  const updateAvatar = (chosen) => setAvatar(chosen);

  useEffect(() => {
    if (expoPushToken) {
      console.log("Expo Push Token:", expoPushToken.data);
    }
  }, [expoPushToken]);


  const confirmAvatar = async () => {
    try {
      console.log("Selected Avatar:", selectedAvatar);
  
      if (!selectedAvatar) {
        Alert.alert("Error", "Please select an avatar before proceeding.");
        return;
      }
  
      // Store the selected avatar in AsyncStorage
      await AsyncStorage.setItem("chosen_avatar", selectedAvatar);
      await AsyncStorage.setItem("time_worked", JSON.stringify(0)); 
  
      console.log("Success", `You have chosen ${selectedAvatar}!`);
      navigation.navigate("AboutAvatar");
    } catch (err) {
      console.error("Unexpected error updating avatar:", err.message);
      Alert.alert("Error", "Could not save avatar selection.");
    }
  };
  

  return (
    <View style={styles.container}>
      {expoPushToken && <Text>Token: {expoPushToken.data}</Text>}
      <StatusBar style="dark" />
      <View style={styles.circle}/>
      <View style={styles.splash}>
          <Text style={styles.splashText}>Welcome! Choose your productivity friend.</Text>
      </View>
      <View style={styles.choices}>
        <AvatarChoice avatar="Positive Percy" alignment="left" chooseAvatar={updateAvatar} chosen={selectedAvatar === "Positive Percy"}></AvatarChoice>
        <AvatarChoice avatar="Sassy Mary" alignment="right" chooseAvatar={updateAvatar} chosen={selectedAvatar === "Sassy Mary"}></AvatarChoice>
        <AvatarChoice avatar="Gentle Joey" alignment="left" chooseAvatar={updateAvatar} chosen={selectedAvatar === "Gentle Joey"}></AvatarChoice>
      </View>
      <Button text="Next" onPress={confirmAvatar} clickable={selectedAvatar != ""}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    padding: 30,
    backgroundColor: Theme.colors.backgroundPrimary,
    flex: 1,
  },
  circle: {
    position: "absolute",
    bottom: -50,
    alignSelf: "center",
    width: 450, 
    height: 500,
    borderRadius: 150, 
    backgroundColor: "white", 
  },
  choices: {
    justifyContent: "space-between",
    gap:-10,
    marginBottom: 30,
  },
  splash: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 40,
  },
  splashText: {
    marginTop: 15,
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    textAlign: "center",
    fontSize: 30,
  },
  buttonContainer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  verticallySpaced: {
    marginVertical: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  input: {
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.backgroundSecondary,
    width: "100%",
    padding: 16,
  },
  button: {
    color: Theme.colors.textHighlighted,
    fontSize: 18,
    fontWeight: 18,
    padding: 8,
  },
  buttonDisabled: {
    color: Theme.colors.textSecondary,
  },
});
