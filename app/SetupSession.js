import { useState, useEffect } from "react";
import { Text, Image, StyleSheet, View, TouchableOpacity, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AITextBubble from "@/components/AITextBubble";
import AvatarAnimation from "@/components/AvatarAnimation";
import CountdownOverlay from "@/components/CountdownOverlay";
import { bgImages, workingImages } from "@/assets/imgPaths";
import WorkSession from "@/app/WorkSession";
import ChatSection from "@/components/ChatSection";
import Intro from "@/components/SessionSetup/Intro";


export default function SetupSession() {
  const [avatarName, setAvatarName] = useState("Loading...");
  const [avatarDesc, setAvatarDesc] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [chosenBg, chooseBg] = useState("bedroom");

  // Flow stages: "intro", "workTopic", "timeInput", "startSession", "countdown", "timer", "sessionEnded", "statistics"
  const [sessionStage, setSessionStage] = useState("intro");
  const [workTopic, setWorkTopic] = useState("");
  const [sessionDuration, setSessionDuration] = useState(0);

  const [totalWorkingSeconds, setTotalWorkingSeconds] = useState(0);
  const [totalBreakSeconds, setTotalBreakSeconds] = useState(0);
  const [mode, setMode] = useState("working");

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

  const handleSessionEnd = ({ workingSeconds, breakSeconds }) => {
    setTotalWorkingSeconds(workingSeconds);
    setTotalBreakSeconds(breakSeconds);
    setSessionStage("sessionEnded");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image source={getBgImage(chosenBg)} style={styles.backgroundImg} />

      {/* 1) Intro Stage */}
      {sessionStage === "intro" && (
        <SafeAreaView style={styles.container}>
          <Intro avatarName={avatarName} setSessionStage={setSessionStage} />
        </SafeAreaView>
      )}

      {/* 2) Work Topic Stage */}
      {sessionStage === "workTopic" && (
        <>
          <AvatarAnimation avatarName={avatarName} />
          <AITextBubble
            prompt={`Persona: ${avatarName}. Ask the user what they'd like to work on today.`}
            moreStyle={styles.textBubble}
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
          <AITextBubble
            prompt={`Persona: ${avatarName}. Ask how long they'd like to work on their task for (if the task is appropriate, otherwise don't reference it). User task: ${workTopic}`}
            moreStyle={styles.textBubble}
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
          <AITextBubble
            prompt={`Persona: ${avatarName}. Tell the user that you are both getting started on your work.`}
            moreStyle={styles.textBubble}
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
              Feel free to incorporate as many breaks as you need, and tap {avatarName} for motivation at any point!
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
        <CountdownOverlay onFinish={() => setSessionStage("timer")} />
      )}

      {/* 6) Timer Stage */}
      {sessionStage === "timer" && (
        <WorkSession
          sessionDuration={sessionDuration}
          avatarName={avatarName}
          onSessionEnd={handleSessionEnd}
          mode={mode}
        />
      )}

      {/* 7) Session Ended Stage: Modal for break/continue/end */}
      {sessionStage === "sessionEnded" && (
        <>
          <Image source={workingImages[`${avatarName}1`]} style={styles.avatarImg} />
          <AITextBubble
            prompt={`Persona: ${avatarName}. The user just ended their work session. Close the session.`}
            moreStyle={styles.textBubble}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.stackedButton} onPress={() => setSessionStage("statistics")}>
              <Text style={styles.buttonText}>View summary</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.stackedButton, { backgroundColor: "#87ADA9" }]}
              onPress={() => setSessionStage("timeInput")}
            >
              <Text style={styles.buttonText}>Begin another session</Text>
            </TouchableOpacity>
          </View>
        </>

      )}


      {/* 8) Statistics Stage */}
      {sessionStage === "statistics" && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.statsTitle}>Session Summary</Text>
            <Text style={styles.statsText}>
              {Math.floor(totalWorkingSeconds / 60)} minutes working
            </Text>
            <Text style={styles.statsText}>
              {Math.floor(totalBreakSeconds / 60)} minutes on break
            </Text>
            <TouchableOpacity
              style={[styles.stackedButton, { backgroundColor: "#87ADA9", marginTop: 35 }]}
              onPress={() => setSessionStage("timeInput")}
            >
              <Text style={styles.statsButtonText}>Start Another Session</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stackedButton}
              onPress={() => setSessionStage("intro")}
            >
              <Text style={styles.statsButtonText}>Go Home</Text>
            </TouchableOpacity>

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
    fontSize: 20,
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
    justifyContent: "center",
    alignItems: "center",     
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 4,
  },
  modalContainer: {
    width: "75%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#D9D9D9",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  statsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statsText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statsButton: {
    backgroundColor: "#D9D9D9",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  statsButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
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
  avatarImg: {
    height: 800,             // Fixed height
    width: 400,              // Fixed width
    position: "absolute",  
    bottom: -200 
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  stackedButton: {
    marginVertical: 5,
    width: '80%',
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: "#D9D9D9",
    alignItems: 'center',
    borderRadius: 40,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "black",
  },
});
