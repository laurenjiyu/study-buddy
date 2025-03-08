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

export default function AvatarChoice({avatar, alignment}) {
  const [selected, selectAvatar] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


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
    <View style = {styles.biggerContainer}>
      <Image source={require('@/assets/avatar/gentle-joey.png')} style={styles.img} />
      <View style={styles.grayRectangle}>
        <View style={styles.textSection}>
          <Text style = {styles.name}>{avatar}</Text>
          <Text>{avatarDict[avatar]}</Text>
        </View>
      </View>
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
    height: 200,
    justifyContent: "center",
  },
  textSection: {
    marginLeft: 80,
    justifyContent: "center",
  },
  grayRectangle: {
    justifyContent: "center",
    padding: 20,
    margin: 30,
    borderRadius: 20,
    backgroundColor: Theme.colors.lightGray,
  },
  img: {
    position: "absolute",
    maxHeight: 200,
    resizeMode: "contain",
    top: -20,
    left: -20,
    zIndex: 1,
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
