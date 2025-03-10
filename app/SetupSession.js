import { useState, useEffect, useRef } from "react";
import { Text, Image, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import db from "@/database/db";
import Button from "@/components/Button";
import TextBubble from "@/components/TextBubble";
import Theme from "@/assets/theme";
import ChatSection from "@/components/ChatSection";
import AvatarAnimation from "@/components/AvatarAnimation";
import { avatarImages, bgImages } from "@/assets/imgPaths";
import { avatarWelcome } from "@/assets/avatarInfo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"; // Import FontAwesome for back icon

export default function SetupSession() {
  const [avatarName, setAvatarName] = useState("Loading...");
  const [avatarDesc, setAvatarDesc] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [chosenBg, chooseBg] = useState("bedroom");
  const [chatVisible, setChatVisible] = useState(false); // Toggle if the chat with the avatar is visible

  const navigation = useNavigation();

  const getBgImage = (name) => bgImages[chosenBg];

  const fetchAvatar = async () => {
    try {
      setIsLoading(true);

      const { data: userInfo, error: userInfoError } = await db
        .from("user-info")
        .select("chosen_avatar, chosen_background")
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
      chooseBg(userInfo.chosen_background);
      console.log("Fetched Avatar ID:", avatarId);

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

      setAvatarName(avatarData.name);
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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Background Image */}
      <Image source={getBgImage(chosenBg)} style={styles.backgroundImg} />

      {/* The intro greeting + animation */}
      {!chatVisible ? (
        <>
          <AvatarAnimation avatarName={avatarName} />
          <TextBubble
            moreStyle={styles.textBubble}
            text={avatarWelcome[avatarName]}
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
