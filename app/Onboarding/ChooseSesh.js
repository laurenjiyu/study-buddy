import { useState, useEffect } from "react";
import {
  Text,
  Alert,
  StyleSheet,
  View,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Button from "@/components/Button";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import ChoiceButton from "@/components/ChoiceButton";
import { onboardingImages } from "@/assets/imgPaths";

import Theme from "@/assets/theme";

export default function ChooseSesh() {
  const [preferredAvatar, setAvatar] = useState("Positive Percy");
  const [preferredWorkLen, setWorkLen] = useState(0);
  const [selectedChoice, setChoice] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const idealLen = await AsyncStorage.getItem("ideal_work_time");
        const favAvatar = await AsyncStorage.getItem("preferred_avatar");

        if (idealLen !== null) setWorkLen(idealLen);
        if (favAvatar !== null) setAvatar(favAvatar);
      } catch (err) {
        console.error("Error loading preferences:", err.message);
      }
    };

    loadData(); // Call the async function
  }, []);

  const chooseButton = (chosenOption) => {
    setChoice(chosenOption);
  };

  const confirmChoice = async () => {
    if (selectedChoice === "setup") {
      try {
        console.log("Moving onto creating session");
        navigation.navigate("ChooseAvatar");
      } catch (err) {
        console.error("Unexpected error moving to session creation: ", err.message);
      }
    } else {
      try {
        await AsyncStorage.setItem("chosen_avatar", preferredAvatar);
        await AsyncStorage.setItem("time_worked", JSON.stringify(0));
  
        console.log("Selected options for quickstart");
  
        // pass sessionStage="countdown"
        navigation.navigate("SetupSession", { sessionStage: "countdown" });
  
      } catch (err) {
        console.error("Unexpected error moving to session creation: ", err.message);
      }
    }
  };
  

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("StartPage")}
      >
        <FontAwesome6
          name="arrow-left"
          size={24}
          color={Theme.colors.textPrimary}
        />
        <Text style={styles.backButtonText}>Change preferences</Text>
      </TouchableOpacity>

      <View style={styles.circle} />

      <View style={styles.mainSection}>
        <Text style={styles.question}>Let's get productive!</Text>
        <View style={styles.choices}>
          <ChoiceButton
            title={"Set up session"}
            choice={"setup"}
            actionFunction={chooseButton}
            imageSrc={onboardingImages["setup"]}
            desc={"Choose your avatar, task, and timeframe!"}
            currentChoice={selectedChoice}
          />
          <ChoiceButton
            title={"Quickstart"}
            choice={"quickstart"}
            actionFunction={chooseButton}
            imageSrc={onboardingImages["quickstart"]}
            desc={"Start a " + preferredWorkLen + " minute session immediately with " + preferredAvatar + "!"}
            currentChoice={selectedChoice}
          />
        </View>
      </View>

      <Button
        style={styles.button}
        text="Next"
        onPress={confirmChoice}
        clickable={selectedChoice != ""}
      />
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
    zIndex: 10,
  },
  backButtonText: {
    marginLeft: 10,
    fontSize: 18,
    color: Theme.colors.textPrimary,
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
  mainSection: {
    marginTop: "50%",
  },
  question: {
    fontSize: 30,
    textAlign: "center",
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 30,
  },
  choices: {
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 30,
  },
  button: {
    padding: 8,
    position: "absolute",
    bottom: 150,
  },
});
