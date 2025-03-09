import React from "react";
import { Text, StyleSheet, View } from "react-native";
import Theme from "@/assets/theme";

const TextBubble = ({ moreStyle, text, contents, fromMe=false, triangleOnTop=false}) => {
  return (
    <View style={[styles.wrapper, moreStyle, fromMe && myMessage]}>
      <View style={styles.mainBubble}>
        {contents}
      </View>
    
      {/* Triangle pointing downwards */}
      <View style={[styles.triangle, triangleOnTop && styles.top]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center", // Centers the triangle with the bubble
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
    bottom: -20, // Adjust for placement
    left: "50%",
    marginLeft: -15, // Centers the triangle
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
    botton: "auto",
    borderBottomColor: "white",
    transform: [{ rotate: '-180deg' }], // Rotates the text -45 degrees
  },
  text: {
    fontSize: 20,
  },
});

export default TextBubble;
