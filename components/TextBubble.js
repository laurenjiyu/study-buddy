import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View } from "react-native";
import Theme from "@/assets/theme";

const TextBubble = ({ moreStyle, text, fromMe = false, triangleOnTop = false, typingSpeed = 40 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!text) return;

    setDisplayedText("");
    let index = 0;

    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [text, typingSpeed]);

  return (
    <View style={[styles.wrapper, moreStyle, fromMe && styles.myMessage]}>
      <View style={styles.mainBubble}>
        <Text style={styles.text}>{displayedText}</Text>
      </View>

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
    bottom: -15,
    left: "50%",
    marginLeft: -12,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
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
