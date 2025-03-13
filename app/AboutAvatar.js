import { useState, useEffect } from "react";
import { Text, Alert, Image, StyleSheet, View, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import db from "@/database/db";
import Button from "@/components/Button";
import Theme from "@/assets/theme";
import  { avatarImages } from "@/assets/imgPaths";
import { introDesc } from "@/assets/avatarInfo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"; // Import FontAwesome for back icon
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AboutAvatar() {
  const [avatarId, setAvatarId] = useState(null);
  const [avatarName, setAvatarName] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();
  
  const fetchAvatar = async () => {
    try {
      setIsLoading(true);
      
      // Retrieve the selected avatar from AsyncStorage
      const storedAvatar = await AsyncStorage.getItem("chosen_avatar");

      if (!storedAvatar) {
        console.error("No avatar found in AsyncStorage.");
        setAvatarName("Unknown");
        return;
      }

      console.log("Fetched Avatar:", storedAvatar);
      setAvatarName(storedAvatar); // Update UI with stored avatar
    } catch (err) {
      console.error("Error fetching avatar:", err.message);
      setAvatarName("Unknown");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatar();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome6 name="arrow-left" size={24} color={Theme.colors.textPrimary} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.circle} />

      <View style={styles.splash}>
        <Text style={styles.desc}>You selected:</Text>
        {isLoading ? (
          <Text style={styles.splashText}>Loading...</Text>
        ) : (
          <Text style={styles.splashText}>{avatarName}</Text>
        )}
      </View>
      <Image source={avatarImages[avatarName]} style={styles.img} />
      <Text style={styles.desc}>{isLoading ? "Loading..." : introDesc[avatarName]}</Text>
      <Button style={styles.button} clickable={true} text="Next" onPress={() => navigation.navigate("ChooseLocation")} />
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 70,
    left: 20,
    zIndex: 10, // Ensures it's above other UI elements
  },
  button: {
    marginTop: 30,
  },
  backButtonText: {
    marginLeft: 10,
    fontSize: 18,
    color: Theme.colors.textPrimary,
  },
  desc: {
    textAlign: "center",
    fontSize: 20,
    paddingHorizontal: 15,
  },
  img: {
    alignSelf: "center",
    marginBottom: 30,
    width: 200,
    height: 265
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
  splash: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 80,
  },
  splashText: {
    marginTop: 15,
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    textAlign: "center",
    fontSize: 30,
  },
});
