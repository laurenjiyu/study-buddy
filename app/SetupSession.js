import { useState, useEffect } from "react";
import { Text, Image, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/Button";
import TextBubble from "@/components/TextBubble";
import ChatSection from "@/components/ChatSection";
import AvatarAnimation from "@/components/AvatarAnimation";
import { avatarImages, bgImages } from "@/assets/imgPaths";
import { avatarWelcome } from "@/assets/avatarInfo";
import WorkSession from "@/app/WorkSession"; // Import new WorkSession component

export default function SetupSession() {
  const [avatarName, setAvatarName] = useState("Loading...");
  const [avatarDesc, setAvatarDesc] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [chosenBg, chooseBg] = useState("bedroom");

  // Flow stages: "intro", "workTopic", "timeInput", "timer"
  const [sessionStage, setSessionStage] = useState("intro");
  const [workTopic, setWorkTopic] = useState("");
  const [sessionDuration, setSessionDuration] = useState(0); // duration in seconds

  const navigation = useNavigation();

  const getBgImage = (name) => bgImages[name] || bgImages.bedroom;

  const fetchAvatar = async () => {
    try {
      setIsLoading(true);
      const storedAvatar = await AsyncStorage.getItem("chosen_avatar");
      const storedAvatarDesc = await AsyncStorage.getItem("avatar_description");
      const storedBg = await AsyncStorage.getItem("chosen_background");

      if (!storedAvatar) {
        console.error("No avatar found in AsyncStorage.");
        setAvatarName("Unknown");
        setAvatarDesc("No description available.");
        return;
      }
      setAvatarName(storedAvatar);
      setAvatarDesc(storedAvatarDesc || "No description available.");
      chooseBg(storedBg || "bedroom");

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
      <Image source={getBgImage(chosenBg)} style={styles.backgroundImg} />

      {sessionStage === "intro" && (
        <>
          <AvatarAnimation avatarName={avatarName} />
          <TextBubble moreStyle={styles.textBubble} text={avatarWelcome[avatarName] || "Hello there!"} />
          <Button style={styles.button} clickable={true} text="Next" onPress={() => setSessionStage("workTopic")} />
        </>
      )}

      {sessionStage === "workTopic" && (
        <>
          <AvatarAnimation avatarName={avatarName} />
          <TextBubble moreStyle={styles.textBubble} text={"What are we working on today?"} />
          <ChatSection
            visible={sessionStage === "workTopic"}
            onClose={(message) => {
              setWorkTopic(message);
              setSessionStage("timeInput");
            }}
          />
        </>
      )}

      {sessionStage === "timeInput" && (
        <>
          <AvatarAnimation avatarName={avatarName} />
          <TextBubble moreStyle={styles.textBubble} text={"How long should we work for?"} />
          <ChatSection
            visible={sessionStage === "timeInput"}
            placeholder="Enter duration in minutes..."
            keyboardType="numeric"
            onClose={(message) => {
              const durationInSeconds = parseInt(message, 10) * 60;
              setSessionDuration(durationInSeconds);
              setSessionStage("timer");
            }}
          />
        </>
      )}

      {sessionStage === "timer" && (
        <WorkSession
          sessionDuration={sessionDuration}
          onQuit={() => setSessionStage("timeInput")
          }
          avatarName={avatarName}
        />
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
    top: 120,
    alignSelf: "center",
    zIndex: 1,
  },
  backgroundImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
    zIndex: -2,
  },
});

