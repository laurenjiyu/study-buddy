import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import WorkingAvatar from "@/components/WorkingAvatar";

export default function WorkSession({ sessionDuration, onQuit, avatarName }) {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false); // <-- NEW: For the confirmation popup

  const timerRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // -------------------- TIMER LOGIC --------------------
  useEffect(() => {
    if (!timerPaused) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev >= sessionDuration) {
            clearInterval(timerRef.current);
            return sessionDuration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerPaused]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: timerSeconds / sessionDuration,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timerSeconds]);

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
    // Actually quits the session
    clearInterval(timerRef.current);
    onQuit();
  };

  // This is called when user taps the X button
  const handleShowEndModal = () => {
    // Pause timer, then show the popup
    handlePause();
    setShowEndModal(true);
  };

  // Format time as HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <>
      <WorkingAvatar avatarName={avatarName} />

      <View style={styles.container}>
        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {formatTime(sessionDuration - timerSeconds)}
          </Text>
        </View>

        {/* Progress Bar */}
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

        {/* Controls */}
        <View style={styles.controls}>
          {/* Skip/fast-forward button (not implemented yet) */}
          <TouchableOpacity style={styles.controlButton}>
            <FontAwesome6 name="forward-fast" size={20} color="black" />
          </TouchableOpacity>

          {/* Pause / Resume */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={timerPaused ? handleResume : handlePause}
          >
            <FontAwesome6 name={timerPaused ? "play" : "pause"} size={20} color="black" />
          </TouchableOpacity>

          {/* Show the "End Session?" popup instead of quitting immediately */}
          <TouchableOpacity style={styles.controlButton} onPress={handleShowEndModal}>
            <FontAwesome6 name="xmark" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* -------------------- END SESSION POPUP -------------------- */}
        {showEndModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Ending the Session?</Text>
              
              <TouchableOpacity
                style={styles.quitButton}
                onPress={handleQuit}
              >
                <Text style={styles.quitButtonText}>Quit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.keepGoingButton}
                onPress={() => {
                  setShowEndModal(false); // Hide popup
                  handleResume();         // Resume timer
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

// -------------------- STYLES --------------------
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

  // -------------------- MODAL STYLES --------------------
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)", // Dim background
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
