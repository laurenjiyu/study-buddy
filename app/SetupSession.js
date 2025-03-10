import { useState, useEffect } from "react";
import { Text, Image, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import Button from "@/components/Button";
import TextBubble from "@/components/TextBubble";
import Theme from "@/assets/theme";
import ChatSection from "@/components/ChatSection";
import AvatarAnimation from "@/components/AvatarAnimation";
import { avatarImages, bgImages } from "@/assets/imgPaths";
import { avatarWelcome } from "@/assets/avatarInfo";

export default function SetupSession() {
  const [avatarName, setAvatarName] = useState("Loading...");
  const [avatarDesc, setAvatarDesc] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [chosenBg, chooseBg] = useState("bedroom");
  const [chatVisible, setChatVisible] = useState(false); // Toggle chat visibility

  const navigation = useNavigation();

  const getBgImage = (name) => bgImages[name] || bgImages.bedroom;

  const fetchAvatar = async () => {
    try {
      setIsLoading(true);

      // Retrieve avatar details and background from AsyncStorage
      const storedAvatar = await AsyncStorage.getItem("chosen_avatar");
      const storedAvatarDesc = await AsyncStorage.getItem("avatar_description");
      const storedBg = await AsyncStorage.getItem("chosen_background");

      if (!storedAvatar) {
        console.error("No avatar found in AsyncStorage.");
        setAvatarName("Unknown");
        setAvatarDesc("No description available.");
        return;
      }

      console.log("Fetched Avatar:", storedAvatar);
      setAvatarName(storedAvatar);
      setAvatarDesc(storedAvatarDesc || "No description available.");
      chooseBg(storedBg || "bedroom"); // Set background, default to bedroom if not found
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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Background Image */}
      <Image source={getBgImage(chosenBg)} style={styles.backgroundImg} />

      {/* Intro greeting + animation */}
      {!chatVisible ? (
        <>
          <AvatarAnimation avatarName={avatarName} />
          <TextBubble
            moreStyle={styles.textBubble}
            text={avatarWelcome[avatarName] || "Hello there!"}
          />
          <Button
            style={styles.button}
            clickable={true}
            text="Next"
            onPress={() => setChatVisible(true)}
          />
        </>
      ) : (
        <>
          <Image style={styles.avatarImg} source={avatarImages[avatarName]} />
          <ChatSection
            visible={chatVisible}
            onClose={() => setChatVisible(false)}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    marginTop: 30,
    position: "absolute",
    bottom: 200,
    zIndex: 2,
  },
  textBubble: {
    top: 120, // Adjust as needed
    alignSelf: "center",
    zIndex: 1, // Ensures it's on top of avatar
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    alignSelf: "center",
  },
  avatarImg: {
    height: 300,
    width: 300,
    marginTop: 190,
    alignSelf: "center",
    resizeMode: "contain",
    position: "absolute",
    zIndex: -1,
  },
  backgroundImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    zIndex: -2,
  },
});
