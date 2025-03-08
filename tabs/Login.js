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

import Theme from "@/assets/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setAvatar] = useState("");

  const updateAvatar = (chosen) => {
    setAvatar(chosen);
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

  const isSignInDisabled =
    loading || email.length === 0 || password.length === 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.splash}>
        <FontAwesome6 name="book-open-reader" size={40} color="black" />
          <Text style={styles.splashText}>Welcome! Choose your productivity friend.</Text>
      </View>
      <View style={styles.choices}>
        <AvatarChoice avatar="Positive Percy" alignment="left" chooseAvatar={updateAvatar} chosen={selectedAvatar === "Positive Percy"}></AvatarChoice>
        <AvatarChoice avatar="Sassy Mary" alignment="right" chooseAvatar={updateAvatar} chosen={selectedAvatar === "Sassy Mary"}></AvatarChoice>
        <AvatarChoice avatar="Gentle Joey" alignment="left" chooseAvatar={updateAvatar} chosen={selectedAvatar === "Gentle Joey"}></AvatarChoice>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => signInWithEmail()}
          disabled={isSignInDisabled}
        >
          <Text
            style={[
              styles.button,
              isSignInDisabled ? styles.buttonDisabled : undefined,
            ]}
          >
            Sign in
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    padding: 12,
    backgroundColor: Theme.colors.backgroundPrimary,
    flex: 1,
  },
  choices: {
    justifyContent: "space-between",
    gap:-10,
  },
  splash: {
    alignItems: "center",
    marginBottom: 12,
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
