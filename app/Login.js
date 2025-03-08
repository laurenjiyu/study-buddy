import { useState } from "react";
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


import Theme from "@/assets/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setAvatar] = useState("");
  const navigation = useNavigation();
  
  const updateAvatar = (chosen) => {
    setAvatar(chosen);
  }

  const confirmAvatar = async () => {
    try {
      console.log("Selected Avatar:", selectedAvatar);
  
      // Step 1: Fetch the avatar ID using the selected avatar name
      const { data: avatarData, error: avatarError } = await db
        .from("avatar-options")
        .select("id")
        .eq("name", selectedAvatar)
        .maybeSingle(); 
  
      if (avatarError || !avatarData) {
        Alert.alert("Error", "Invalid avatar selection. Please try again.");
        return;
      }
  
      const avatarId = avatarData.id; // Get the correct avatar ID
      console.log("Selected Avatar ID:", avatarId);
  
      // Update the row where id=1
      const { error: updateError } = await db
        .from("user-info")
        .update({ chosen_avatar: avatarId, time_worked: 0 })  // No array here, use an object
        .eq("id", 1);  // Only update row where id=1
  
      if (updateError) {
        console.error("Error choosing avatar:", updateError.message);
        Alert.alert("Error", updateError.message);
        return;
      }
  
      console.log("Success", `You have chosen ${selectedAvatar}!`);
      navigation.navigate("AboutAvatar");
    } catch (err) {
      console.error("Unexpected error updating avatar:", err.message);
    }
  };
  
  
  

  return (
    <View style={styles.container}>
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
    bottom: -50, // Move it slightly down so it looks embedded
    alignSelf: "center",
    width: 450, // Circle size
    height: 500, // Circle size
    borderRadius: 150, // Makes it a perfect circle
    backgroundColor: "white", // White background
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
