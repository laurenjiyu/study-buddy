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
import Theme from "@/assets/theme";

export default function StartPage() {
  const [selectedAvatar, setAvatar] = useState("");
  const navigation = useNavigation();

  const percyImage = require("@/assets/avatar/positive-percy.png");

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.circle} />
      <Image source={percyImage} style={styles.mainImg} />
      <View style={styles.splash}>
        <Text style={styles.splashText}>Study Bud</Text>
      </View>
      <Text style={styles.description}>
        Helping you stay productive whenever and wherever you need!
      </Text>
      <Button
        text="Next"
        onPress={() => navigation.navigate("FeedbackQ")}
        clickable={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    padding: 30,
    backgroundColor: Theme.colors.backgroundLightBlue,
    flex: 1,
  },
  mainImg: {
    width: "90%",
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: -90,
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
    gap: -10,
    marginBottom: 30,
  },
  splash: {
    alignItems: "center",
  },
  splashText: {
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    textAlign: "center",
    fontSize: 40,
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
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
