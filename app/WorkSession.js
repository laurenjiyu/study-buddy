import React, { useState, useEffect, useRef } from "react";
import { Image, Text, View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import WorkingAvatar from "@/components/WorkingAvatar";
import TextBubble from "@/components/TextBubble";
import CountdownOverlay from "@/components/CountdownOverlay";
import { getCompletion } from "./OpenAI";
import { workingImages } from "@/assets/imgPaths";

export default function WorkSession({ sessionDuration, avatarName, onSessionEnd }) {
  const [workingSeconds, setWorkingSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState(null);

  const [timerPaused, setTimerPaused] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);

  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationText, setMotivationText] = useState("");

  const timerRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // -------------------- TIMER LOGIC --------------------
  useEffect(() => {
    if (!timerPaused) {
      timerRef.current = setInterval(() => {
        setWorkingSeconds((prev) => {
          if (prev >= sessionDuration) {
            clearInterval(timerRef.current);
            onSessionEnd({ workingSeconds: prev, breakSeconds });
            return sessionDuration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerPaused, sessionDuration, onSessionEnd, breakSeconds]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: workingSeconds / sessionDuration,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [workingSeconds, sessionDuration]);

  // -------------------- HANDLERS --------------------
  const handlePause = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerPaused(true);
    setShowPauseModal(true);
    setShowAnimation(false);
    setPauseStartTime(Date.now());
  };

  const handlePauseModalResume = () => {
    setShowPauseModal(false);
    setShowCountdown(true);
    setShowAnimation(true);
    if (pauseStartTime) {
      const pausedFor = Math.floor((Date.now() - pauseStartTime) / 1000);
      setBreakSeconds((prev) => prev + pausedFor);
      setPauseStartTime(null);
    }
  };

  const handleCountdownFinish = () => {
    setShowCountdown(false);
    setTimerPaused(false);
  };

  const handleQuit = () => {
    clearInterval(timerRef.current);
    onSessionEnd({ workingSeconds, breakSeconds });
  };

  const handleShowEndModal = () => {
    setShowAnimation(false);
    setTimerPaused(true);
    setShowEndModal(true);
  };

  const handleAvatarPress = async () => {
    try {
      setShowMotivation(false);
      const message = await getCompletion(
        `Persona: ${avatarName}. Provide a brief sentence of motivation for the user.`
      );
      setMotivationText(message);
      setShowMotivation(true);
      setTimeout(() => setShowMotivation(false), 8000);
    } catch (error) {
      console.error("Error fetching motivation:", error);
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <>
      {showAnimation ? (
        <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
          <WorkingAvatar avatarName={avatarName} />
        </TouchableOpacity>
      ) : (
        <Image source={workingImages[`${avatarName}1`]} style={styles.avatarImg} />
      )}

      {showMotivation && (
        <TextBubble moreStyle={styles.motivationBubble} text={motivationText} />
      )}

      <View style={styles.container}>
        {/* Display time left (sessionDuration - workingSeconds) */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {formatTime(sessionDuration - workingSeconds)}
          </Text>
        </View>

        {/* Progress bar & info */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>
            Working - {Math.floor(sessionDuration / 60)} min
          </Text>
          <Text style={styles.progressSubtitle}>
            {Math.floor((sessionDuration - workingSeconds) / 60)} min remaining
          </Text>
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <FontAwesome6 name="forward-fast" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={timerPaused ? handlePauseModalResume : handlePause}
          >
            <FontAwesome6
              name={timerPaused ? "play" : "pause"}
              size={20}
              color="black"
            />
          </TouchableOpacity>
          {/* For ending session early, just call handleQuit */}
          <TouchableOpacity style={styles.controlButton} onPress={handleQuit}>
            <FontAwesome6 name="xmark" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* Paused Modal */}
        {showPauseModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Paused</Text>
              <Text style={styles.modalSubtitle}>
                Ok, but don’t take too long! Come back soon!
              </Text>
              <TouchableOpacity style={styles.resumeButton} onPress={handlePauseModalResume}>
                <Text style={styles.resumeButtonText}>Resume</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Countdown overlay shown after pausing, before resuming */}
        {showCountdown && <CountdownOverlay onFinish={handleCountdownFinish} />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  timerContainer: {
    position: "absolute",
    top: 90,
    transform: [{ translateX: 85 }],
    backgroundColor: "#94B2A7",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  timerText: {
    fontSize: 28,
    color: "black",
    fontWeight: "bold",
  },
  progressContainer: {
    position: "absolute",
    bottom: 100,
    width: "85%",
    backgroundColor: "#94B2A7",
    padding: 15,
    borderRadius: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  progressSubtitle: {
    fontSize: 14,
    color: "black",
    marginBottom: 5,
  },
  progressBackground: {
    height: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "black",
    borderRadius: 5,
  },
  controls: {
    position: "absolute",
    bottom: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  motivationBubble: {
    position: "absolute",
    top: 250,
    alignSelf: "center",
    zIndex: 2,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
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
  resumeButton: {
    backgroundColor: "#D9D9D9",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  resumeButtonText: {
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
    height: 400,
    width: 400,
    position: "absolute",
    marginTop: "75%",
  },
});
