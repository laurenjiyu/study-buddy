import { useState, useEffect } from "react";
import {
  Text,
  Alert,
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import db from "@/database/db";
import Button from "@/components/Button";
import Theme from "@/assets/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"; // Import FontAwesome for back icon

export default function AboutAvatar() {
  const [avatarId, setAvatarId] = useState(null);
  const [avatarName, setAvatarName] = useState("Loading...");
  const [avatarDesc, setAvatarDesc] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [chosenImg, chooseImg] = useState("bedroom");

  const navigation = useNavigation();

  const avatarImages = {
    "Positive Percy": require("@/assets/avatar/positive-percy.png"),
    "Sassy Mary": require("@/assets/avatar/sassy-mary.png"),
    "Gentle Joey": require("@/assets/avatar/gentle-joey.png"),
  };

  const bgImages = {
    bedroom: require("@/assets/backgrounds/bedroom.png"),
    cafe: require("@/assets/backgrounds/cafe.png"),
    library: require("@/assets/backgrounds/library.png"),
  };

  const fetchAvatar = async () => {
    try {
      setIsLoading(true);

      // Get the chosen avatar ID from `user-info`
      const { data: userInfo, error: userInfoError } = await db
        .from("user-info")
        .select("chosen_avatar")
        .eq("id", 1)
        .maybeSingle();

      if (userInfoError || !userInfo?.chosen_avatar) {
        console.error("Error fetching user-info:", userInfoError?.message);
        setAvatarName("Unknown");
        setAvatarDesc("No description available.");
        setIsLoading(false);
        return;
      }

      const avatarId = userInfo.chosen_avatar;
      setAvatarId(avatarId);
      console.log("Fetched Avatar ID:", avatarId);

      // Get the avatar name & description from `avatar-options`
      const { data: avatarData, error: avatarError } = await db
        .from("avatar-options")
        .select("name, intro_desc")
        .eq("id", avatarId)
        .maybeSingle();

      if (avatarError || !avatarData) {
        console.error("Error fetching avatar details:", avatarError?.message);
        setAvatarName("Unknown");
        setAvatarDesc("No description available.");
        setIsLoading(false);
        return;
      }

      // Update state with fetched data
      setAvatarName(avatarData.name);
      setAvatarDesc(avatarData.intro_desc);
      console.log("Fetched Avatar:", avatarData.name, avatarData.intro_desc);
    } catch (err) {
      console.error("Unexpected error fetching avatar:", err.message);
      setAvatarName("Unknown");
      setAvatarDesc("No description available.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatar();
  }, []);

  const ImageOption = ({ setting }) => {
    return (
      <TouchableOpacity
        onPress={() => chooseImg(setting)}
        style={styles.imageOption}
      >
        <Image
          source={bgImages[setting]}
          style={[styles.imagePreview, chosenImg != setting && styles.inactive]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Back Button */}
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
      <View style={styles.circle} />
      <View style={styles.splash}>
        {isLoading ? (
          <Text style={styles.splashText}>{avatarName}</Text>
        ) : (
          <Text style={styles.splashText}>
            Where is {avatarName} going to do their work?
          </Text>
        )}
      </View>

      {/* Render selectable background options */}
      <View style={styles.imageOptionsContainer}>
        {Object.keys(bgImages).map((key) => (
          <ImageOption key={key} setting={key} />
        ))}
      </View>

      {/* Background Image */}
      <View style={styles.backgroundWrapper}>
        <Image source={bgImages[chosenImg]} style={styles.backgroundImg} />
        <Image source={avatarImages[avatarName]} style={styles.avatarImg} />
      </View>

      <Button
        style={styles.button}
        clickable={true}
        text="Next"
        onPress={() => navigation.navigate("NextScreen")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 45,
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
    marginBottom: 20,
    marginTop: 80,
  },
  splashText: {
    marginTop: 15,
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    textAlign: "center",
    fontSize: 30,
  },
  imageOptionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  imageOption: {
    marginHorizontal: 10,
  },
  imagePreview: {
    width: 100,
    height: 130,
    borderRadius: 10,
  },
  inactive: {
    opacity: 0.3,
  },
  avatarImg: {
    height: 270,
    resizeMode: "contain",
    position: "absolute", // Places avatar over background
  },
  backgroundImg: {
    width: "90%", // Adjust width for better fit
    height: "100%", // Covers the allocated space
    resizeMode: "cover",
    borderRadius: 20,
  },
  backgroundWrapper: {
    width: "100%",
    height: 250, 
    alignItems: "center",
    justifyContent: "center",
    position: "relative", 
    marginBottom: 20,
    marginTop: 30,
  },
});
