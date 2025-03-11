import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import WorkingAvatar from "@/components/WorkingAvatar";
import TextBubble from "@/components/TextBubble";

export default function WorkSession({ sessionDuration, avatarName, onSessionEnd }) {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const timerRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationText, setMotivationText] = useState("");

  const getMotivation = () => {
    return "Keep going, you're doing great!";
  };

  // -------------------- TIMER LOGIC --------------------
  useEffect(() => {
    if (!timerPaused) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev >= sessionDuration) {
            clearInterval(timerRef.current);
            onSessionEnd();
            return sessionDuration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerPaused, sessionDuration]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: timerSeconds / sessionDuration,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timerSeconds, sessionDuration]);

  // -------------------- HANDLERS --------------------
  const handlePause = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerPaused(true);
  };

  const handleResume = () => {
    if (!timerRef.current) {
      setTimerPaused(false);
    }
  };

  const handleQuit = () => {
    clearInterval(timerRef.current);
    onSessionEnd();
  };

  const handleShowEndModal = () => {
    handlePause();
    setShowEndModal(true);
  };

  const handleAvatarPress = () => {
    const message = getMotivation();
    setMotivationText(message);
    setShowMotivation(true);
    setTimeout(() => setShowMotivation(false), 3000);
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <>
      <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
        <WorkingAvatar avatarName={avatarName} />
      </TouchableOpacity>

      {showMotivation && (
        <TextBubble
          moreStyle={styles.motivationBubble}
          text={motivationText}
        />
      )}

      <View style={styles.container}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {formatTime(sessionDuration - timerSeconds)}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>
            Working - {Math.floor(sessionDuration / 60)} min
          </Text>
          <Text style={styles.progressSubtitle}>
            {Math.floor((sessionDuration - timerSeconds) / 60)} min remaining
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

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <FontAwesome6 name="forward-fast" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={timerPaused ? handleResume : handlePause}>
            <FontAwesome6 name={timerPaused ? "play" : "pause"} size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleShowEndModal}>
            <FontAwesome6 name="xmark" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {showEndModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Ending the Session?</Text>
              
              <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
                <Text style={styles.quitButtonText}>Quit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.keepGoingButton}
                onPress={() => {
                  setShowEndModal(false);
                  handleResume();
                }}
              >
                <Text style={styles.keepGoingButtonText}>No, keep going</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    marginBottom: 20,
  },
  quitButton: {
    backgroundColor: "#D9D9D9",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 10,
  },
  quitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  keepGoingButton: {
    backgroundColor: "#B5F2EA",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  keepGoingButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
