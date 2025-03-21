import { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";

export default function CountdownOverlay({ onFinish }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) return;

    const interval = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [count]);

  useEffect(() => {
    if (count === 0) {
      onFinish();
    }
  }, [count, onFinish]); 

  return (
    <View style={styles.countdownOverlay}>
      <View style={styles.countdownCircle}>
        <Text style={styles.countdownNumber}>{count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
