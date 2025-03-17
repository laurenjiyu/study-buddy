import { useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import TimeChoice from "@/components/TimeChoice";
import Button from "@/components/Button";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import Theme from "@/assets/theme";

export default function TimeQ() {
  const [idealWorkLen, setLen] = useState("");
  const [timeOfDay, setTime] = useState("");

  const navigation = useNavigation();

  const chooseTime = (chosenTime) => {
    setLen(chosenTime);
  };

  const confirmTime = async () => {
    try {
      if (idealWorkLen.trim() === "" || isNaN(Number(idealWorkLen))) {
        Alert.alert("Please enter a valid work session length.");
        return;
      }
      await AsyncStorage.setItem("ideal_work_time", idealWorkLen);
      console.log("Stored ideal work session time:", idealWorkLen);
      await AsyncStorage.setItem("ideal_time_of_day", timeOfDay);
      console.log("Stored ideal time of day:", timeOfDay);
      navigation.navigate("ChooseSesh");
    } catch (err) {
      console.error("Unexpected error updating ideal work time:", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.circle} />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <FontAwesome6
          name="arrow-left"
          size={24}
          color={Theme.colors.textPrimary}
        />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.chooseSection}>
        <Text style={styles.question}>
          How many minutes long is your ideal work session?
        </Text>

        {/* Input Field to Track Work Session Time */}
        <TextInput
          style={styles.input}
          value={idealWorkLen}
          placeholder="Enter minutes (e.g., 25)"
          keyboardType="numeric"
          returnKeyType="done"  // Makes the "Enter" key say "Done"
          onSubmitEditing={() => Keyboard.dismiss()} // Hides the keyboard when Enter is pressed
          blurOnSubmit={true} // Ensures the keyboard is dismissed after submit
          onChangeText={(text) => setLen(text)}
        />


        <Text style={styles.question}>
          What time of the day do you like working?
        </Text>

        <View style={styles.choices}>
          <TimeChoice
            time={"Morning"}
            chooseTime={setTime}
            chosen={timeOfDay}
          />
          <TimeChoice
            time={"Afternoon"}
            chooseTime={setTime}
            chosen={timeOfDay}
          />
          <TimeChoice
            time={"Evening"}
            chooseTime={setTime}
            chosen={timeOfDay}
          />
        </View>
      </View>

      <Button
        style={styles.button}
        text="Next"
        onPress={confirmTime}
        clickable={idealWorkLen.trim() !== "" && timeOfDay != ""}
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
  circle: {
    position: "absolute",
    bottom: -50,
    alignSelf: "center",
    width: 450,
    height: 500,
    borderRadius: 150,
    backgroundColor: "white",
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
  chooseSection: {
    flex: 1,
    paddingTop: "25%",
  },
  question: {
    fontSize: 25,
    textAlign: "center",
    fontWeight: "bold",
    alignSelf: "center",
    marginTop: 40,
  },
  input: {
    height: 40,
    width: "80%",
    alignSelf: "center",
    borderColor: Theme.colors.textSecondary,
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 18,
    textAlign: "center",
    marginTop: 15,
    marginBottom: 30,
  },
  choices: {
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    width: "80%",
    alignSelf: "center",
  },
  button: {
    padding: 8,
    position: "absolute",
    bottom: 150,
  },
});
