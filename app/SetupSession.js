import { useState, useEffect, useRef } from "react";
import { Text, Image, StyleSheet, View, TextInput } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/Button";
import TextBubble from "@/components/TextBubble";
import ChatSection from "@/components/ChatSection";
import Theme from "@/assets/theme";
import AvatarAnimation from "@/components/AvatarAnimation";
import { avatarImages, bgImages } from "@/assets/imgPaths";
import { avatarWelcome } from "@/assets/avatarInfo";


export default function SetupSession() {
  const [avatarName, setAvatarName] = useState("Loading...");
  const [avatarDesc, setAvatarDesc] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [chosenBg, chooseBg] = useState("bedroom");

  // New state to manage the flow stages
  const [sessionStage, setSessionStage] = useState("intro"); // "intro", "workTopic", "timeInput", "timer"
  const [workTopic, setWorkTopic] = useState("");
  const [sessionDuration, setSessionDuration] = useState(""); // duration in minutes as string
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);

  const timerRef = useRef(null);
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

  // Timer initialization when entering the "timer" stage
  useEffect(() => {
    if (sessionStage === "timer") {
      const seconds = parseInt(sessionDuration, 10) * 60;
      setTimerSeconds(seconds);
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionStage]);

  const handlePause = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setTimerPaused(true);
    }
  };

  const handleResume = () => {
    if (!timerRef.current) {
      setTimerPaused(false);
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleQuit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Optionally, navigate away or reset values
    setSessionStage("timeInput");
    setTimerPaused(false);
  };

  // Helper to format seconds into mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image source={getBgImage(chosenBg)} style={styles.backgroundImg} />

      {sessionStage === "intro" && (
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
            onPress={() => setSessionStage("workTopic")}
          />
        </>
      )}

      {sessionStage === "workTopic" && (
        // ChatSection now captures the work topic and calls onClose with the input text
        <>
        <AvatarAnimation avatarName={avatarName} />
          <TextBubble
            moreStyle={styles.textBubble}
            text={"PLACEHOLDER: What are we working on today?"} // TODO: integrate with OpenAI
          />
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
          <TextBubble
            moreStyle={styles.textBubble}
            text={"PLACEHOLDER: How long should we work for?"} // TODO: integrate with OpenAI
          />
        <ChatSection
          visible={sessionStage === "timeInput"}
          placeholder="Enter duration in minutes..."
          keyboardType="numeric"
          onClose={(message) => {
            setSessionDuration(message);
            setSessionStage("timer");
          }}
        />
        </>
      )}

      {sessionStage === "timer" && (
        <View style={styles.timerContainer}>
          <Image style={styles.avatarImgInput} source={avatarImages[avatarName]} />
          <Text style={styles.timerText}>{formatTime(timerSeconds)}</Text>
          <View style={styles.timerButtons}>
            {!timerPaused ? (
              <Button text="Pause" clickable={true} onPress={handlePause} />
            ) : (
              <Button text="Resume" clickable={true} onPress={handleResume} />
            )}
            <Button text="Quit" clickable={true} onPress={handleQuit} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Original button style for the intro stage
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
  // New styles for the input stages
  inputContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatarImgInput: {
    height: 150,
    width: 150,
    resizeMode: "contain",
    marginBottom: 20,
  },
  textBubbleInput: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "white",
  },
  inputButton: {
    marginTop: 10,
  },
  backgroundImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
    zIndex: -2,
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    fontSize: 48,
    marginBottom: 20,
  },
  timerButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
  },
});
