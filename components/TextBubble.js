import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View } from "react-native";
import Theme from "@/assets/theme";

const TextBubble = ({ moreStyle, text, fromMe = false, triangleOnTop = false, typingSpeed = 40 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!text) return; // Prevent running effect if text is undefined/null

    setDisplayedText(""); // Reset before starting animation
    let index = 0;

    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index)); // Slicing ensures correct order
        index++;
      } else {
        clearInterval(interval);
      }
    }, typingSpeed);

    return () => clearInterval(interval); // Cleanup interval on text change/unmount
  }, [text, typingSpeed]);

  return (
    <View style={[styles.wrapper, moreStyle, fromMe && styles.myMessage]}>
      <View style={styles.mainBubble}>
        <Text style={styles.text}>{displayedText}</Text>
      </View>

      {/* Triangle pointing downwards */}
      <View style={[styles.triangle, triangleOnTop && styles.top]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    position: "absolute",
    maxWidth: "80%",
    minWidth: "30%",
  },
  mainBubble: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignSelf: "center",
    minWidth: "30%",
  },
  myMessage: {
    backgroundColor: Theme.colors.myBubbleBlue,
  },
  triangle: {
    position: "absolute",
    bottom: -20,
    left: "50%",
    marginLeft: -15,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
  top: {
    top: -20,
    bottom: "auto",
    borderBottomColor: "white",
    transform: [{ rotate: "-180deg" }],
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    alignSelf: "center",
  },
});

export default TextBubble;
