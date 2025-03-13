import React, { useState, useEffect, useRef } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Audio } from "expo-av";

const BREAK_DURATION = 5 * 60;

export default function BreakCountdownModal({ visible, onCountdownFinish, onTick }) {
  const [countdown, setCountdown] = useState(BREAK_DURATION);

  // Store callbacks in refs to avoid adding them to effect dependencies.
  const onTickRef = useRef(onTick);
  const onCountdownFinishRef = useRef(onCountdownFinish);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    onCountdownFinishRef.current = onCountdownFinish;
  }, [onCountdownFinish]);

  // Debug: log visible and countdown every time they change.
  useEffect(() => {
    console.log("BreakCountdownModal - visible:", visible, "countdown:", countdown);
  }, [visible, countdown]);

  // Set up the interval to decrement countdown when the modal is visible.
  useEffect(() => {
    if (!visible) return;
    setCountdown(BREAK_DURATION);
    const interval = setInterval(() => {
      setCountdown(prevCount => (prevCount > 0 ? prevCount - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  // On every countdown change, call onTick (but don't automatically resume when 0)
  useEffect(() => {
    if (!visible) return;
    if (countdown > 0) {
      onTickRef.current && onTickRef.current(1);
    }
  }, [countdown, visible]);

  // NEW: When countdown is 0 and the modal is open, repeatedly play the sound.
  // This effect will run every time [visible, countdown] changes.
  useEffect(() => {
    let soundInterval;
    if (visible && countdown === 0) {
      (async () => {
        try {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: false,
          });
          const { sound } = await Audio.Sound.createAsync(
            require("@/assets/sounds/break_end.m4a")
          );
          await sound.playAsync();
          // Unload after a short delay.
          setTimeout(() => sound.unloadAsync(), 2000);
        } catch (error) {
          console.error("Error playing sound:", error);
        }
      })();
    }
    return () => {
      if (soundInterval) clearInterval(soundInterval);
    };
  }, [visible, countdown]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Break Time</Text>
          <Text style={styles.countdownText}>{formatTime(countdown)}</Text>
          <TouchableOpacity style={styles.endButton} onPress={onCountdownFinish}>
            <Text style={styles.endButtonText}>Resume Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 20,
  },
  endButton: {
    backgroundColor: "#D9D9D9",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});
