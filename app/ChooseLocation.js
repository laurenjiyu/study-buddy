import { useState, useEffect } from "react";
import { Text, Alert, Image, StyleSheet, View, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import Button from "@/components/Button";
import Theme from "@/assets/theme";
import { avatarImages, bgImages } from "@/assets/imgPaths";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"; // back icon

export default function ChooseLocation() {
  const [avatarName, setAvatarName] = useState("Loading...");
  const [avatarDesc, setAvatarDesc] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [chosenBg, chooseBg] = useState("bedroom");

  const navigation = useNavigation();

  const getBgImage = (name) => bgImages[name] || bgImages.bedroom;
  const getAvatarImage = (name) => avatarImages[name];

  const confirmBg = async () => {
    try {
      console.log("Selected background:", chosenBg);

      // Store chosen background in AsyncStorage
      await AsyncStorage.setItem("chosen_background", chosenBg);

      console.log("Success", `You have chosen ${chosenBg}!`);
      navigation.navigate("SetupSession");
    } catch (err) {
      console.error("Unexpected error updating background:", err.message);
    }
  };

  const fetchAvatar = async () => {
    try {
      setIsLoading(true);

      // Retrieve avatar name and description from AsyncStorage
      const storedAvatar = await AsyncStorage.getItem("chosen_avatar");
      const storedAvatarDesc = await AsyncStorage.getItem("avatar_description");

      if (!storedAvatar) {
        console.error("No avatar found in AsyncStorage.");
        setAvatarName("Unknown");
        setAvatarDesc("No description available.");
        return;
      }

      console.log("Fetched Avatar:", storedAvatar);
      setAvatarName(storedAvatar);
      setAvatarDesc(storedAvatarDesc || "No description available.");
    } catch (err) {
      console.error("Error fetching avatar:", err.message);
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
        onPress={() => chooseBg(setting)}
        style={styles.imageOption}
      >
        <Image
          source={bgImages[setting]}
          style={[styles.imagePreview, chosenBg !== setting && styles.inactive]}
        />
      </TouchableOpacity>
    );
  };

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
        <ImageOption setting={"bedroom"} />
        <ImageOption setting={"cafe"} />
        <ImageOption setting={"library"} />
      </View>

      {/* Background Image */}
      <View style={styles.backgroundWrapper}>
        <Image source={getBgImage(chosenBg)} style={styles.backgroundImg} />
        <Image source={getAvatarImage(avatarName)} style={styles.avatarImg} />
      </View>

      <Button
        style={styles.button}
        clickable={true}
        text="Next"
        onPress={confirmBg}
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
    zIndex: 10,
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
    position: "absolute", 
  },
  backgroundImg: {
    width: "90%", 
    height: "100%",
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
