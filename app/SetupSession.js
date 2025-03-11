import { useState, useEffect } from "react";
import { Text, Image, StyleSheet, View, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/Button";
import TextBubble from "@/components/TextBubble";
import ChatSection from "@/components/ChatSection";
import AvatarAnimation from "@/components/AvatarAnimation";
import { bgImages } from "@/assets/imgPaths";
import { avatarWelcome } from "@/assets/avatarInfo";
import WorkSession from "@/app/WorkSession";

function CountdownOverlay({ onFinish }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <View style={styles.countdownOverlay}>
      <View style={styles.countdownCircle}>
        <Text style={styles.countdownNumber}>{count}</Text>
      </View>
    </View>
  );
}

export default function SetupSession() {
  const [avatarName, setAvatarName] = useState("Loading...");
  const [avatarDesc, setAvatarDesc] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [chosenBg, chooseBg] = useState("bedroom");

  // Flow stages: 
  // "intro", "workTopic", "timeInput", "startSession", "countdown", "timer", "sessionEnded"
  const [sessionStage, setSessionStage] = useState("intro");
  const [workTopic, setWorkTopic] = useState("");
  const [sessionDuration, setSessionDuration] = useState(0);

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

      {/* 1) Intro Stage */}
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

      {/* 2) Work Topic Stage */}
      {sessionStage === "workTopic" && (
        <>
          <AvatarAnimation avatarName={avatarName} />
          <TextBubble
            moreStyle={styles.textBubble}
            text={"What are we working on today?"}
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

      {/* 3) Time Input Stage */}
      {sessionStage === "timeInput" && (
        <>
          <AvatarAnimation avatarName={avatarName} />
          <TextBubble
            moreStyle={styles.textBubble}
            text={"How long should we work for?"}
          />
          <ChatSection
            visible={sessionStage === "timeInput"}
            placeholder="Enter duration in minutes..."
            keyboardType="numeric"
            onClose={(message) => {
              const durationInSeconds = parseInt(message, 10) * 60;
              setSessionDuration(durationInSeconds);
              setSessionStage("startSession");
            }}
          />
        </>
      )}

      {/* 4) Confirmation Screen (startSession) */}
      {sessionStage === "startSession" && (
        <>
          <AvatarAnimation avatarName={avatarName} />
          <TextBubble
            moreStyle={styles.textBubble}
            text={"Sounds good! I'll start on my assignment too."}
          />

          <View style={styles.userTextBubble}>
            <Text style={styles.timeText}>
              {Math.floor(sessionDuration / 60)} minutes!
            </Text>
          </View>

          <View style={styles.bottomSheet}>
            <TouchableOpacity
              onPress={() => setSessionStage("timeInput")}
              style={styles.backButton}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.sessionText}>
              This is a {Math.floor(sessionDuration / 60)} minute work session.
            </Text>
            <Text style={styles.subText}>
              Feel free to incorporate as many breaks as you need
            </Text>
            <TouchableOpacity
              onPress={() => setSessionStage("countdown")}
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>
                Start the session →
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* 5) Countdown Stage */}
      {sessionStage === "countdown" && (
        <CountdownOverlay
          onFinish={() => setSessionStage("timer")}
        />
      )}

      {/* 6) Timer Stage */}
      {sessionStage === "timer" && (
        <WorkSession
          sessionDuration={sessionDuration}
          avatarName={avatarName}
          onSessionEnd={() => setSessionStage("sessionEnded")}
        />
      )}

      {/* 7) Session Ended Stage */}
      {sessionStage === "sessionEnded" && (
        <>
          <AvatarAnimation avatarName={avatarName} />
          <TextBubble
            moreStyle={styles.textBubble}
            text={"Thanks for the session! Let’s study again soon."}
          />
          <Button
            style={[styles.button, { bottom: 150 }]}
            clickable={true}
            text="Done"
            onPress={() => setSessionStage("intro")}
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
  userTextBubble: {
    position: "absolute",
    backgroundColor: "#B5F2EA",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    bottom: 320,
    right: 30,
    alignSelf: "flex-end",
    zIndex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 300,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 75,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 20,
  },
  backText: {
    fontSize: 24,
    color: "black",
  },
  sessionText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: "#D9D9D9",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  countdownCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  countdownNumber: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#000",
  },
});